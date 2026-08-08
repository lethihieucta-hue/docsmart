import { DocumentData, HeaderConfig, FooterConfig } from '../types';

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  schoolName: 'TRƯỜNG THPT CHÂU THÀNH A',
  departmentName: 'TỔ TOÁN - TIN HỌC',
  examTitle: 'ĐỀ ÔN TẬP TOÁN THPT QUỐC GIA',
  subject: 'MÔN: TOÁN HỌC - KHỐI 12',
  examCode: '101',
  duration: 'Thời gian làm bài: 90 phút (Không kể thời gian phát đề)',
  logoType: 'math',
  quote: 'CÓ HỌC MỚI THÀNH TÀI – MIỆT MÀI MỚI THÀNH GIỎI',
  teacherAvatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TeacherHieuChibi&hair=long01,curly&hairColor=2c1b18',
  teacherAvatarPreset: 'chibi_anime',
  showStudentInfoBox: true,
  showOpticalMarkSheet: true,
  bgStyle: 'pedagogical_topbar',
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  teacherName: 'Ths Lê Thị Hiếu',
  tagline: 'Tư duy có phương pháp. Thành công có lời giải.',
  contactPhone: '0939069119',
  contactZalo: 'zalo: 0939069119',
  showPageNumbers: true,
  bgStyle: 'banner',
};

