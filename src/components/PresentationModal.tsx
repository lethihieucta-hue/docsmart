import React, { useState } from 'react';
import { DocumentData, QuestionItem } from '../types';
import { MathRenderer } from './MathRenderer';
import { MathFigureRenderer } from './MathFigureRenderer';
import {
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
  X,
  GraduationCap,
  Download,
  BookOpen,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  docData: DocumentData;
}

export const PresentationModal: React.FC<Props> = ({ isOpen, onClose, docData }) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  if (!isOpen || docData.questions.length === 0) return null;

  const currentQ = docData.questions[currentIdx] || docData.questions[0];

  const handleNext = () => {
    if (currentIdx < docData.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowSolution(false);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setShowSolution(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 overflow-hidden select-none">
      {/* Top Navbar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-amber-500 flex items-center justify-center font-bold text-white text-lg shadow-md">
            ∑
          </div>
          <div>
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <span>{docData.header.examTitle}</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                Slide {currentIdx + 1} / {docData.questions.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {docData.header.schoolName} • GV: {docData.footer.teacherName}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              showSolution
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
            }`}
          >
            {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showSolution ? 'Ẩn lời giải' : 'Hiện lời giải chi tiết'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Content Canvas */}
      <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full my-6 p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-y-auto space-y-6">
        {/* Question Header Badge */}
        <div className="flex items-center justify-between gap-3">
          <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm shadow-md">
            CÂU {currentQ.number} ({currentQ.type === 'multiple_choice' ? 'Trắc nghiệm' : currentQ.type === 'short_answer' ? 'Trả lời ngắn' : 'Tự luận'})
          </span>
          {currentQ.cognitiveLevel && (
            <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-500/30">
              Mức độ: {currentQ.cognitiveLevel === 'NB' ? 'Nhận biết' : currentQ.cognitiveLevel === 'TH' ? 'Thông hiểu' : currentQ.cognitiveLevel === 'VD' ? 'Vận dụng' : 'Vận dụng cao'}
            </span>
          )}
        </div>

        {/* Question Text with KaTeX */}
        <div className="text-lg sm:text-2xl font-medium leading-relaxed text-slate-100 font-vietnam-pro">
          <MathRenderer content={currentQ.questionText} />
        </div>

        {/* Math Figure / Geometry if exists */}
        {currentQ.mathFigure && currentQ.mathFigure.type !== 'none' && (
          <div className="max-w-md mx-auto">
            <MathFigureRenderer figure={currentQ.mathFigure} />
          </div>
        )}

        {/* Options for Multiple Choice */}
        {currentQ.type === 'multiple_choice' && currentQ.options && currentQ.options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.options.map((opt, optIdx) => (
              <div
                key={optIdx}
                className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-base font-medium flex items-center gap-3 text-slate-200"
              >
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="flex-1">
                  <MathRenderer content={opt.replace(/^[A-D]\.\s*/, '')} />
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Animated Solution Box */}
        {showSolution && (
          <div className="p-5 rounded-2xl bg-emerald-950/70 border-2 border-emerald-500/60 text-emerald-100 space-y-3 animate-fadeIn">
            <div className="font-extrabold text-sm text-emerald-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                HƯỚNG DẪN GIẢI CHI TIẾT:
              </span>
              {currentQ.answerKey && (
                <span className="bg-emerald-500 text-slate-950 font-black px-3 py-1 rounded-lg text-sm">
                  ĐÁP ÁN: {currentQ.answerKey}
                </span>
              )}
            </div>

            {currentQ.keyMethod && (
              <div className="text-sm font-semibold text-emerald-200 bg-emerald-900/50 p-2.5 rounded-xl border border-emerald-700/50">
                📌 Phương pháp: {currentQ.keyMethod}
              </div>
            )}

            <div className="text-base sm:text-lg leading-relaxed text-emerald-50 font-vietnam-pro whitespace-pre-line">
              <MathRenderer content={currentQ.solution || 'Đang cập nhật lời giải.'} />
            </div>

            {currentQ.mistakeWarning && (
              <div className="text-xs text-rose-200 bg-rose-950/50 p-2 rounded-lg border border-rose-800/50">
                ⚠️ Sai lầm thường gặp: {currentQ.mistakeWarning}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Slider Navigation */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Câu trước (Phím ←)</span>
        </button>

        {/* Question Bubbles Quick Jump */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto max-w-md px-2">
          {docData.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => {
                setCurrentIdx(idx);
                setShowSolution(false);
              }}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                currentIdx === idx
                  ? 'bg-blue-600 text-white scale-110 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIdx === docData.questions.length - 1}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <span>Câu tiếp (Phím →)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
