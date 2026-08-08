import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Helper function to create Gemini client with custom user key or environment key
function getGeminiClient(customApiKey?: string) {
  const key = customApiKey || process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback model list as specified in AI_INSTRUCTIONS.md
const FALLBACK_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
  'gemini-3.6-flash',
];

// API Route 1: Process Raw Math Document with Intelligence Logic & LaTeX Preservation
app.post('/api/process-doc', async (req, res) => {
  try {
    const { rawText, subject, templateId, enableAiSolve, apiKey, model } = req.body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return res.status(400).json({ error: 'Nội dung thô không được để trống.' });
    }

    const ai = getGeminiClient(apiKey);
    const shouldSolve = enableAiSolve !== false;

    const systemInstruction = `Bạn là Chuyên gia Tự động hóa Tài liệu Toán học & Sư phạm Việt Nam (DocuSmart Math AI Architect).
Nhiệm vụ của bạn:
1. Nhận văn bản thô (đề thi THPT Quốc Gia, kiểm tra 1 tiết, phiếu bài tập, chuyên đề) và trích xuất TOÀN BỘ các câu hỏi mà KHÔNG BỎ SÓT.
2. BẢO TỒN NGUYÊN VẸN 100% các công thức Toán học bằng định dạng LaTeX chuẩn kẹp trong dấu đô-la đơn $...$ cho công thức nội dòng hoặc $$...$$ cho công thức khối.
   Ví dụ: $y = ax^2+bx+c$, $\\int_{0}^{1} x e^x dx$, $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$, $\\vec{v}$, $\\overrightarrow{AB}$, $\\Delta = b^2 - 4ac$, $S.ABCD$.
3. Với mỗi câu hỏi:
   - Phân loại chuẩn xác:
     + multiple_choice: Trắc nghiệm 4 lựa chọn (A, B, C, D)
     + true_false_group: Trắc nghiệm Đúng / Sai (Cấu trúc mới nhất của Bộ GD gồm 4 mệnh đề a, b, c, d với trường tfItems)
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
     + Tự luận / Hình học không gian: spaceType = "grid_box", calculatedLines = 8 đến 12 dòng.`;

    const prompt = `Hãy trích xuất, bảo tồn công thức LaTeX và giải chi tiết các câu hỏi trong văn bản sau:\n\n${rawText}`;

    let response: any = null;
    let selectedModel = model || 'gemini-3-flash-preview';

    // Retry mechanism across fallback models
    const modelsToTry = [selectedModel, ...FALLBACK_MODELS.filter((m) => m !== selectedModel)];
    let lastError: any = null;

    for (const m of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: m,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  description: 'Danh sách các câu hỏi đã trích xuất, bảo tồn LaTeX và giải chi tiết',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      number: { type: Type.INTEGER },
                      type: {
                        type: Type.STRING,
                        description: 'multiple_choice | true_false_group | short_answer | essay_problem',
                      },
                      cognitiveLevel: {
                        type: Type.STRING,
                        description: 'NB | TH | VD | VDC',
                      },
                      questionText: { type: Type.STRING, description: 'Nội dung câu hỏi chứa LaTeX $...$' },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'Các phương án A, B, C, D nếu là trắc nghiệm 4 PA',
                      },
                      tfItems: {
                        type: Type.ARRAY,
                        description: '4 mệnh đề a, b, c, d nếu là trắc nghiệm Đúng/Sai',
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            letter: { type: Type.STRING, description: 'a | b | c | d' },
                            statement: { type: Type.STRING, description: 'Nội dung mệnh đề kèm LaTeX $...$' },
                            isCorrect: { type: Type.BOOLEAN, description: 'true nếu Đúng, false nếu Sai' },
                            explanation: { type: Type.STRING, description: 'Giải thích chi tiết' },
                          },
                          required: ['letter', 'statement', 'isCorrect'],
                        },
                      },
                      solution: { type: Type.STRING, description: 'Lời giải chi tiết từng bước' },
                      keyMethod: { type: Type.STRING, description: 'Phương pháp / Công thức cốt lõi' },
                      mistakeWarning: { type: Type.STRING, description: 'Lưu ý / Sai lầm học sinh dễ mắc' },
                      answerKey: { type: Type.STRING, description: 'Mã đáp án hoặc kết quả ngắn' },
                      spaceType: {
                        type: Type.STRING,
                        description: 'lines | grid_box | blank_box | none',
                      },
                      calculatedLines: { type: Type.INTEGER, description: 'Số dòng kẻ hoặc ô trống' },
                      difficulty: { type: Type.STRING, description: 'easy | medium | hard | olympiad' },
                      topic: { type: Type.STRING, description: 'Chủ đề kiến thức Toán' },
                    },
                    required: ['number', 'type', 'questionText', 'solution', 'spaceType', 'calculatedLines', 'difficulty'],
                  },
                },
              },
              required: ['questions'],
            },
          },
        });
        if (response && response.text) break;
      } catch (err: any) {
        console.warn(`Model ${m} failed, trying next fallback model... Error:`, err.message);
        lastError = err;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('Không thể kết nối với dịch vụ Gemini AI.');
    }

    const parsedJson = JSON.parse(response.text || '{}');
    const rawQuestions = parsedJson.questions || [];

    const formattedQuestions = rawQuestions.map((q: any, idx: number) => ({
      id: `q_ai_${Date.now()}_${idx}`,
      number: q.number || idx + 1,
      type: q.type || (q.tfItems && q.tfItems.length > 0 ? 'true_false_group' : q.options && q.options.length > 0 ? 'multiple_choice' : 'short_answer'),
      cognitiveLevel: q.cognitiveLevel || (idx < 2 ? 'NB' : idx < 4 ? 'TH' : 'VD'),
      questionText: q.questionText || '',
      options: q.options || [],
      tfItems: q.tfItems || [],
      solution: q.solution || 'Lời giải đang cập nhật.',
      keyMethod: q.keyMethod || '',
      mistakeWarning: q.mistakeWarning || '',
      answerKey: q.answerKey || (q.tfItems ? q.tfItems.map((t: any) => `${t.letter}: ${t.isCorrect ? 'Đ' : 'S'}`).join(', ') : ''),
      spaceType: q.spaceType || 'lines',
      calculatedLines: q.calculatedLines || 4,
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

    const shortAnswerCount = formattedQuestions.filter((q: any) => q.spaceType === 'lines' && q.type !== 'true_false_group').length;
    const essayCount = formattedQuestions.filter((q: any) => q.spaceType === 'grid_box' || q.spaceType === 'blank_box').length;
    const mcCount = formattedQuestions.filter((q: any) => q.type === 'multiple_choice').length;
    const tfCount = formattedQuestions.filter((q: any) => q.type === 'true_false_group').length;

    const result = {
      status: {
        received: true,
        parsedCount: formattedQuestions.length,
        solvedCount: formattedQuestions.length,
        message: `Đã tiếp nhận thành công văn bản Toán học. Trích xuất và bảo tồn KaTeX cho ${formattedQuestions.length} câu hỏi.`,
        timestamp: new Date().toLocaleTimeString('vi-VN'),
      },
      layoutPreview: {
        templateName: templateId || 'thpt_national',
        primaryColor: '#0f172a',
        fontName: 'Be Vietnam Pro / Merriweather / STIX Two Math',
        headerSummary: 'Chuẩn Bộ GD&ĐT (Mã đề, Logo Toán & Avatar Ths Lê Thị Hiếu)',
        footerSummary: 'Ths Lê Thị Hiếu - SĐT/Zalo 0939069119',
      },
      logicSummary: {
        shortAnswerCount,
        shortAnswerLinesAvg: 4,
        essayCount,
        essayBoxSizeAvg: 'Khung ô vuông lớn (8 - 12 dòng)',
        multipleChoiceCount: mcCount,
        trueFalseCount: tfCount,
        totalSpaceEstimatePages: Math.ceil(formattedQuestions.length / 4),
      },
      questions: formattedQuestions,
    };

    return res.json(result);
  } catch (err: any) {
    console.error('Error in /api/process-doc:', err);
    return res.status(500).json({ error: err.message || 'Lỗi khi xử lý tài liệu Toán học AI.' });
  }
});