export const SAMPLE_DOCUMENTS: DocumentData[] = [
  {
    title: 'Đề Ôn Tập THPT QG: Hàm Số & Hình Không Gian 3D',
    rawText: `Câu 1 (Trắc nghiệm): Cho hàm số $y = ax^2 + bx + c$ ($a \\neq 0$) có đồ thị là một parabol như hình vẽ. Tọa độ đỉnh $I$ của parabol là:
A. $I\\left(-\\frac{b}{2a}; -\\frac{\\Delta}{4a}\\right)$
B. $I\\left(\\frac{b}{2a}; \\frac{\\Delta}{4a}\\right)$
C. $I\\left(-\\frac{b}{a}; -\\frac{\\Delta}{2a}\\right)$
D. $I\\left(-\\frac{b}{2a}; \\frac{\\Delta}{4a}\\right)$

Câu 2 (Trắc nghiệm): Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình bình hành tâm $O$. Đường cao $SH \\perp (ABCD)$ với $H$ là trung điểm của $AB$. Khẳng định nào sau đây là đúng về các cạnh khuất?
A. Cạnh $AD, CD, SD, SH$ là các nét đứt
B. Cạnh $SB, SC$ là các nét đứt
C. Tất cả các cạnh đều là nét liền
D. Cạnh $BC$ là nét đứt

Câu 3 (Trả lời ngắn): Hãy tính tích phân $I = \\int_{0}^{1} (2x + 1) e^x dx$ và biểu diễn kết quả dưới dạng $a \\cdot e + b$ với $a, b \\in \\mathbb{Z}$.

Câu 4 (Trả lời ngắn): Cho tam giác $ABC$ có cạnh $a = 8$, $b = 10$, góc $\\widehat{C} = 60^\\circ$. Áp dụng định lý Cosin để tính độ dài cạnh $c$.

Câu 5 (Bài toán tự luận): Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$, cạnh bên $SA$ vuông góc với mặt phẳng đáy $(ABCD)$ và $SA = a\\sqrt{3}$.
a) Chứng minh rằng $BC \\perp (SAB)$ và tính thể tích khối chóp $S.ABCD$.
b) Tính góc giữa đường thẳng $SC$ và mặt phẳng $(ABCD)$.`,
    header: { ...DEFAULT_HEADER_CONFIG },
    footer: { ...DEFAULT_FOOTER_CONFIG },
    templateId: 'thpt_national',
    showAnswerKey: 'bottom',
    enableAiSolve: true,
    workingSpaceMode: 'auto',
    globalQuestionBoxStyle: 'simple_border',
    fontSize: 'base',
    lineHeight: 'normal',
    margin: 'normal',
    questions: [
      {
        id: 'q1',
        number: 1,
        type: 'multiple_choice',
        cognitiveLevel: 'NB',
        questionText: 'Cho hàm số $y = ax^2 + bx + c$ ($a \\neq 0$) có đồ thị là một parabol như hình vẽ bên. Tọa độ đỉnh $I$ của parabol là:',
        options: [
          'A. $I\\left(-\\frac{b}{2a}; -\\frac{\\Delta}{4a}\\right)$',
          'B. $I\\left(\\frac{b}{2a}; \\frac{\\Delta}{4a}\\right)$',
          'C. $I\\left(-\\frac{b}{a}; -\\frac{\\Delta}{2a}\\right)$',
          'D. $I\\left(-\\frac{b}{2a}; \\frac{\\Delta}{4a}\\right)$',
        ],
        solution: 'Theo lý thuyết hàm số bậc hai $y = ax^2 + bx + c$, đồ thị parabol có trục đối xứng là đường thẳng $x = -\\frac{b}{2a}$ và tọa độ đỉnh là $I\\left(-\\frac{b}{2a}; -\\frac{\\Delta}{4a}\\right)$ với $\\Delta = b^2 - 4ac$. Chọn đáp án A.',
        keyMethod: 'Công thức tọa độ đỉnh parabol $I(-b/2a; -\\Delta/4a)$.',
        mistakeWarning: 'Học sinh hay nhầm dấu trừ ở tung độ đỉnh $y_I = -\\Delta / 4a$.',
        answerKey: 'A',
        spaceType: 'none',
        calculatedLines: 0,
        difficulty: 'easy',
        topic: 'Hàm số bậc hai',
        mathFigure: {
          type: 'coordinate_plane',
          caption: 'Đồ thị Parabol y = x^2 - 4x + 3 có đỉnh I(2; -1)',
          funcFormula: 'y = x^2 - 4x + 3',
        },
      },
      {
        id: 'q2',
        number: 2,
        type: 'multiple_choice',
        cognitiveLevel: 'TH',
        questionText: 'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình bình hành. Đường cao $SH \\perp (ABCD)$ với $H$ thuộc đáy. Khẳng định nào sau đây đúng về các cạnh khuất trong biểu diễn không gian 3D?',
        options: [
          'A. Cạnh $AD, CD, SD, SH$ được vẽ bằng nét đứt chuẩn xác',
          'B. Cạnh $SB, SC$ được vẽ bằng nét đứt',
          'C. Tất cả các cạnh của khối chóp đều là nét liền',
          'D. Cạnh $BC, CD$ là các nét đứt',
        ],
        solution: 'Trong hình biểu diễn của hình chóp $S.ABCD$, các đoạn thẳng nằm ở mặt sau khuất tầm nhìn gồm $AD, AB$ (hoặc $AD, CD$) và đường cao bên trong $SH$ phải được biểu diễn bằng nét đứt theo quy chuẩn hình học không gian. Chọn đáp án A.',
        keyMethod: 'Quy tắc nét đứt (cạnh khuất) và nét liền (cạnh nhìn thấy).',
        answerKey: 'A',
        spaceType: 'none',
        calculatedLines: 0,
        difficulty: 'medium',
        topic: 'Hình học không gian',
        mathFigure: {
          type: 'pyramid_3d',
          caption: 'Hình chóp S.ABCD với nét đứt khuất và đường cao SH ⊥ (ABCD)',
        },
      },
      {
        id: 'q3',
        number: 3,
        type: 'short_answer',
        cognitiveLevel: 'VD',
        questionText: 'Hãy tính tích phân $I = \\int_{0}^{1} (2x + 1) e^x dx$ và xác định các hệ số $a, b \\in \\mathbb{Z}$ trong biểu diễn $I = a \\cdot e + b$.',
        solution: 'Sử dụng phương pháp tích phân từng phần: Đặt $u = 2x + 1 \\Rightarrow du = 2dx$; $dv = e^x dx \\Rightarrow v = e^x$.\nTa có: $I = (2x + 1)e^x\\Big|_{0}^{1} - \\int_{0}^{1} 2e^x dx = (3e - 1) - 2(e - 1) = 3e - 1 - 2e + 2 = e + 1$.\nDo đó $a = 1, b = 1$. Kết quả $I = e + 1$.',
        keyMethod: 'Công thức tích phân từng phần $\\int u dv = uv - \\int v du$.',
        answerKey: 'I = e + 1 (a = 1, b = 1)',
        spaceType: 'lines',
        calculatedLines: 4,
        difficulty: 'medium',
        topic: 'Nguyên hàm - Tích phân',
      },
      {
        id: 'q4',
        number: 4,
        type: 'short_answer',
        cognitiveLevel: 'TH',
        questionText: 'Cho tam giác $ABC$ có $a = 8$, $b = 10$, góc $\\widehat{C} = 60^\\circ$. Áp dụng định lý Cosin để tính độ dài cạnh $c$.',
        solution: 'Theo định lý Cosin trong tam giác $ABC$:\n$$c^2 = a^2 + b^2 - 2ab \\cos C = 8^2 + 10^2 - 2(8)(10) \\cos 60^\\circ$$\n$$c^2 = 64 + 100 - 160 \\cdot \\frac{1}{2} = 164 - 80 = 84 \\Rightarrow c = \\sqrt{84} = 2\\sqrt{21}$$.',
        keyMethod: 'Định lý Cosin: $c^2 = a^2 + b^2 - 2ab \\cos C$.',
        answerKey: 'c = 2\\sqrt{21}',
        spaceType: 'lines',
        calculatedLines: 4,
        difficulty: 'medium',
        topic: 'Hệ thức lượng trong tam giác',
        mathFigure: {
          type: 'triangle_geometry',
          caption: 'Tam giác ABC có đường cao AH và đường tròn nội tiếp',
        },
      },
      {
        id: 'q5',
        number: 5,
        type: 'essay_problem',
        cognitiveLevel: 'VDC',
        questionText: 'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$, cạnh bên $SA \\perp (ABCD)$ và $SA = a\\sqrt{3}$.\na) Chứng minh rằng $BC \\perp (SAB)$ và tính thể tích khối chóp $S.ABCD$.\nb) Xác định và tính số đo góc giữa đường thẳng $SC$ và mặt phẳng đáy $(ABCD)$.',
        solution: 'a) Ta có $BC \\perp AB$ (do $ABCD$ là hình vuông) và $BC \\perp SA$ (do $SA \\perp (ABCD)$). Suy ra $BC \\perp (SAB)$.\nDiện tích đáy $S_{ABCD} = a^2$. Chiều cao $h = SA = a\\sqrt{3}$.\nThể tích khối chóp $V = \\frac{1}{3} S_{ABCD} \\cdot SA = \\frac{1}{3} a^2 \\cdot a\\sqrt{3} = \\frac{a^3\\sqrt{3}}{3}$.\n\nb) Vì $SA \\perp (ABCD)$ nên $AC$ là hình chiếu vuông góc của $SC$ lên $(ABCD)$. Do đó góc giữa $SC$ và $(ABCD)$ là góc $\\widehat{SCA}$.\nTam giác $ABCD$ vuông tại $B \\Rightarrow AC = a\\sqrt{2}$.\nTrong tam giác vuông $SAC$ tại $A$: $\\tan \\widehat{SCA} = \\frac{SA}{AC} = \\frac{a\\sqrt{3}}{a\\sqrt{2}} = \\sqrt{\\frac{3}{2}} = \\frac{\\sqrt{6}}{2}$.\nSuy ra $\\widehat{SCA} = \\arctan\\left(\\frac{\\sqrt{6}}{2}\\right) \\approx 50^\\circ 46\'$.',
        keyMethod: 'Chứng minh đường vuông góc với mặt phẳng và góc giữa đường thẳng với mặt phẳng.',
        answerKey: 'a) V = (a^3\\sqrt{3})/3; b) góc SCA ≈ 50°46\'',
        spaceType: 'grid_box',
        calculatedLines: 12,
        difficulty: 'hard',
        topic: 'Thể tích khối đa diện & Góc trong không gian',
        mathFigure: {
          type: 'pyramid_3d',
          caption: 'Khối chóp S.ABCD đáy vuông cạnh a, SA ⊥ (ABCD)',
        },
      },
    ],
  },
  {
    title: 'Khảo Sát Hàm Số & Bảng Biến Thiên Đạo Hàm',
    rawText: `Câu 1 (Trắc nghiệm): Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ. Hàm số đồng biến trên khoảng nào?
A. $(-\\infty; 1)$ và $(3; +\\infty)$
B. $(1; 3)$
C. $(0; 4)$
D. $(-\\infty; 4)$

Câu 2 (Trắc nghiệm): Điểm cực đại của đồ thị hàm số đã cho là:
A. $(1; 4)$
B. $(3; 0)$
C. $x = 1$
D. $y = 4$

Câu 3 (Tự luận): Cho hàm số $y = x^3 - 3x^2 + 2$.
a) Lập bảng biến thiên và vẽ đồ thị hàm số $(C)$.
b) Viết phương trình tiếp tuyến của $(C)$ tại điểm có hoành độ $x_0 = 2$.`,
    header: {
      ...DEFAULT_HEADER_CONFIG,
      examTitle: 'CHUYÊN ĐỀ: KHẢO SÁT & BẢNG BIẾN THIÊN HÀM SỐ',
      subject: 'MÔN: TOÁN HỌC - LỚP 12',
    },
    footer: { ...DEFAULT_FOOTER_CONFIG },
    templateId: 'stem_emerald',
    showAnswerKey: 'bottom',
    enableAiSolve: true,
    workingSpaceMode: 'auto',
    globalQuestionBoxStyle: 'card_shadow',
    fontSize: 'base',
    lineHeight: 'normal',
    margin: 'normal',
    questions: [
      {
        id: 'q_bb1',
        number: 1,
        type: 'multiple_choice',
        cognitiveLevel: 'NB',
        questionText: 'Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng biến thiên như hình vẽ bên. Khẳng định nào sau đây là đúng về khoảng đồng biến của hàm số?',
        options: [
          'A. Hàm số đồng biến trên các khoảng $(-\\infty; 1)$ và $(3; +\\infty)$',
          'B. Hàm số đồng biến trên khoảng $(1; 3)$',
          'C. Hàm số đồng biến trên khoảng $(0; 4)$',
          'D. Hàm số đồng biến trên khoảng $(-\\infty; 3)$',
        ],
        solution: 'Dựa vào bảng biến thiên, ta thấy $y\' > 0$ trên các khoảng $(-\\infty; 1)$ và $(3; +\\infty)$. Do đó hàm số đồng biến trên $(-\\infty; 1)$ và $(3; +\\infty)$. Chọn A.',
        answerKey: 'A',
        spaceType: 'none',
        calculatedLines: 0,
        difficulty: 'easy',
        topic: 'Tính đơn điệu của hàm số',
        mathFigure: {
          type: 'variation_table',
          caption: 'Bảng biến thiên hàm số y = f(x)',
        },
      },
      {
        id: 'q_bb2',
        number: 2,
        type: 'multiple_choice',
        cognitiveLevel: 'TH',
        questionText: 'Tọa độ điểm cực đại của đồ thị hàm số $y = f(x)$ dựa vào bảng biến thiên đã cho là:',
        options: [
          'A. $(1; 4)$',
          'B. $(3; 0)$',
          'C. $x = 1$',
          'D. $y = 4$',
        ],
        solution: 'Tại $x = 1$, đạo hàm $y\'$ đổi dấu từ dương sang âm và giá trị cực đại $y = 4$. Do đó điểm cực đại của ĐỒ THỊ hàm số là cặp tọa độ $(1; 4)$. Chọn A.',
        answerKey: 'A',
        spaceType: 'none',
        calculatedLines: 0,
        difficulty: 'easy',
        topic: 'Cực trị hàm số',
      },
      {
        id: 'q_bb3',
        number: 3,
        type: 'essay_problem',
        cognitiveLevel: 'VD',
        questionText: 'Cho hàm số $y = x^3 - 3x^2 + 2$.\na) Lập bảng biến thiên và xác định các điểm cực trị của hàm số.\nb) Viết phương trình tiếp tuyến của đồ thị hàm số tại điểm có hoành độ $x_0 = 2$.',
        solution: 'a) Tập xác định $D = \\mathbb{R}$. Đạo hàm $y\' = 3x^2 - 6x = 3x(x - 2)$. Cho $y\' = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$.\nTại $x = 0 \\Rightarrow y = 2$ (Điểm cực đại $(0; 2)$).\nTại $x = 2 \\Rightarrow y = -2$ (Điểm cực tiểu $(2; -2)$).\n\nb) Tại $x_0 = 2$, tung độ tiếp điểm $y_0 = y(2) = -2$. Hệ số góc tiếp tuyến $k = y\'(2) = 0$.\nPhương trình tiếp tuyến: $y = k(x - x_0) + y_0 \\Leftrightarrow y = 0(x - 2) - 2 \\Leftrightarrow y = -2$.',
        answerKey: 'a) CĐ(0; 2), CT(2; -2); b) Tiếp tuyến: y = -2',
        spaceType: 'grid_box',
        calculatedLines: 10,
        difficulty: 'medium',
        topic: 'Tiếp tuyến đồ thị hàm số',
        mathFigure: {
          type: 'coordinate_plane',
          caption: 'Đồ thị hàm bậc ba y = x^3 - 3x^2 + 2',
          funcFormula: 'y = x^3 - 3x^2 + 2',
        },
      },
    ],
  },
];
