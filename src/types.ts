export type TemplateId = 
  | 'thpt_national'      // Chuẩn Đề Thi Quốc Gia (Bộ GD&ĐT)
  | 'olympiad_royal'     // Chuyên Toán & Olympic (Royal Navy & Gold)
  | 'stem_emerald'       // Khoa Học & STEM (Emerald Grid)
  | 'ams_latex'          // Hàn Lâm AMS-LaTeX (Monochrome Classic)
  | 'floral_pedagogical' // Sư Phạm Trang Nhã (Pastel Rose & Amber)
  | 'royal_violet'       // Tím Hoàng Gia (Royal Violet Luxury)
  | 'sunset_gold'        // Hoàng Hôn Vinh Danh (Sunset Gold)
  | 'modern_sky'         // Năng Động Trẻ Trung (Sky Cyan & Teal)
  | 'chibi_playful'      // Toán Học Chibi (Chibi Anime Math)
  | 'lesson_plan';       // Giáo Án & Phiếu Chuyên Đề (Teacher Lesson Sheet)

export type HeaderBgStyle = 'pedagogical_topbar' | 'gradient_ribbon' | 'solid_banner' | 'bordered_card' | 'classic_clean' | 'national_exam_header';
export type QuestionBoxStyle = 'none' | 'simple_border' | 'card_shadow' | 'gradient_border' | 'left_accent_stripe' | 'double_border' | 'academic_box';
export type WorkingSpaceMode = 'auto' | 'all_lines' | 'compact_none';

export type CognitiveLevel = 'NB' | 'TH' | 'VD' | 'VDC'; // Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao

export type MathFigureType = 
  | 'none'
  | 'coordinate_plane'    // Đồ thị hàm số trên mặt phẳng Oxy
  | 'triangle_geometry'   // Hình học phẳng (tam giác, đường tròn nội/ngoại tiếp)
  | 'pyramid_3d'          // Hình chóp S.ABCD / S.ABC nét đứt nét liền
  | 'cube_3d'             // Hình lập phương / lăng trụ
  | 'variation_table'     // Bảng biến thiên / bảng xét dấu
  | 'cone_cylinder_3d';   // Khối tròn xoay nón / trụ / cầu

export interface MathFigureData {
  type: MathFigureType;
  caption?: string;
  funcFormula?: string;   // VD: "y = x^2 - 4x + 3" hoặc "y = (2x+1)/(x-1)"
  params?: Record<string, any>; // Tham số hình học
  tikzCode?: string;      // Mã nguồn TikZ xuất LaTeX
}

export interface HeaderConfig {
  schoolName: string;
  departmentName?: string;
  examTitle: string;
  subject: string;
  examCode?: string;      // Mã đề thi: VD "101", "102"
  duration: string;
  logoType: 'math' | 'book' | 'chemistry' | 'custom' | 'none';
  customLogoUrl?: string;
  quote: string;
  teacherAvatarUrl: string;
  teacherAvatarPreset: 'chibi_anime' | 'short_wavy' | 'glasses_professional' | 'youthful_friendly' | 'custom';
  showStudentInfoBox: boolean;
  showOpticalMarkSheet?: boolean; // Khung tô đáp án A-B-C-D trắc nghiệm
  bgStyle: HeaderBgStyle;
  customBannerColor?: string;
}

export interface FooterConfig {
  teacherName: string;
  tagline: string;
  contactPhone: string;
  contactZalo: string;
  showPageNumbers: boolean;
  bgStyle: 'banner' | 'card' | 'clean';
}

export type QuestionType = 'multiple_choice' | 'short_answer' | 'essay_problem' | 'fill_blank';
export type SpaceType = 'lines' | 'grid_box' | 'blank_box' | 'none';

export interface QuestionItem {
  id: string;
  number: number;
  type: QuestionType;
  cognitiveLevel?: CognitiveLevel; // NB, TH, VD, VDC
  questionText: string;
  options?: string[]; // A. B. C. D.
  solution?: string;  // Lời giải chi tiết từng bước
  keyMethod?: string; // Phương pháp / Công thức cốt lõi
  mistakeWarning?: string; // Lưu ý / Bẫy sai lầm học sinh dễ mắc
  answerKey?: string; // e.g. "A" hoặc "x = 3"
  spaceType: SpaceType;
  calculatedLines: number; // Số dòng kẻ hoặc ô trống
  difficulty: 'easy' | 'medium' | 'hard' | 'olympiad';
  topic?: string;
  mathFigure?: MathFigureData; // Hình vẽ hình học / đồ thị / bảng biến thiên
  customBoxStyle?: QuestionBoxStyle;
}

export type AnswerKeyDisplayMode = 'bottom' | 'hidden' | 'inline_teacher';

export interface DocumentData {
  title: string;
  rawText: string;
  header: HeaderConfig;
  footer: FooterConfig;
  templateId: TemplateId;
  questions: QuestionItem[];
  showAnswerKey: AnswerKeyDisplayMode;
  enableAiSolve: boolean;
  workingSpaceMode: WorkingSpaceMode;
  globalQuestionBoxStyle: QuestionBoxStyle;
  fontSize: 'sm' | 'base' | 'lg';
  lineHeight: 'tight' | 'normal' | 'relaxed';
  margin: 'compact' | 'normal' | 'wide';
}

export type TemplateVisualVariant = 
  | 'square_frame'      // Khung vuông vức góc cạnh, đường viền kép
  | 'floral_frame'      // Khung hoa lá sư phạm dễ thương
  | 'math_watermark'    // Nền ẩn họa tiết đồ thị & hình đa diện 3D
  | 'icon_rich'         // Nhiều biểu tượng icon sinh động
  | 'classic_academic'  // Phong cách Hàn lâm học thuật Bộ GD&ĐT
  | 'playful_chibi'     // Hoạt hình Chibi tươi sáng
  | 'lesson_sheet';     // Phiếu học tập & giáo án chuyên đề

export interface TemplateTheme {
  id: TemplateId;
  name: string;
  badgeTitle: string;
  description: string;
  primaryColor: string;
  primaryBg: string;
  accentColor: string;
  headerBg: string;
  headerText: string;
  cardBorder: string;
  fontFamily: 'vietnam_pro' | 'merriweather' | 'stix_math' | 'sans';
  badgeStyle: string;
  lineColor: string;
  icon: string;
  bannerGradient: string;
  variant: TemplateVisualVariant;
}

export interface AIProcessingStatus {
  received: boolean;
  parsedCount: number;
  solvedCount: number;
  message: string;
  timestamp: string;
}

export interface AILayoutPreviewInfo {
  templateName: string;
  primaryColor: string;
  fontName: string;
  headerSummary: string;
  footerSummary: string;
}

export interface AILogicSummaryInfo {
  shortAnswerCount: number;
  shortAnswerLinesAvg: number;
  essayCount: number;
  essayBoxSizeAvg: string;
  multipleChoiceCount: number;
  totalSpaceEstimatePages: number;
  cognitiveSummary?: {
    nb: number;
    th: number;
    vd: number;
    vdc: number;
  };
}

export interface AIProcessDocResponse {
  status: AIProcessingStatus;
  layoutPreview: AILayoutPreviewInfo;
  logicSummary: AILogicSummaryInfo;
  questions: QuestionItem[];
}
