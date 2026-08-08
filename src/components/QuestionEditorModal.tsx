import React, { useState } from 'react';
import { QuestionItem, QuestionType, SpaceType, CognitiveLevel, MathFigureType } from '../types';
import { MathRenderer } from './MathRenderer';
import { MathFigureRenderer } from './MathFigureRenderer';
import { MathSymbolPalette } from './MathSymbolPalette';
import { Edit3, X, Plus, Trash2, Check, HelpCircle, Code, Eye, Sparkles } from 'lucide-react';

interface Props {
  question: QuestionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedQuestion: QuestionItem) => void;
  onDelete?: (questionId: string) => void;
}

export const QuestionEditorModal: React.FC<Props> = ({
  question,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !question) return null;

  const [localQ, setLocalQ] = useState<QuestionItem>({ ...question });
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  const handleOptionChange = (idx: number, val: string) => {
    const newOptions = [...(localQ.options || [])];
    newOptions[idx] = val;
    setLocalQ({ ...localQ, options: newOptions });
  };

  const handleAddOption = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nextLetter = letters[localQ.options?.length || 0] || 'X';
    setLocalQ({
      ...localQ,
      options: [...(localQ.options || []), `${nextLetter}. Lựa chọn mới`],
    });
  };

  const handleRemoveOption = (idx: number) => {
    const newOptions = (localQ.options || []).filter((_, i) => i !== idx);
    setLocalQ({ ...localQ, options: newOptions });
  };

  const handleInsertMathToQuestion = (snippet: string) => {
    setLocalQ({
      ...localQ,
      questionText: localQ.questionText + ' ' + snippet,
    });
  };

  const handleSave = () => {
    onSave(localQ);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <Edit3 className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold">Chỉnh Sửa Câu {localQ.number} & Công Thức Toán KaTeX</h3>
              <p className="text-xs text-slate-300">Tùy chỉnh nội dung, hình học 2D/3D, mức độ nhận thức và lời giải sư phạm</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'editor' ? 'preview' : 'editor')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {activeTab === 'editor' ? <Eye className="w-3.5 h-3.5 text-amber-300" /> : <Code className="w-3.5 h-3.5" />}
              <span>{activeTab === 'editor' ? 'Xem trước KaTeX' : 'Màn hình soạn thảo'}</span>
            </button>

            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {activeTab === 'preview' ? (
            /* LIVE PREVIEW TAB */
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 font-vietnam-pro">
              <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-900 text-white rounded-md text-xs">Câu {localQ.number}</span>
                <span>({localQ.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Tự luận'} - Mức độ: {localQ.cognitiveLevel || 'TH'}):</span>
              </div>

              <div className="text-base text-slate-900 leading-relaxed">
                <MathRenderer content={localQ.questionText} />
              </div>

              {localQ.mathFigure && localQ.mathFigure.type !== 'none' && (
                <div className="max-w-xs mx-auto my-2">
                  <MathFigureRenderer figure={localQ.mathFigure} />
                </div>
              )}

              {localQ.options && localQ.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {localQ.options.map((opt, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800">
                      <MathRenderer content={opt} />
                    </div>
                  ))}
                </div>
              )}

              {localQ.solution && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
                  <div className="font-bold text-emerald-800">💡 Hướng dẫn giải:</div>
                  <div className="whitespace-pre-line leading-relaxed">
                    <MathRenderer content={localQ.solution} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* EDITOR TAB */
            <div className="space-y-4">
              {/* Question Type, Cognitive Level & Space Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loại câu hỏi</label>
                  <select
                    value={localQ.type}
                    onChange={(e) => setLocalQ({ ...localQ, type: e.target.value as QuestionType })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                  >
                    <option value="multiple_choice">Trắc nghiệm nhiều lựa chọn</option>
                    <option value="short_answer">Trả lời ngắn (Có dòng kẻ)</option>
                    <option value="essay_problem">Bài toán tự luận / Chứng minh (Khung ô trống)</option>
                    <option value="fill_blank">Điền từ vào chỗ trống</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mức độ nhận thức (Chuẩn Bộ GD)</label>
                  <select
                    value={localQ.cognitiveLevel || 'TH'}
                    onChange={(e) => setLocalQ({ ...localQ, cognitiveLevel: e.target.value as CognitiveLevel })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                  >
                    <option value="NB">🟢 Nhận biết (NB)</option>
                    <option value="TH">🔵 Thông hiểu (TH)</option>
                    <option value="VD">🟡 Vận dụng (VD)</option>
                    <option value="VDC">🔴 Vận dụng cao (VDC)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Không gian làm bài</label>
                  <select
                    value={localQ.spaceType}
                    onChange={(e) => setLocalQ({ ...localQ, spaceType: e.target.value as SpaceType })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="none">Không có (Chỉ hỏi / Trắc nghiệm)</option>
                    <option value="lines">Dòng kẻ ô ly (3 - 6 dòng)</option>
                    <option value="grid_box">Khung lưới ô ly (Tự luận / Toán hình)</option>
                    <option value="blank_box">Khung ô trống lớn</option>
                  </select>
                </div>
              </div>

              {/* Math Figure Selection */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Hình học Toán học Đạt chuẩn (Math Figure 2D & 3D):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Loại hình minh họa:</label>
                    <select
                      value={localQ.mathFigure?.type || 'none'}
                      onChange={(e) =>
                        setLocalQ({
                          ...localQ,
                          mathFigure: {
                            type: e.target.value as MathFigureType,
                            caption: localQ.mathFigure?.caption || 'Hình vẽ minh họa toán học',
                            funcFormula: localQ.mathFigure?.funcFormula || 'y = x^2 - 4x + 3',
                          },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:outline-none font-semibold"
                    >
                      <option value="none">Không có hình vẽ</option>
                      <option value="coordinate_plane">Đồ thị hàm số trên mặt phẳng Oxy (Parabol)</option>
                      <option value="pyramid_3d">Hình chóp S.ABCD (Nét đứt & đường cao SH)</option>
                      <option value="cube_3d">Hình lập phương ABCD.A'B'C'D'</option>
                      <option value="triangle_geometry">Hình phẳng: Tam giác ABC & Đường tròn nội tiếp</option>
                      <option value="variation_table">Bảng biến thiên / Bảng xét dấu đạo hàm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Chú thích hình ảnh (Caption):</label>
                    <input
                      type="text"
                      value={localQ.mathFigure?.caption || ''}
                      onChange={(e) =>
                        setLocalQ({
                          ...localQ,
                          mathFigure: {
                            type: localQ.mathFigure?.type || 'none',
                            caption: e.target.value,
                            funcFormula: localQ.mathFigure?.funcFormula,
                          },
                        })
                      }
                      placeholder="VD: Hình 1: Đồ thị hàm số y = x^2 - 4x + 3"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Math Palette Shortcut */}
              <MathSymbolPalette onInsert={handleInsertMathToQuestion} />

              {/* Question Text */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung câu hỏi / Đề bài (Hỗ trợ công thức $...$)</label>
                <textarea
                  rows={4}
                  value={localQ.questionText}
                  onChange={(e) => setLocalQ({ ...localQ, questionText: e.target.value })}
                  className="w-full p-3 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Options if Multiple Choice */}
              {localQ.type === 'multiple_choice' && (
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700">Các lựa chọn trắc nghiệm</label>
                    <button
                      onClick={handleAddOption}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Thêm lựa chọn
                    </button>
                  </div>

                  {(localQ.options || []).map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                      <button
                        onClick={() => handleRemoveOption(idx)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Pedagogical 3-Step Solution Fields */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mã đáp án ngắn / Kết quả</label>
                    <input
                      type="text"
                      value={localQ.answerKey || ''}
                      onChange={(e) => setLocalQ({ ...localQ, answerKey: e.target.value })}
                      placeholder="VD: A hoặc x = 2 hoặc V = a^3√3/3"
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phương pháp / Kiến thức cốt lõi</label>
                    <input
                      type="text"
                      value={localQ.keyMethod || ''}
                      onChange={(e) => setLocalQ({ ...localQ, keyMethod: e.target.value })}
                      placeholder="VD: Định lý Cosin trong tam giác ABC"
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lời giải chi tiết từng bước (Step-by-step)</label>
                  <textarea
                    rows={4}
                    value={localQ.solution || ''}
                    onChange={(e) => setLocalQ({ ...localQ, solution: e.target.value })}
                    placeholder="Trình bày từng bước lời giải chi tiết..."
                    className="w-full p-3 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center shrink-0">
          {onDelete ? (
            <button
              onClick={() => {
                onDelete(localQ.id);
                onClose();
              }}
              className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Xóa câu hỏi này
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-amber-300" /> Lưu câu hỏi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
