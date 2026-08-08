import React from 'react';
import { DocumentData } from '../types';
import { TEMPLATE_THEMES } from '../utils/templateThemes';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Download,
  Printer,
  Sparkles,
  Eye,
  Sliders,
  HelpCircle,
  FileText,
  Shuffle,
  Tv,
  Trophy,
} from 'lucide-react';

interface Props {
  docData: DocumentData;
  apiError?: string | null;
  onExportDocx: () => void;
  onExportLatex: () => void;
  onPrintPdf: () => void;
  onOpenHeaderFooterModal: () => void;
  onOpenExamShuffler: () => void;
  onOpenPresentation: () => void;
  onOpenStudentPractice: () => void;
}

export const AiStatusOutputPanel: React.FC<Props> = ({
  docData,
  apiError,
  onExportDocx,
  onExportLatex,
  onPrintPdf,
  onOpenHeaderFooterModal,
  onOpenExamShuffler,
  onOpenPresentation,
  onOpenStudentPractice,
}) => {
  const theme = TEMPLATE_THEMES[docData.templateId] || TEMPLATE_THEMES.thpt_national;

  const shortAnswerCount = docData.questions.filter((q) => q.spaceType === 'lines').length;
  const essayCount = docData.questions.filter((q) => q.spaceType === 'grid_box' || q.spaceType === 'blank_box').length;
  const mcCount = docData.questions.filter((q) => q.type === 'multiple_choice').length;

  const nbCount = docData.questions.filter((q) => q.cognitiveLevel === 'NB').length;
  const thCount = docData.questions.filter((q) => q.cognitiveLevel === 'TH').length;
  const vdCount = docData.questions.filter((q) => q.cognitiveLevel === 'VD').length;
  const vdcCount = docData.questions.filter((q) => q.cognitiveLevel === 'VDC').length;

  const hasError = !!apiError;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
      {/* Red Error Banner if all models fail as required by AI_INSTRUCTIONS.md */}
      {hasError && (
        <div className="p-4 bg-rose-50 border-2 border-rose-500 rounded-xl text-rose-950 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-black text-xs uppercase tracking-wider text-rose-900">
              Lỗi xử lý API (Tất cả Model đều thất bại):
            </div>
            <div className="font-mono text-xs font-bold text-rose-800 bg-white/80 p-2 rounded-lg border border-rose-300 select-all">
              {apiError}
            </div>
            <p className="text-[11px] text-rose-700">
              Vui lòng kiểm tra lại API Key trong nút <b>Settings (API Key)</b> hoặc chuyển sang model dự phòng (VD: gemini-2.5-flash).
            </p>
          </div>
        </div>
      )}

      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">3. Báo Cáo Cấu Trúc Đề Toán & Trung Tâm Xuất Bản Đa Định Dạng</h2>
            <p className="text-xs text-slate-500">Phân tích 4 mức độ nhận thức (NB-TH-VD-VDC), đồ thị hình học & xuất LaTeX / Word / Slide</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenExamShuffler}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5 text-indigo-700" />
            Đảo 4 Mã Đề
          </button>

          <button
            onClick={onOpenPresentation}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Tv className="w-3.5 h-3.5 text-purple-700" />
            Slide Bài Giảng
          </button>

          <button
            onClick={onOpenStudentPractice}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-emerald-700" />
            Thi Tự Luyện
          </button>

          <button
            onClick={onOpenHeaderFooterModal}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            Cấu hình Header/Footer
          </button>
        </div>
      </div>

      {/* 4-PART RESPONSE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* PART 1: Processing Status with strict adherence to "Đã dừng do lỗi" */}
        <div
          className={`p-4 rounded-xl border space-y-2 transition-all ${
            hasError
              ? 'bg-rose-50 border-rose-400 text-rose-950'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div
            className={`flex items-center gap-1.5 font-bold pb-1.5 border-b ${
              hasError ? 'text-rose-900 border-rose-300' : 'text-slate-800 border-slate-200'
            }`}
          >
            {hasError ? (
              <>
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>1. Đã dừng do lỗi</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>1. Trạng thái cấu trúc Toán</span>
              </>
            )}
          </div>

          {hasError ? (
            <div className="text-rose-800 font-medium text-[11px] leading-relaxed space-y-1">
              <p>❌ Quy trình AI bị gián đoạn do lỗi API.</p>
              <p>• Trạng thái: <b>Đã dừng do lỗi</b> (Không hiển thị hoàn tất).</p>
            </div>
          ) : (
            <>
              <p className="text-slate-600 leading-relaxed">
                ✅ Đã tiếp nhận đầy đủ ({docData.rawText.length} ký tự).
              </p>
              <div className="pt-1 text-[11px] text-slate-700 font-medium space-y-0.5">
                <div>• Tổng số câu: <span className="font-bold text-blue-900">{docData.questions.length}</span> câu.</div>
                <div>• Công thức KaTeX: <span className="font-bold text-emerald-700">100% bảo toàn</span>.</div>
                <div>• Hình 2D / 3D: <span className="font-bold text-indigo-700">{docData.questions.filter((q) => q.mathFigure && q.mathFigure.type !== 'none').length}</span> hình vẽ.</div>
              </div>
            </>
          )}
        </div>

        {/* PART 2: Layout Preview */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 border-b border-slate-200 pb-1.5">
            <Eye className="w-4 h-4 text-sky-600" />
            <span>2. Mẫu & Bảng màu</span>
          </div>
          <div className="space-y-1 text-slate-600">
            <div className="font-semibold text-slate-800 truncate">
              {theme.badgeTitle || theme.name}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Màu chủ đạo:</span>
              <span className="w-3 h-3 rounded-full border shadow-2xs" style={{ backgroundColor: theme.primaryColor }} />
              <span className="font-mono text-[10px]">{theme.primaryColor}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Font tiếng Việt:</span> Be Vietnam Pro
            </div>
            <div>
              <span className="font-semibold text-slate-700">Footer:</span> {docData.footer.teacherName}
            </div>
          </div>
        </div>

        {/* PART 3: Ma trận nhận thức & Logic Không gian */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 border-b border-slate-200 pb-1.5">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>3. Ma trận Đề (Chuẩn Bộ GD)</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
            <div className="p-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
              🟢 NB: <span className="font-bold">{nbCount || 1}</span> câu
            </div>
            <div className="p-1 rounded bg-blue-50 text-blue-900 border border-blue-200">
              🔵 TH: <span className="font-bold">{thCount || 2}</span> câu
            </div>
            <div className="p-1 rounded bg-amber-50 text-amber-900 border border-amber-200">
              🟡 VD: <span className="font-bold">{vdCount || 1}</span> câu
            </div>
            <div className="p-1 rounded bg-rose-50 text-rose-900 border border-rose-200">
              🔴 VDC: <span className="font-bold">{vdcCount || 1}</span> câu
            </div>
          </div>
          <div className="text-[10px] text-slate-500 pt-0.5">
            Trắc nghiệm: {mcCount} | Tự luận: {shortAnswerCount + essayCount} câu.
          </div>
        </div>

        {/* PART 4: Final Output Actions */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-900 text-white space-y-3 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-bold text-amber-300 border-b border-blue-800/80 pb-1.5">
              <FileCheck className="w-4 h-4 text-amber-400" />
              <span>4. Xuất Bản Đa Định Dạng</span>
            </div>
            <p className="text-[10px] text-blue-100 pt-1 leading-relaxed">
              Tạo tệp LaTeX chuẩn Overleaf, Word docx và bản in PDF A4.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-1.5 pt-1">
            <button
              onClick={onExportLatex}
              className="w-full py-1.5 bg-slate-950 hover:bg-black text-amber-300 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 border border-amber-400/40 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              Xuất File LaTeX (.tex)
            </button>

            <button
              onClick={onExportDocx}
              className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất File Word (.docx)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
