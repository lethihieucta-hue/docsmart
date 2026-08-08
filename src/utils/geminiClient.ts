import { QuestionItem } from '../types';

const FALLBACK_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
  'gemini-3.6-flash',
];

/**
 * Direct Gemini REST API caller with automatic model fallback & structured JSON parsing
 */
export async function processDocWithGemini(
  rawText: string,
  subject: string,
  templateId: string,
  enableAiSolve: boolean
): Promise<{ questions: QuestionItem[]; modelUsed: string }> {
  const apiKey = localStorage.getItem('user_gemini_api_key') || '';
  const selectedModel = localStorage.getItem('user_gemini_model') || 'gemini-3-flash-preview';

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('API_KEY_MISSING: Vui lòng nhập Google Gemini API Key trong nút "Settings (API Key)" để sử dụng AI.');
  }

  const shouldSolve = enableAiSolve !== false;

  const systemInstruction = `Bạn là Chuyên gia Tự động hóa Tài liệu Toán học & Sư phạm Việt Nam (DocuSmart Math AI Architect).
Nhiệm vụ của bạn:
1. Nhận văn bản thô (đề thi THPT Quốc Gia, kiểm tra 1 tiết, phiếu bài tập, chuyên đề) và trích xuất TOÀN BỘ các câu hỏi mà KHÔNG BỎ SÓT.
2. BẢO TỒN NGUYÊN VẸN 100% các công thức Toán học bằng định dạng LaTeX chuẩn kẹp trong dấu đô-la đơn $...$ cho công thức nội dòng hoặc $$...$$ cho công thức khối.
   Ví dụ: $y = ax^2+bx+c$, $\\int_{0}^{1} x e^x dx$, $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$, $\\vec{v}$, $\\overrightarrow{AB}$, $\\Delta = b^2 - 4ac$, $S.ABCD$.
3. Với mỗi câu hỏi:
   - Phân loại chuẩn xác:
     + multiple_choice: Trắc nghiệm 4 lựa chọn (A, B, C, D)
     + true_false_group: Trắc nghiệm Đúng / Sai (Cấu trúc mới gồm 4 mệnh đề a, b, c, d có trường tfItems)
     + short_answer: Câu hỏi trả lời ngắn (điền số / biểu thức)
     + essay_problem: Bài toán tự luận / hình học / chứng minh
   - Phân loại Mức độ nhận thức chuẩn Bộ GD&ĐT: NB (Nhận biết), TH (Thông hiểu), VD (Vận dụng), VDC (Vận dụng cao).
   - Nhận diện Hình học (Math Figure):
     + Nếu bài toán về đồ thị hàm số bậc 2, bậc 3, phân thức: mathFigure = { type: "coordinate_plane", caption: "Đồ thị hàm số..." }
     + Nếu bài toán về hình chóp S.ABCD, S.ABC: mathFigure = { type: "pyramid_3d", caption: "Hình chóp S.ABCD..." }
     + Nếu bài toán về hình lập phương, lăng trụ: mathFigure = { type: "cube_3d", caption: "Hình lập phương..." }
     + Nếu bài toán về tam giác, đường tròn nội/ngoại tiếp: mathFigure = { type: "triangle_geometry", caption: "Tam giác ABC..." }
     + Nếu bài toán về khảo sát, bảng biến thiên: mathFigure = { type: "variation_table", caption: "Bảng biến thiên..." }
     + Nếu không có hình: mathFigure = { type: "none" }
   - ${shouldSolve ? 'Giải bài tập CHI TIẾT từng bước: keyMethod (phương pháp), solution (lời giải), answerKey (mã đáp án).' : 'Để trống trường solution và answerKey.'}
   - Tính toán không gian làm bài:
     + Trắc nghiệm 4 PA: spaceType = "none", calculatedLines = 0.
     + Trắc nghiệm Đúng/Sai & Trả lời ngắn: spaceType = "lines", calculatedLines = 4 dòng.
     + Tự luận / Hình học không gian: spaceType = "grid_box", calculatedLines = 8 đến 12 dòng.
QUAN TRỌNG: Trả về kết quả ĐÚNG định dạng JSON theo schema: {"questions": [...]}`;

  const promptText = `${systemInstruction}\n\nHãy trích xuất, bảo tồn công thức LaTeX và giải chi tiết các câu hỏi trong văn bản sau:\n\n${rawText}`;

  // Retry sequence across models
  const modelsToTry = [selectedModel, ...FALLBACK_MODELS.filter((m) => m !== selectedModel)];
  let lastError: any = null;

  // 1. Try Backend First (if running in full-stack dev server)
  try {
    const backendRes = await fetch('/api/process-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawText,
        subject,
        templateId,
        enableAiSolve,
        apiKey,
        model: selectedModel,
      }),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        return { questions: data.questions, modelUsed: selectedModel };
      }
    }
  } catch (backendErr) {
    console.log('Backend not available or failed, switching to direct client-side Gemini REST API...');
  }

  // 2. Direct Client-side Gemini REST API calls with model retry
  for (const m of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey.trim()}`;
      
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: promptText }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const statusText = errorJson?.error?.message || `HTTP ${response.status} (${response.statusText})`;
        throw new Error(statusText);
      }

      const data = await response.json();
      const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!rawOutput) {
        throw new Error('Gemini phản hồi dữ liệu rỗng.');
      }

      // Parse JSON
      let parsedJson: any = {};
      try {
        parsedJson = JSON.parse(rawOutput);
      } catch (jsonErr) {
        // Fallback sanitize json in case of markdown wrapping
        const cleanJsonStr = rawOutput.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        parsedJson = JSON.parse(cleanJsonStr);
      }

      const rawQuestions = parsedJson.questions || [];
      if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
        throw new Error('Không tìm thấy danh sách câu hỏi trong phản hồi JSON.');
      }

      const formattedQuestions: QuestionItem[] = rawQuestions.map((q: any, idx: number) => ({
        id: `q_gemini_${Date.now()}_${idx}`,
        number: q.number || idx + 1,
        type: q.type || (q.tfItems && q.tfItems.length > 0 ? 'true_false_group' : q.options && q.options.length > 0 ? 'multiple_choice' : 'short_answer'),
        cognitiveLevel: q.cognitiveLevel || (idx < 2 ? 'NB' : idx < 4 ? 'TH' : 'VD'),
        questionText: q.questionText || '',
        options: q.options || [],
        tfItems: q.tfItems || [],
        solution: q.solution || 'Lời giải chi tiết từng bước.',
        keyMethod: q.keyMethod || '',
        mistakeWarning: q.mistakeWarning || '',
        answerKey: q.answerKey || (q.tfItems ? q.tfItems.map((t: any) => `${t.letter}: ${t.isCorrect ? 'Đ' : 'S'}`).join(', ') : ''),
        spaceType: q.spaceType || (q.type === 'multiple_choice' ? 'none' : q.type === 'essay_problem' ? 'grid_box' : 'lines'),
        calculatedLines: q.calculatedLines || (q.type === 'essay_problem' ? 10 : 4),
        difficulty: q.difficulty || 'medium',
        topic: q.topic || 'Toán học THPT',
        mathFigure: q.questionText.includes('parabol') || q.questionText.includes('đồ thị')
          ? { type: 'coordinate_plane', caption: 'Đồ thị minh họa hàm số' }
          : q.questionText.includes('hình chóp') || q.questionText.includes('S.ABCD')
          ? { type: 'pyramid_3d', caption: 'Hình chóp S.ABCD trong không gian 3D' }
          : q.questionText.includes('lập phương')
          ? { type: 'cube_3d', caption: 'Hình lập phương ABCD.A\'B\'C\'D\'' }
          : q.questionText.includes('tam giác')
          ? { type: 'triangle_geometry', caption: 'Tam giác ABC và đường tròn nội tiếp' }
          : q.questionText.includes('bảng biến thiên')
          ? { type: 'variation_table', caption: 'Bảng biến thiên hàm số' }
          : { type: 'none' },
      }));

      return { questions: formattedQuestions, modelUsed: m };
    } catch (err: any) {
      console.warn(`Model ${m} thất bại:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('Tất cả các model Gemini đều thất bại.');
}

