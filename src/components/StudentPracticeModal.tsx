import React, { useState, useEffect } from 'react';
import { DocumentData, QuestionItem } from '../types';
import { MathRenderer } from './MathRenderer';
import { MathFigureRenderer } from './MathFigureRenderer';
import {
  Timer,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Trophy,
  RotateCcw,
  X,
  Award,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  docData: DocumentData;
}

export const StudentPracticeModal: React.FC<Props> = ({ isOpen, onClose, docData }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(45 * 60); // 45 phút
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || isSubmitted || !isTimerRunning) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isSubmitted, isTimerRunning]);

  if (!isOpen) return null;

  const handleSelectOption = (qNumber: number, optionLetter: string) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [qNumber]: optionLetter,
    });
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setTimeLeftSeconds(45 * 60);
    setIsTimerRunning(true);
  };

  // Tính điểm số
  const mcQuestions = docData.questions.filter((q) => q.type === 'multiple_choice');
  let correctCount = 0;

  mcQuestions.forEach((q) => {
    const userChoice = selectedAnswers[q.number];
    const rawKey = (q.answerKey || 'A').trim().toUpperCase().charAt(0);
    if (userChoice && userChoice === rawKey) {
      correctCount++;
    }
  });

  const totalScore = mcQuestions.length > 0 ? ((correctCount / mcQuestions.length) * 10).toFixed(1) : '10.0';

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-amber-600 px-6 py-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Chế Độ Học Sinh Tự Luyện & Thi Thử Trực Tuyến</span>
                <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">
                  Interactive Quiz
                </span>
              </h2>
              <p className="text-xs text-blue-100">
                {docData.header.examTitle} • {docData.header.subject}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Timer */}
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-white/20 font-mono text-sm font-bold text-amber-300">
              <Timer className="w-4 h-4 text-amber-400" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Quiz Questions */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Score Result Banner if submitted */}
          {isSubmitted && (
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-amber-300" />
                <div>
                  <div className="text-base font-extrabold">KẾT QUẢ BÀI LÀM: {totalScore} / 10 ĐIỂM</div>
                  <div className="text-xs text-emerald-100">
                    Đúng {correctCount} / {mcQuestions.length} câu trắc nghiệm. Hãy xem chi tiết lời giải từng câu bên dưới!
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-4 py-2 bg-white text-emerald-900 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm lại đề thi</span>
              </button>
            </div>
          )}

          {/* List of questions */}
          {docData.questions.map((q) => {
            const userChoice = selectedAnswers[q.number];
            const rawKey = (q.answerKey || 'A').trim().toUpperCase().charAt(0);
            const isCorrect = userChoice === rawKey;

            return (
              <div
                key={q.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isSubmitted
                    ? isCorrect
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-rose-50/70 border-rose-300'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-900 text-white font-extrabold text-[11px]">
                      Câu {q.number}
                    </span>
                    <span className="font-semibold text-slate-700">
                      ({q.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Tự luận'}):
                    </span>
                  </div>

                  {isSubmitted && q.type === 'multiple_choice' && (
                    <div className="flex items-center gap-1 font-bold text-xs">
                      {isCorrect ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Chính xác (+1.0đ)
                        </span>
                      ) : (
                        <span className="text-rose-700 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Sai (Đáp án đúng: {q.answerKey})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Question Text with KaTeX */}
                <div className="text-sm font-medium text-slate-900 mb-3 font-vietnam-pro">
                  <MathRenderer content={q.questionText} />
                </div>

                {/* Math Figure */}
                {q.mathFigure && q.mathFigure.type !== 'none' && (
                  <div className="max-w-xs mx-auto my-2">
                    <MathFigureRenderer figure={q.mathFigure} />
                  </div>
                )}

                {/* Multiple Choice Options */}
                {q.type === 'multiple_choice' && q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {q.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = userChoice === letter;
                      const isTargetCorrect = letter === rawKey;

                      let btnStyle = 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800';

                      if (isSubmitted) {
                        if (isTargetCorrect) {
                          btnStyle = 'border-emerald-500 bg-emerald-100 text-emerald-950 font-bold ring-1 ring-emerald-500';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'border-rose-500 bg-rose-100 text-rose-950 font-bold line-through';
                        }
                      } else if (isSelected) {
                        btnStyle = 'border-blue-900 bg-blue-50 text-blue-950 font-bold ring-2 ring-blue-900';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isSubmitted}
                          onClick={() => handleSelectOption(q.number, letter)}
                          className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${btnStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 ${
                              isSelected || (isSubmitted && isTargetCorrect)
                                ? 'bg-blue-900 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="flex-1 font-vietnam-pro">
                            <MathRenderer content={opt.replace(/^[A-D]\.\s*/, '')} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Solution Reveal after submission */}
                {isSubmitted && q.solution && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-emerald-800 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hướng dẫn giải chi tiết:</span>
                    </div>
                    <div className="text-xs font-vietnam-pro whitespace-pre-line leading-relaxed text-emerald-900">
                      <MathRenderer content={q.solution} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Đã làm: <span className="font-bold text-blue-900">{Object.keys(selectedAnswers).length}</span> / {docData.questions.length} câu
          </div>

          <div className="flex items-center gap-2">
            {!isSubmitted ? (
              <button
                onClick={() => setIsSubmitted(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Nộp bài & Chấm điểm tức thì</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Hoàn tất & Đóng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