// API Route 2: Generate Math Exam from Prompt & Matrix Specifications
app.post('/api/generate-exam-by-prompt', async (req, res) => {
  try {
    const { topic, gradeLevel, mcCount, tfCount, shortAnswerCount, essayCount, difficultyLevel, apiKey, model } = req.body;

    const ai = getGeminiClient(apiKey);
    const selectedModel = model || 'gemini-3-flash-preview';

    const systemInstruction = `Bạn là Chuyên gia Biên soạn Đề thi Toán học Việt Nam chuẩn Chương trình GDPT mới nhất của Bộ GD&ĐT.
Nhiệm vụ của bạn: Tự động sáng tạo bộ câu hỏi đề thi Toán học với chất lượng học thuật và sư phạm cao nhất.
Yêu cầu cụ thể:
1. Đúng chủ đề: ${topic}. Khối lớp: ${gradeLevel}.
2. Cấu trúc số lượng câu hỏi:
   - ${mcCount || 0} câu Trắc nghiệm 4 lựa chọn (A, B, C, D)
   - ${tfCount || 0} câu Trắc nghiệm Đúng / Sai (Cấu trúc mới: mỗi câu gồm 4 mệnh đề a, b, c, d; xác định chính xác isCorrect là true/false và giải thích)
   - ${shortAnswerCount || 0} câu Trả lời ngắn (điền kết quả)
   - ${essayCount || 0} câu Tự luận / Hình học không gian 3D
3. BẢO TỒN VÀ DÙNG 100% CÔNG THỨC TOÁN HỌC DẠNG LATEX KẸP DẤU $...$ HOẶC $$...$$.
4. Lời giải chi tiết (solution) từng bước, nêu rõ phương pháp (keyMethod), bẫy sai lầm (mistakeWarning) và mã đáp án ngắn (answerKey).`;

    const prompt = `Hãy tạo một đề thi toán học hoàn chỉnh cho chủ đề "${topic}", khối lớp ${gradeLevel} với chính xác:
- ${mcCount} câu trắc nghiệm 4 lựa chọn A-B-C-D
- ${tfCount} câu trắc nghiệm Đúng/Sai 4 ý a-b-c-d
- ${shortAnswerCount} câu trả lời ngắn
- ${essayCount} câu tự luận / hình học.`;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.INTEGER },
                  type: {
                    type: Type.STRING,
                    description: 'multiple_choice | true_false_group | short_answer | essay_problem',
                  },
                  cognitiveLevel: { type: Type.STRING, description: 'NB | TH | VD | VDC' },
                  questionText: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  tfItems: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        letter: { type: Type.STRING },
                        statement: { type: Type.STRING },
                        isCorrect: { type: Type.BOOLEAN },
                        explanation: { type: Type.STRING },
                      },
                      required: ['letter', 'statement', 'isCorrect'],
                    },
                  },
                  solution: { type: Type.STRING },
                  keyMethod: { type: Type.STRING },
                  mistakeWarning: { type: Type.STRING },
                  answerKey: { type: Type.STRING },
                  spaceType: { type: Type.STRING },
                  calculatedLines: { type: Type.INTEGER },
                  difficulty: { type: Type.STRING },
                  topic: { type: Type.STRING },
                },
                required: ['number', 'type', 'questionText', 'solution', 'spaceType', 'calculatedLines', 'difficulty'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
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

    return res.json({ questions: generatedQuestions });
  } catch (err: any) {
    console.error('Error in /api/generate-exam-by-prompt:', err);
    return res.status(500).json({ error: err.message || 'Lỗi khi tạo đề thi tự động từ AI.' });
  }
});

// Start Express Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DocuSmart Math Studio Server running on http://localhost:${PORT}`);
  });
}

startServer();
