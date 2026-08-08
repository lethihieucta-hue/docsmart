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
    title: 'Đề Thi Chuẩn Mới 2025: Trắc Nghiệm Đúng/Sai (4 Ý) & Hình 3D',
    rawText: `PHẦN I: CÂU TRẮC NGHIỆM NHIỀU LỰA CHỌN (4 Phương án)
Câu 1: Cho hàm số bậc ba $y = f(x) = x^3 - 3x^2 + 2$ có đồ thị là $(C)$. Tọa độ điểm cực đại của đồ thị hàm số là:
A. $M(0; 2)$
B. $N(2; -2)$
C. $P(1; 0)$
D. $Q(-1; -2)$

PHẦN II: CÂU TRẮC NGHIỆM ĐÚNG / SAI (Mỗi câu gồm 4 ý a, b, c, d)
Câu 2: Cho hàm số $y = f(x) = \\frac{2x - 1}{x + 1}$ có đồ thị là $(H)$. Xét tính Đúng hoặc Sai của các khẳng định sau:
a) Tập xác định của hàm số là $D = \\mathbb{R} \\setminus \\{-1\\}$.
b) Đạo hàm của hàm số là $y' = \\frac{3}{(x+1)^2} > 0, \\forall x \\neq -1$.
c) Đồ thị $(H)$ có tiệm cận đứng $x = 2$ và tiệm cận ngang $y = -1$.
d) Giao điểm của hai đường tiệm cận là tâm đối xứng $I(-1; 2)$ của đồ thị $(H)$.

PHẦN III: CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN
Câu 3: Cho tứ diện đều $ABCD$ có cạnh bằng $a\\sqrt{2}$. Hãy tính khoảng cách giữa hai đường thẳng chéo nhau $AB$ và $CD$.

PHẦN IV: BÀI TOÁN TỰ LUẬN & HÌNH HỌC KHÔNG GIAN
Câu 4: Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$, cạnh bên $SA \\perp (ABCD)$ và $SA = a\\sqrt{3}$.
a) Chứng minh $BC \\perp (SAB)$ và tính thể tích khối chóp $S.ABCD$.
b) Tính khoảng cách từ điểm $A$ đến mặt phẳng $(SBD)$.`,
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
        questionText: 'Cho hàm số bậc ba $y = f(x) = x^3 - 3x^2 + 2$ có đồ thị là $(C)$. Tọa độ điểm cực đại của đồ thị hàm số là:',
        options: [
          'A. $M(0; 2)$',
          'B. $N(2; -2)$',
          'C. $P(1; 0)$',
          'D. $Q(-1; -2)$',
        ],
        solution: 'Ta có $y\' = 3x^2 - 6x = 3x(x - 2)$. Cho $y\' = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$.\nQua điểm $x = 0$, đạo hàm $y\'$ đổi dấu từ dương sang âm, $y(0) = 2$. Do đó điểm cực đại của đồ thị hàm số là $M(0; 2)$. Chọn đáp án A.',
        keyMethod: 'Tính đạo hàm $y\'=0$, lập bảng xét dấu để xác định tọa độ điểm cực đại.',
        answerKey: 'A',
        spaceType: 'none',
        calculatedLines: 0,
        difficulty: 'easy',
        topic: 'Cực trị hàm số bậc ba',
        mathFigure: {
          type: 'coordinate_plane',
          caption: 'Đồ thị hàm số bậc ba y = x^3 - 3x^2 + 2',
          funcFormula: 'y = x^3 - 3x^2 + 2',
        },
      },
      {
        id: 'q2',
        number: 2,
        type: 'true_false_group',
        cognitiveLevel: 'TH',
        questionText: 'Cho hàm số $y = f(x) = \\frac{2x - 1}{x + 1}$ có đồ thị là $(H)$. Xét tính Đúng hoặc Sai của các khẳng định sau:',
        tfItems: [
          {
            id: 'tf_2_a',
            letter: 'a',
            statement: 'Tập xác định của hàm số là $D = \\mathbb{R} \\setminus \\{-1\\}$.',
            isCorrect: true,
            explanation: 'Đúng vì mẫu số $x + 1 \\neq 0 \\Leftrightarrow x \\neq -1$.',
          },
          {
            id: 'tf_2_b',
            letter: 'b',
            statement: 'Đạo hàm của hàm số là $y\' = \\frac{3}{(x+1)^2} > 0, \\forall x \\neq -1$.',
            isCorrect: true,
            explanation: 'Đúng theo quy tắc đạo hàm phân thức bậc nhất: $y\' = \\frac{2(1) - (-1)(1)}{(x+1)^2} = \\frac{3}{(x+1)^2} > 0$.',
          },
          {
            id: 'tf_2_c',
            letter: 'c',
            statement: 'Đồ thị $(H)$ có tiệm cận đứng $x = 2$ và tiệm cận ngang $y = -1$.',
            isCorrect: false,
            explanation: 'Sai vì tiệm cận đứng là $x = -1$ và tiệm cận ngang là $y = \\frac{2}{1} = 2$.',
          },
          {
            id: 'tf_2_d',
            letter: 'd',
            statement: 'Giao điểm của hai đường tiệm cận là tâm đối xứng $I(-1; 2)$ của đồ thị $(H)$.',
            isCorrect: true,
            explanation: 'Đúng vì tâm đối xứng của hàm phân thức bậc nhất trên bậc nhất là giao điểm của TCĐ ($x=-1$) và TCN ($y=2$).',
          },
        ],
        solution: 'Xét hàm phân thức $y = \\frac{2x - 1}{x + 1}$:\n- Mệnh đề a: Đúng ($D = \\mathbb{R} \\setminus \\{-1\\}$).\n- Mệnh đề b: Đúng ($y\' = \\frac{3}{(x+1)^2} > 0$).\n- Mệnh đề c: Sai (TCĐ là $x = -1$, TCN là $y = 2$).\n- Mệnh đề d: Đúng (Tâm đối xứng $I(-1; 2)$).',
        keyMethod: 'Khảo sát hàm phân thức nhất biến và xác định tính đúng/sai của 4 mệnh đề độc lập.',
        answerKey: 'a: Đ, b: Đ, c: S, d: Đ',
        spaceType: 'lines',
        calculatedLines: 4,
        difficulty: 'medium',
        topic: 'Hàm số phân thức & Tiệm cận',
      },
      {
        id: 'q3',
        number: 3,
        type: 'short_answer',
        cognitiveLevel: 'VD',
        questionText: 'Cho tứ diện đều $ABCD$ có cạnh bằng $a\\sqrt{2}$. Hãy tính khoảng cách $d$ giữa hai đường thẳng chéo nhau $AB$ và $CD$.',
        solution: 'Gọi $M, N$ lần lượt là trung điểm của $AB$ và $CD$. Vì tứ diện $ABCD$ là tứ diện đều nên đoạn nối hai trung điểm $MN$ chính là đoạn vuông góc chung của $AB$ và $CD$.\nTa có tam giác $ACD$ đều cạnh $a\\sqrt{2} \\Rightarrow AN = \\frac{a\\sqrt{2} \\cdot \\sqrt{3}}{2} = \\frac{a\\sqrt{6}}{2}$.\nTrong tam giác vuông $AMN$ tại $M$: $MN = \\sqrt{AN^2 - AM^2} = \\sqrt{\\left(\\frac{a\\sqrt{6}}{2}\\right)^2 - \\left(\\frac{a\\sqrt{2}}{2}\\right)^2} = \\sqrt{\\frac{6a^2}{4} - \\frac{2a^2}{4}} = \\sqrt{a^2} = a$.\nDo đó khoảng cách $d(AB, CD) = a$.',
        keyMethod: 'Đoạn vuông góc chung nối hai trung điểm của hai cạnh đối trong tứ diện đều.',
        answerKey: 'd = a',
        spaceType: 'lines',
        calculatedLines: 4,
        difficulty: 'medium',
        topic: 'Khoảng cách trong không gian',
        mathFigure: {
          type: 'triangle_geometry',
          caption: 'Tam giác đều và đường cao tính đoạn vuông góc chung',
        },
      },
      {
        id: 'q4',
        number: 4,
        type: 'essay_problem',
        cognitiveLevel: 'VDC',
        questionText: 'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$, cạnh bên $SA \\perp (ABCD)$ và $SA = a\\sqrt{3}$.\na) Chứng minh $BC \\perp (SAB)$ và tính thể tích khối chóp $S.ABCD$.\nb) Tính khoảng cách từ điểm $A$ đến mặt phẳng $(SBD)$.',
        solution: 'a) Ta có $BC \\perp AB$ (do $ABCD$ là hình vuông) và $BC \\perp SA$ (do $SA \\perp (ABCD)$). Suy ra $BC \\perp (SAB)$.\nDiện tích đáy $S_{ABCD} = a^2$. Chiều cao $h = SA = a\\sqrt{3}$.\nThể tích khối chóp $V = \\frac{1}{3} S_{ABCD} \\cdot SA = \\frac{1}{3} a^2 \\cdot a\\sqrt{3} = \\frac{a^3\\sqrt{3}}{3}$.\n\nb) Gọi $O = AC \\cap BD$. Ta có $AO = \\frac{a\\sqrt{2}}{2}$. Kẻ $AH \\perp SO$ tại $H$.\nVì $BD \\perp AC$ và $BD \\perp SA \\Rightarrow BD \\perp (SAC) \\Rightarrow BD \\perp AH$.\nDo đó $AH \\perp (SBD) \\Rightarrow d(A, (SBD)) = AH$.\nÁp dụng hệ thức lượng trong tam giác vuông $SAO$ tại $A$:\n$$\\frac{1}{AH^2} = \\frac{1}{SA^2} + \\frac{1}{AO^2} = \\frac{1}{3a^2} + \\frac{1}{(a\\sqrt{2}/2)^2} = \\frac{1}{3a^2} + \\frac{2}{a^2} = \\frac{7}{3a^2}$$\n$$\\Rightarrow AH = \\sqrt{\\frac{3}{7}} a = \\frac{a\\sqrt{21}}{7}$$.',
        keyMethod: 'Phương pháp dựng khoảng cách từ chân đường vuông góc $A$ đến mặt bên $(SBD)$.',
        answerKey: 'a) V = (a^3\\sqrt{3})/3; b) d = (a\\sqrt{21})/7',
        spaceType: 'grid_box',
        calculatedLines: 12,
        difficulty: 'hard',
        topic: 'Khoảng cách từ điểm đến mặt phẳng & Thể tích khối chóp',
        mathFigure: {
          type: 'pyramid_3d',
          caption: 'Hình chóp S.ABCD đáy hình vuông, SA ⊥ (ABCD)',
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
