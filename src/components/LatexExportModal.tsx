import React, { useState } from 'react';
import { DocumentData } from '../types';
import { generateLatexSource, exportToLatex } from '../utils/latexExporter';
import { Code, Download, Copy, Check, X, ExternalLink, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  docData: DocumentData;
}

export const LatexExportModal: React.FC<Props> = ({ isOpen, onClose, docData }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const latexCode = generateLatexSource(docData);

  const handleCopy = () => {
    navigator.clipboard.writeText(latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    exportToLatex(docData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-amber-600 px-6 py-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-serif text-lg font-bold border border-white/20">
              \TeX
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Xuất Bản Mã Nguồn LaTeX (.tex)</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  Chuẩn Overleaf / TeXStudio
                </span>
              </h2>
              <p className="text-xs text-blue-100">
                Tích hợp sẵn gói tiếng Việt `[utf8]{vietnam}`, công thức `amsmath`, `tikz` và khung màu `tcolorbox`.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Code Preview */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 bg-slate-900 text-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span className="font-mono flex items-center gap-1.5">
              <Code className="w-4 h-4 text-amber-400" />
              <span>Tai_Lieu_Toan_DocuSmart.tex ({latexCode.split('\n').length} dòng)</span>
            </span>
            <div className="flex items-center gap-2">
              <a
                href="https://www.overleaf.com/project"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <span>Mở Overleaf</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <pre className="font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto p-3 bg-slate-950/80 rounded-xl border border-slate-800 select-all max-h-[50vh]">
            {latexCode}
          </pre>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 italic">
            💡 Bạn có thể dán trực tiếp vào Overleaf hoặc biên dịch bằng pdfLaTeX / XeLaTeX.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép mã!' : 'Sao chép vào Clipboard'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Tải file .tex</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
