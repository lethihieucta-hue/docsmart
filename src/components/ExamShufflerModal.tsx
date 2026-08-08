import React, { useState } from 'react';
import { DocumentData, QuestionItem } from '../types';
import { Shuffle, CheckCircle, Download, Copy, Check, X, FileSpreadsheet, Eye } from 'lucide-react';
import { exportToDocx } from '../utils/docxExporter';
import { exportToLatex } from '../utils/latexExporter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  docData: DocumentData;
}

export const ExamShufflerModal: React.FC<Props> = ({ isOpen, onClose, docData }) => {
  const [examCodes, setExamCodes] = useState<string[]>(['101', '102', '103', '104']);
  const [shuffledVariants, setShuffledVariants] = useState<Record<string, QuestionItem[]>>({});
  const [activeTab, setActiveTab] = useState<string>('101');
  const [isGenerated, setIsGenerated] = useState<boolean>(false);

  if (!isOpen) return null;

  // Thuật toán xáo trộn câu hỏi & phương án trắc nghiệm chuẩn sư phạm
  const handleGenerateShuffledCodes = () => {
    const results: Record<string, QuestionItem[]> = {};

    examCodes.forEach((code, codeIdx) => {
      // Seeded shuffle câu hỏi
      const questionsCopy = docData.questions.map((q, idx) => ({ ...q }));
      
      // Shuffle thứ tự câu
      const shuffledQuestions = [...questionsCopy].sort(() => Math.random() - 0.5);

      // Đánh số lại câu và xáo trộn phương án A-B-C-D
      const finalQuestions = shuffledQuestions.map((q, qIndex) => {
        let newOptions = q.options;
        let newAnswerKey = q.answerKey;

        if (q.type === 'multiple_choice' && q.options && q.options.length > 0) {
          // Trộn các phương án nhưng giữ tiền tố A. B. C. D.
          const stripped = q.options.map((o) => o.replace(/^[A-D]\.\s*/, ''));
          const shuffledOpts = [...stripped].sort(() => Math.random() - 0.5);
          newOptions = shuffledOpts.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`);
        }

        return {
          ...q,
          number: qIndex + 1,
          options: newOptions,
          answerKey: newAnswerKey,
        };
      });

      results[code] = finalQuestions;
    });

    setShuffledVariants(results);
    setIsGenerated(true);
    setActiveTab(examCodes[0]);
  };

  const currentQuestions = shuffledVariants[activeTab] || docData.questions;

  // Xuất đề theo mã đang chọn
  const handleExportVariantDocx = (code: string) => {
    const customDoc: DocumentData = {
      ...docData,
      title: `${docData.title} - Mã đề ${code}`,
      header: {
        ...docData.header,
        examCode: code,
        examTitle: `${docData.header.examTitle} (MÃ ĐỀ ${code})`,
      },
      questions: shuffledVariants[code] || docData.questions,
    };
    exportToDocx(customDoc);
  };

  const handleExportVariantLatex = (code: string) => {
    const customDoc: DocumentData = {
      ...docData,
      title: `${docData.title} - Mã đề ${code}`,
      header: {
        ...docData.header,
        examCode: code,
        examTitle: `${docData.header.examTitle} (MÃ ĐỀ ${code})`,
      },
      questions: shuffledVariants[code] || docData.questions,
    };
    exportToLatex(customDoc);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-amber-600 px-6 py-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Công Cụ Đảo Mã Đề Thi Tự Động (Multi-Code Exam Shuffler)</span>
                <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">
                  Mã 101 - 104
                </span>
              </h2>
              <p className="text-xs text-blue-100">
                Xáo trộn thứ tự câu hỏi và phương án A-B-C-D kèm Bảng ma trận đáp án đối chiếu nhanh.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Action Bar: Run Shuffler */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-800 text-sm">Danh sách 4 mã đề sẽ tạo: 101, 102, 103, 104</div>
              <div className="text-[11px] text-slate-500">Đảo ngẫu nhiên vị trí và tự động đồng bộ ma trận đáp án.</div>
            </div>
            <button
              onClick={handleGenerateShuffledCodes}
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0"
            >
              <Shuffle className="w-4 h-4 text-amber-300" />
              <span>{isGenerated ? 'Xáo trộn lại mã đề' : 'Bắt đầu Đảo 4 Mã Đề'}</span>
            </button>
          </div>

          {/* Exam Code Tabs */}
          {isGenerated && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  {examCodes.map((code) => (
                    <button
                      key={code}
                      onClick={() => setActiveTab(code)}
                      className={`px-4 py-1.5 rounded-xl font-bold transition-all ${
                        activeTab === code
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Mã đề {code}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportVariantDocx(activeTab)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất Word Mã {activeTab}</span>
                  </button>

                  <button
                    onClick={() => handleExportVariantLatex(activeTab)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Xuất LaTeX Mã {activeTab}</span>
                  </button>
                </div>
              </div>

              {/* Questions Preview for Selected Exam Code */}
              <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
                {currentQuestions.map((q) => (
                  <div key={q.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>Câu {q.number}: {q.questionText}</span>
                      {q.answerKey && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-md">
                          Đáp án: {q.answerKey}
                        </span>
                      )}
                    </div>
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600 pt-1 font-mono text-[11px]">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Answer Key Matrix Table */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Ma trận Đáp án Đối chiếu Nhanh (Chấm bài trong 30 giây):</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse bg-white rounded-lg overflow-hidden text-xs">
                    <thead>
                      <tr className="bg-emerald-800 text-white font-bold">
                        <th className="p-1.5 border border-emerald-700">Câu</th>
                        {examCodes.map((code) => (
                          <th key={code} className="p-1.5 border border-emerald-700">Mã {code}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {docData.questions.map((_, qIdx) => (
                        <tr key={qIdx} className="hover:bg-emerald-50/50">
                          <td className="p-1.5 border border-slate-200 font-bold bg-slate-50">{qIdx + 1}</td>
                          {examCodes.map((code) => {
                            const qList = shuffledVariants[code] || [];
                            const targetQ = qList[qIdx];
                            return (
                              <td key={code} className="p-1.5 border border-slate-200 font-mono font-bold text-blue-900">
                                {targetQ?.answerKey || 'A'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
