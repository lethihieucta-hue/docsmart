import React, { useState } from 'react';
import { DocumentData, QuestionItem, AnswerKeyDisplayMode, QuestionBoxStyle } from '../types';
import { TEMPLATE_THEMES } from '../utils/templateThemes';
import { MathRenderer } from './MathRenderer';
import { MathFigureRenderer } from './MathFigureRenderer';
import {
  Printer,
  Download,
  Edit3,
  Plus,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Trash2,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Smile,
  GraduationCap,
  Phone,
  Flower2,
  Boxes,
  Activity,
  Pencil,
  Target,
  Compass,
  Shuffle,
  Trophy,
  Tv,
  FileSpreadsheet,
} from 'lucide-react';

interface Props {
  docData: DocumentData;
  onUpdateDocData: (newDoc: DocumentData) => void;
  onEditQuestion: (q: QuestionItem) => void;
  onExportDocx: () => void;
  onExportLatex: () => void;
  onPrintPdf: () => void;
  onOpenExamShuffler: () => void;
  onOpenPresentation: () => void;
  onOpenStudentPractice: () => void;
}

export const DocumentLivePreview: React.FC<Props> = ({
  docData,
  onUpdateDocData,
  onEditQuestion,
  onExportDocx,
  onExportLatex,
  onPrintPdf,
  onOpenExamShuffler,
  onOpenPresentation,
  onOpenStudentPractice,
}) => {
  const theme = TEMPLATE_THEMES[docData.templateId] || TEMPLATE_THEMES.thpt_national;

  // Answer Key display mode
  const handleAnswerKeyToggle = (mode: AnswerKeyDisplayMode) => {
    onUpdateDocData({ ...docData, showAnswerKey: mode });
  };

  // Reorder questions
  const moveQuestion = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= docData.questions.length) return;

    const newQs = [...docData.questions];
    const temp = newQs[idx];
    newQs[idx] = newQs[targetIdx];
    newQs[targetIdx] = temp;

    newQs.forEach((q, i) => {
      q.number = i + 1;
    });

    onUpdateDocData({ ...docData, questions: newQs });
  };

  const handleAddQuestion = () => {
    const newQ: QuestionItem = {
      id: `q_new_${Date.now()}`,
      number: docData.questions.length + 1,
      type: 'short_answer',
      cognitiveLevel: 'TH',
      questionText: 'Tính giá trị biểu thức $P = \\int_{0}^{\\frac{\\pi}{2}} \\sin^2 x dx$ và cho biết kết quả.',
      solution: 'Ta có công thức hạ bậc: $\\sin^2 x = \\frac{1 - \\cos 2x}{2}$.\nDo đó: $P = \\int_{0}^{\\frac{\\pi}{2}} \\frac{1 - \\cos 2x}{2} dx = \\left[ \\frac{x}{2} - \\frac{\\sin 2x}{4} \\right]_{0}^{\\frac{\\pi}{2}} = \\frac{\\pi}{4}$.',
      keyMethod: 'Công thức lượng giác hạ bậc $\\sin^2 x = (1 - \\cos 2x)/2$.',
      answerKey: 'P = \\pi / 4',
      spaceType: 'lines',
      calculatedLines: 4,
      difficulty: 'medium',
      topic: 'Nguyên hàm - Tích phân',
    };
    onUpdateDocData({ ...docData, questions: [...docData.questions, newQ] });
  };

  const handleDeleteQuestion = (id: string) => {
    const filtered = docData.questions.filter((q) => q.id !== id);
    filtered.forEach((q, i) => (q.number = i + 1));
    onUpdateDocData({ ...docData, questions: filtered });
  };

  // Helper function to render question box framing style
  const getQuestionContainerClass = (boxStyle: QuestionBoxStyle) => {
    switch (boxStyle) {
      case 'card_shadow':
        return 'border-2 shadow-md rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5 transition-all';
      case 'gradient_border':
        return 'p-[2px] rounded-2xl bg-gradient-to-r ' + theme.bannerGradient + ' shadow-2xs mb-4 sm:mb-5';
      case 'left_accent_stripe':
        return 'border-l-8 border-y border-r rounded-r-2xl p-4 sm:p-5 mb-4 sm:mb-5';
      case 'double_border':
        return 'border-4 border-double rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5';
      case 'academic_box':
        return 'border-2 rounded-none p-4 sm:p-5 mb-4 sm:mb-5 shadow-none border-slate-900';
      case 'simple_border':
      default:
        return 'border-2 rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5 shadow-2xs transition-all';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold">Xem Trước Bảng In A4 & Bộ Công Cụ Sư Phạm</h2>
        </div>

        {/* Answer Key Display Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <span className="text-slate-400 px-2 text-[11px]">Chế độ Đáp án:</span>
          <button
            onClick={() => handleAnswerKeyToggle('bottom')}
            className={`px-3 py-1 rounded-lg transition-all ${
              docData.showAnswerKey === 'bottom'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Cuối bài
          </button>
          <button
            onClick={() => handleAnswerKeyToggle('hidden')}
            className={`px-3 py-1 rounded-lg transition-all ${
              docData.showAnswerKey === 'hidden'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Ẩn (Đề thi Học sinh)
          </button>
          <button
            onClick={() => handleAnswerKeyToggle('inline_teacher')}
            className={`px-3 py-1 rounded-lg transition-all ${
              docData.showAnswerKey === 'inline_teacher'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Hiện kèm (Bản Giáo viên)
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAddQuestion}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Thêm câu hỏi
          </button>

          <button
            onClick={onOpenExamShuffler}
            className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            title="Đảo 4 mã đề thi 101, 102, 103, 104"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-300" />
            <span>Đảo 4 Mã Đề</span>
          </button>

          <button
            onClick={onOpenPresentation}
            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            title="Trình chiếu slide bài giảng toán học"
          >
            <Tv className="w-3.5 h-3.5 text-amber-300" />
            <span>Trình Chiếu Slide</span>
          </button>

          <button
            onClick={onOpenStudentPractice}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            title="Chế độ học sinh làm bài trực tuyến có đếm giờ"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>Học Sinh Tự Luyện</span>
          </button>

          <button
            onClick={onExportLatex}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-lg text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Xuất LaTeX (.tex)</span>
          </button>

          <button
            onClick={onExportDocx}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Word (.docx)</span>
          </button>

          <button
            onClick={onPrintPdf}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In / PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* A4 SIMULATED PAGE CONTAINER */}
      <div className="flex justify-center bg-slate-200/80 p-4 sm:p-8 rounded-2xl overflow-x-auto min-h-[800px]">
        <div
          id="printable-a4-document"
          className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-[15mm] sm:p-[18mm] shadow-2xl rounded-xs flex flex-col justify-between relative print:shadow-none print:w-full print:p-0 print:m-0 font-vietnam-pro"
        >
          {/* HEADER DESIGN */}
          {docData.header.bgStyle === 'gradient_ribbon' ? (
            <div className={`p-4 rounded-2xl text-white mb-6 shadow-sm bg-gradient-to-r ${theme.bannerGradient}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="w-3/5 space-y-1">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs mb-1">
                    {docData.header.schoolName}
                  </div>
                  <h1 className="text-sm font-extrabold text-white tracking-tight leading-snug">
                    {docData.header.examTitle}
                  </h1>
                  <p className="text-[10px] text-amber-200 italic font-medium">
                    "{docData.header.quote}"
                  </p>
                </div>

                <div className="w-2/5 flex items-center justify-end gap-3 border-l border-white/20 pl-3">
                  <div className="text-right">
                    <div className="text-xs font-bold text-white">{docData.header.subject}</div>
                    <div className="text-[10px] text-white/80 italic">{docData.header.duration}</div>
                  </div>
                  <img
                    src={docData.header.teacherAvatarUrl}
                    alt="Chibi Teacher Avatar"
                    className="w-12 h-12 rounded-full bg-white p-0.5 border-2 border-white shadow-md object-cover shrink-0"
                  />
                </div>
              </div>

              {docData.header.showStudentInfoBox && (
                <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-[11px] text-white/90 italic font-medium">
                  <div>Họ và tên thí sinh: ............................................................................</div>
                  <div>SBD: .................... Lớp: .........</div>
                </div>
              )}
            </div>
          ) : (
            /* PEDAGOGICAL TOPBAR & CENTERED TITLE HEADER */
            <div className="mb-6 space-y-2">
              {/* Sleek Top Banner Bar */}
              <div
                className={`w-full text-white px-4 py-1.5 rounded-xl flex items-center justify-between text-[11px] font-bold tracking-wide uppercase shadow-xs bg-gradient-to-r ${theme.bannerGradient}`}
              >
                <div className="flex items-center gap-2 truncate">
                  <GraduationCap className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="truncate">{docData.header.quote || 'CÓ HỌC MỚI THÀNH TÀI – MIỆT MÀI MỚI THÀNH GIỎI'}</span>
                </div>
                <div className="text-amber-200 font-extrabold shrink-0 ml-2">
                  {docData.header.schoolName || 'TRƯỜNG THPT CHÂU THÀNH A'}
                </div>
              </div>

              {/* Main White Canvas Header Title */}
              <div className="text-center pt-2 pb-1 space-y-1.5 px-2">
                <h1
                  className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-vietnam-pro"
                  style={{ color: theme.primaryColor }}
                >
                  {docData.header.examTitle || 'ĐỀ ÔN TẬP TOÁN THPT'}
                </h1>

                <div className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-wide uppercase">
                  {docData.header.subject || 'MÔN: TOÁN HỌC'}
                </div>

                {/* Decorative Star Line */}
                <div className="flex items-center justify-center gap-3 py-0.5">
                  <div className="h-[1.5px] w-20" style={{ backgroundColor: theme.primaryColor }} />
                  <span className="text-xs text-amber-500 font-bold">★</span>
                  <div className="h-[1.5px] w-20" style={{ backgroundColor: theme.primaryColor }} />
                </div>

                {/* Sub-header Info & Avatar / Student Info */}
                <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-200 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <img
                      src={docData.header.teacherAvatarUrl}
                      alt="Teacher Avatar"
                      className="w-9 h-9 rounded-full object-cover border-2 shadow-xs shrink-0"
                      style={{ borderColor: theme.primaryColor }}
                    />
                    <div className="text-left leading-tight">
                      <div className="font-bold text-slate-900">{docData.footer.teacherName}</div>
                      <div className="text-[10px] text-slate-500 italic">{docData.header.duration || 'Thời gian: 90 phút'}</div>
                    </div>
                  </div>

                  {docData.header.showStudentInfoBox && (
                    <div className="text-right text-[11px] text-slate-700 italic leading-snug">
                      <div>Họ và tên: ................................................................</div>
                      <div>SBD: .................... Lớp: .................... Mã đề: <span className="font-bold font-mono text-blue-900">[{docData.header.examCode || '101'}]</span></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* OPTICAL MARK SHEET GRID (PHIẾU TÔ TRẮC NGHIỆM CHO HỌC SINH TÔ TRÒN) */}
          {docData.header.showOpticalMarkSheet && docData.questions.some((q) => q.type === 'multiple_choice') && (
            <div className="mb-5 p-3 rounded-xl border border-slate-300 bg-slate-50/70 text-[10px]">
              <div className="font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
                  <span>PHIẾU TRẢ LỜI TRẮC NGHIỆM (TÔ ĐEN Ô TRÒN PHƯƠNG ÁN ĐÚNG):</span>
                </span>
                <span className="font-mono text-slate-500">Mã đề: {docData.header.examCode || '101'}</span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 text-center font-mono">
                {docData.questions
                  .filter((q) => q.type === 'multiple_choice')
                  .map((q) => (
                    <div key={q.id} className="p-1 rounded bg-white border border-slate-200 flex flex-col items-center gap-0.5">
                      <span className="font-bold text-slate-700 text-[9px]">{q.number}</span>
                      <div className="flex gap-0.5 text-[8px] text-slate-400">
                        <span>Ⓐ</span>
                        <span>Ⓑ</span>
                        <span>Ⓒ</span>
                        <span>Ⓓ</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* BODY: QUESTIONS & FRAMED BOXES */}
          <div className="flex-1 space-y-4">
            {docData.questions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                Chưa có câu hỏi nào. Nhấp nút "Thêm câu hỏi" hoặc Dán văn bản thô để tự động phân tích.
              </div>
            ) : (
              docData.questions.map((q, idx) => {
                const boxStyle = q.customBoxStyle || docData.globalQuestionBoxStyle || 'simple_border';
                const baseContainerClass = getQuestionContainerClass(boxStyle);

                const renderQuestionContent = () => (
                  <div className="group relative z-10">
                    {/* Quick Question Actions on Hover */}
                    <div className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white rounded-lg px-2 py-1 flex items-center gap-1 text-[10px] shadow-md z-20 print:hidden">
                      <button
                        onClick={() => moveQuestion(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:text-amber-400 disabled:opacity-30"
                        title="Di chuyển lên"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveQuestion(idx, 'down')}
                        disabled={idx === docData.questions.length - 1}
                        className="p-1 hover:text-amber-400 disabled:opacity-30"
                        title="Di chuyển xuống"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onEditQuestion(q)}
                        className="p-1 hover:text-amber-400 font-semibold flex items-center gap-0.5"
                      >
                        <Edit3 className="w-3 h-3" /> Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1 hover:text-rose-400"
                        title="Xóa"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Question Header Badge & Text */}
                    <div className="flex items-start gap-2.5 text-xs leading-relaxed mb-1.5">
                      <span
                        className="px-2.5 py-0.5 text-white font-black text-xs shadow-2xs uppercase tracking-wide shrink-0 flex items-center gap-1 rounded-lg"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        Câu {q.number}
                      </span>

                      {/* Cognitive Level Badge (NB, TH, VD, VDC) */}
                      {q.cognitiveLevel && (
                        <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 text-slate-800 font-mono font-bold text-[10px] rounded-xs shrink-0">
                          {q.cognitiveLevel}
                        </span>
                      )}

                      <div className="text-slate-900 font-medium whitespace-pre-line pt-0.5 font-vietnam-pro flex-1">
                        <span className="font-bold mr-1" style={{ color: theme.primaryColor }}>
                          ({q.type === 'multiple_choice' ? 'Trắc nghiệm' : q.type === 'short_answer' ? 'Trả lời ngắn' : 'Tự luận'}):
                        </span>
                        <MathRenderer content={q.questionText} />
                      </div>
                    </div>

                    {/* Math Figure / Geometry Renderer (2D, 3D, Oxy, Variation Table) */}
                    {q.mathFigure && q.mathFigure.type !== 'none' && (
                      <div className="my-2 max-w-sm mx-auto">
                        <MathFigureRenderer figure={q.mathFigure} />
                      </div>
                    )}

                    {/* Multiple Choice Options Grid with KaTeX */}
                    {q.type === 'multiple_choice' && q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 ml-1 sm:ml-3 text-xs text-slate-800 font-vietnam-pro">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className="font-medium bg-white/90 border border-slate-200 px-3 py-1.5 shadow-2xs flex items-center gap-2 rounded-lg"
                          >
                            <span
                              className="w-5 h-5 rounded-full text-[10px] font-extrabold text-white flex items-center justify-center shrink-0 shadow-2xs"
                              style={{ backgroundColor: theme.primaryColor }}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">
                              <MathRenderer content={opt.replace(/^[A-D]\.\s*/, '')} />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inlined Teacher Answer Key if selected */}
                    {docData.showAnswerKey === 'inline_teacher' && (q.solution || q.answerKey) && (
                      <div className="mt-2.5 ml-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-vietnam-pro">
                        <div className="font-bold flex items-center gap-1 text-emerald-800 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Lời giải chi tiết (Bản dành cho Giáo viên):</span>
                        </div>
                        {q.keyMethod && (
                          <div className="text-[11px] font-semibold text-emerald-900 mb-1">
                            📌 Phương pháp: {q.keyMethod}
                          </div>
                        )}
                        <p className="whitespace-pre-line text-emerald-900 italic leading-relaxed">
                          <MathRenderer content={q.solution || `Đáp án ngắn: ${q.answerKey}`} />
                        </p>
                      </div>
                    )}

                    {/* INTELLIGENT SPACING / WORKING LINES OPTIONS */}
                    {docData.workingSpaceMode !== 'compact_none' && (
                      <>
                        {(q.spaceType === 'lines' || docData.workingSpaceMode === 'all_lines') && (
                          <div className="mt-3 space-y-2.5 ml-2">
                            {Array.from({ length: Math.max(3, q.calculatedLines || 4) }).map((_, lineIdx) => (
                              <div key={lineIdx} className="border-b border-dotted border-slate-400 h-2 w-full" />
                            ))}
                          </div>
                        )}

                        {docData.workingSpaceMode === 'auto' && (q.spaceType === 'grid_box' || q.spaceType === 'blank_box') && (
                          <div
                            className="mt-3 ml-2 border border-slate-300 rounded-xl bg-white/80 p-3 relative overflow-hidden"
                            style={{
                              minHeight: `${Math.max(100, (q.calculatedLines || 6) * 22)}px`,
                              backgroundImage:
                                q.spaceType === 'grid_box'
                                  ? 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)'
                                  : 'none',
                              backgroundSize: '20px 20px',
                            }}
                          >
                            <span className="text-[10px] text-slate-400 italic font-mono">
                              [Khung làm bài / Ô trình bày lời giải - {q.calculatedLines} dòng ô ly]
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );

                return (
                  <div
                    key={q.id}
                    className={baseContainerClass + ' relative overflow-hidden'}
                    style={{
                      borderColor: theme.primaryColor,
                      backgroundColor: theme.primaryBg,
                    }}
                  >
                    {renderQuestionContent()}
                  </div>
                );
              })
            )}
          </div>

          {/* ANSWER KEY SECTION AT BOTTOM IF SELECTED & AI SOLVED */}
          {docData.showAnswerKey === 'bottom' && (
            <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-300 page-break-before space-y-3 font-vietnam-pro">
              <div className="text-center font-bold text-xs uppercase tracking-wider" style={{ color: theme.primaryColor }}>
                --- ĐÁP ÁN & HƯỚNG DẪN GIẢI CHI TIẾT (BẢN TRA CỨU) ---
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs">
                {docData.questions.map((q) => (
                  <div key={q.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center gap-2 font-bold" style={{ color: theme.primaryColor }}>
                      <span>Câu {q.number}:</span>
                      {q.answerKey && (
                        <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-xs text-[11px] font-mono">
                          Đáp án: {q.answerKey}
                        </span>
                      )}
                    </div>
                    {q.keyMethod && (
                      <div className="text-[11px] text-slate-600 font-semibold">
                        • Phương pháp: {q.keyMethod}
                      </div>
                    )}
                    <div className="text-slate-700 whitespace-pre-line italic text-[11px] leading-relaxed">
                      <MathRenderer content={q.solution || 'Không bật tự động giải bài tập (Chỉ trích xuất đề).'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-8 pt-2 page-break-inside-avoid">
            <div className="border-t-2 border-dashed mb-2" style={{ borderColor: theme.primaryColor }} />

            <div
              className={`p-3 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2 bg-gradient-to-r ${theme.bannerGradient}`}
            >
              {/* Left: Teacher Name & Contact */}
              <div className="flex items-center gap-2 text-xs font-bold">
                <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  Biên soạn: <span className="text-amber-200 font-extrabold">{docData.footer.teacherName}</span> - SĐT/Zalo: <span className="font-mono text-amber-300 font-black">{docData.footer.contactPhone}</span>
                </span>
              </div>

              {/* Right: Slogan & Page Number */}
              <div className="flex items-center gap-3 text-xs">
                <span className="italic text-slate-100 text-[11px] font-medium hidden sm:inline truncate max-w-[280px]">
                  "{docData.footer.tagline}"
                </span>
                {docData.footer.showPageNumbers && (
                  <span className="bg-white/20 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-white/30 backdrop-blur-xs shrink-0">
                    1/1
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
