import { QuestionItem } from '../types';
import { normalizeVietnamesePdfText, parseMathDocumentOffline } from './vietnameseTextNormalizer';

// Rock-solid model list: Highly available & resilient production models first
const FALLBACK_MODELS = [
  'gemini-2.5-flash',       // Highest capacity, ultra-fast, zero "high demand" errors
  'gemini-2.0-flash',       // Next-gen high throughput
  'gemini-1.5-flash',       // Proven production stability
  'gemini-3-flash-preview', // High intelligence preview
  'gemini-3-pro-preview',   // Deep reasoning
];

/**
 * Direct Gemini REST API caller with automatic model fallback, text normalization & offline backup
 */
export async function processDocWithGemini(
  rawText: string,
  subject: string,
  templateId: string,
  enableAiSolve: boolean
): Promise<{ questions: QuestionItem[]; modelUsed: string }> {
  const apiKey = localStorage.getItem('user_gemini_api_key') || '';
  const selectedModel = localStorage.getItem('user_gemini_model') || 'gemini-2.5-flash';

  // Normalize broken Vietnamese character spacing from PDF exports
  const cleanText = normalizeVietnamesePdfText(rawText);

  if (!apiKey || apiKey.trim().length === 0) {
    // If no API key is provided, run intelligent local parser immediately
    const offlineQs = parseMathDocumentOffline(cleanText);
    if (offlineQs.length > 0) {
      return { questions: offlineQs, modelUsed: 'Bộ phân tích Toán học Nội bộ' };
    }
    throw new Error('API_KEY_MISSING: Vui lòng nhập Google Gemini API Key trong nút "Settings (API Key)" để sử dụng AI.');
  }

  const shouldSolve = enableAiSolve !== false;

  const systemInstruction = `Bạn là Chuyên gia Tự động hóa Tài liệu Toán học & Sư phạm Việt Nam (DocuSmart Math AI Architect).
Nhiệm vụ của bạn:
1. Phân tách TOÀN BỘ các câu hỏi trong đề thi (Câu 1, Câu 2, ..., Câu n) mà KHÔNG GỘP CHUNG hoặc bỏ sót câu nào.
2. BẢO TỒN NGUYÊN VẸN 100% CÔNG THỨC TOÁN HỌC DẠNG LATEX KẸP DẤU $...$ HOẶC $$...$$.
3. Với mỗi câu hỏi:
   - Phân loại chuẩn:
     + multiple_choice: Trắc nghiệm 4 lựa chọn (A, B, C, D)
     + true_false_group: Trắc nghiệm Đúng / Sai (Mỗi câu gồm 4 mệnh đề a, b, c, d với mảng tfItems chứa letter: 'a'|'b'|'c'|'d', statement, isCorrect: true/false, explanation)
     + short_answer: Câu hỏi trả lời ngắn (điền số / biểu thức)
     + essay_problem: Bài toán tự luận / hình học không gian 3D
   - Mức độ nhận thức: NB, TH, VD, VDC
   - Hình học (mathFigure): coordinate_plane, pyramid_3d, cube_3d, triangle_geometry, variation_table, none.
   - ${shouldSolve ? 'Lời giải chi tiết từng bước (solution), phương pháp (keyMethod) và đáp án ngắn (answerKey).' : 'Để trống solution và answerKey.'}
   - Trả về JSON đúng định dạng: {"questions": [...]}`;

  const promptText = `${systemInstruction}\n\nHãy trích xuất, bảo tồn công thức LaTeX và giải chi tiết các câu hỏi trong văn bản sau:\n\n${cleanText}`;

  // Prioritize selected model, then cycle through all available production models
  const modelsToTry = [
    selectedModel,
    ...FALLBACK_MODELS.filter((m) => m !== selectedModel),
  ];
  let lastError: any = null;

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
          temperature: 0.1,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const statusMsg = errorJson?.error?.message || `HTTP ${response.status} (${response.statusText})`;
        
        // If high demand or rate limit, immediately try next model without throwing
        if (response.status === 503 || response.status === 429 || statusMsg.includes('high demand')) {
          console.warn(`Model ${m} đang quá tải, tự động chuyển sang model tiếp theo...`);
          lastError = new Error(statusMsg);
          continue;
        }
        throw new Error(statusMsg);
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
      console.warn(`Model ${m} gặp lỗi:`, err.message);
      lastError = err;
    }
  }

  // If all models failed or network issue, fallback to intelligent offline parser on normalized text
  const offlineParsed = parseMathDocumentOffline(cleanText);
  if (offlineParsed.length > 0) {
    return { questions: offlineParsed, modelUsed: 'Bộ bóc tách Toán học Nội bộ' };
  }

  throw lastError || new Error('Tất cả các model Gemini đều thất bại.');
}

/**
 * Generate Math Exam from Prompt & Matrix with automatic model retry & offline backup
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
  const selectedModel = localStorage.getItem('user_gemini_model') || 'gemini-2.5-flash';

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

  const modelsToTry = [
    selectedModel,
    ...FALLBACK_MODELS.filter((m) => m !== selectedModel),
  ];
  let lastError: any = null;

  for (const m of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey.trim()}`;
      
      const payload = {
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const statusMsg = errorJson?.error?.message || `HTTP ${response.status} (${response.statusText})`;
        if (response.status === 503 || response.status === 429 || statusMsg.includes('high demand')) {
          console.warn(`Model ${m} đang quá tải khi tạo đề, tự động chuyển sang model tiếp theo...`);
          lastError = new Error(statusMsg);
          continue;
        }
        throw new Error(statusMsg);
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