/**
 * Generate Math Exam from Prompt & Topic with direct client-side fallback
 */
export async function generateExamByPromptWithGemini(
  topic: string,
  gradeLevel: string,
  mcCount: number,
  tfCount: number,
  shortAnswerCount: number,
  essayCount: number
): Promise<{ questions: QuestionItem[] }> {
  const apiKey = localStorage.getItem('user_gemini_api_key') || '';
  const selectedModel = localStorage.getItem('user_gemini_model') || 'gemini-3-flash-preview';

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('API_KEY_MISSING: Vui lòng nhập Google Gemini API Key trong nút "Settings (API Key)".');
  }

  const promptText = `Bạn là Chuyên gia Biên soạn Đề thi Toán học Việt Nam chuẩn Chương trình GDPT mới nhất của Bộ GD&ĐT.
Hãy tạo một đề thi toán học hoàn chỉnh cho chủ đề "${topic}", khối lớp ${gradeLevel} với chính xác:
- ${mcCount || 0} câu trắc nghiệm 4 lựa chọn A-B-C-D (type: "multiple_choice")
- ${tfCount || 0} câu trắc nghiệm Đúng/Sai 4 ý a-b-c-d (type: "true_false_group", với mảng tfItems chứa letter: 'a'|'b'|'c'|'d', statement, isCorrect: true/false, explanation)
- ${shortAnswerCount || 0} câu trả lời ngắn (type: "short_answer")
- ${essayCount || 0} câu tự luận / hình học 3D (type: "essay_problem")

BẢO TỒN VÀ DÙNG 100% CÔNG THỨC TOÁN HỌC DẠNG LATEX KẸP DẤU $...$ HOẶC $$...$$.
Có lời giải chi tiết (solution), phương pháp cốt lõi (keyMethod) và đáp án ngắn (answerKey).
Trả về JSON đúng định dạng: {"questions": [...]}`;

  const modelsToTry = [selectedModel, ...FALLBACK_MODELS.filter((m) => m !== selectedModel)];
  let lastError: any = null;

  for (const m of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey.trim()}`;
      
      const payload = {
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson?.error?.message || `HTTP ${response.status} (${response.statusText})`);
      }

      const data = await response.json();
      const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      let parsedJson: any = {};
      try {
        parsedJson = JSON.parse(rawOutput);
      } catch (jsonErr) {
        const cleanJsonStr = rawOutput.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        parsedJson = JSON.parse(cleanJsonStr);
      }

      const generatedQuestions = (parsedJson.questions || []).map((q: any, idx: number) => ({
        id: `q_gen_${Date.now()}_${idx}`,
        number: idx + 1,
        type: q.type || (q.tfItems && q.tfItems.length > 0 ? 'true_false_group' : q.options && q.options.length > 0 ? 'multiple_choice' : 'short_answer'),
        cognitiveLevel: q.cognitiveLevel || (idx < 2 ? 'NB' : idx < 4 ? 'TH' : 'VD'),
        questionText: q.questionText || '',
        options: q.options || [],
        tfItems: q.tfItems || [],
        solution: q.solution || 'Lời giải chi tiết đang được cập nhật.',
        keyMethod: q.keyMethod || '',
        mistakeWarning: q.mistakeWarning || '',
        answerKey: q.answerKey || (q.tfItems ? q.tfItems.map((t: any) => `${t.letter}: ${t.isCorrect ? 'Đ' : 'S'}`).join(', ') : ''),
        spaceType: q.spaceType || (q.type === 'multiple_choice' ? 'none' : q.type === 'essay_problem' ? 'grid_box' : 'lines'),
        calculatedLines: q.calculatedLines || (q.type === 'essay_problem' ? 10 : 4),
        difficulty: q.difficulty || 'medium',
        topic: q.topic || topic,
        mathFigure: q.questionText.includes('parabol') || q.questionText.includes('đồ thị')
          ? { type: 'coordinate_plane', caption: 'Đồ thị minh họa hàm số' }
          : q.questionText.includes('hình chóp') || q.questionText.includes('S.ABCD')
          ? { type: 'pyramid_3d', caption: 'Hình chóp S.ABCD trong không gian 3D' }
          : q.questionText.includes('lập phương')
          ? { type: 'cube_3d', caption: 'Hình lập phương ABCD.A\'B\'C\'D\'' }
          : q.questionText.includes('tam giác')
          ? { type: 'triangle_geometry', caption: 'Tam giác ABC và đường tròn nội tiếp' }
          : q.questionText.includes('bảng biến thiên')
          ? { type: 'variation_table', caption: 'Bảng biến thiên hàm số' }
          : { type: 'none' },
      }));

      return { questions: generatedQuestions };
    } catch (err: any) {
      console.warn(`Tạo đề bằng model ${m} thất bại:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('Tất cả các model tạo đề thi đều thất bại.');
}
