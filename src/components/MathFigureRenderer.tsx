import React, { useState } from 'react';
import { MathFigureData } from '../types';
import { renderMathFigure } from '../utils/geometryGenerator';
import { Code, Eye, Sparkles, Copy, Check } from 'lucide-react';

interface Props {
  figure?: MathFigureData;
  className?: string;
}

export const MathFigureRenderer: React.FC<Props> = ({ figure, className = '' }) => {
  const [showTikZ, setShowTikZ] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!figure || figure.type === 'none') return null;

  const result = renderMathFigure(figure);
  if (!result) return null;

  const handleCopyTikZ = () => {
    navigator.clipboard.writeText(result.tikzCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`my-3 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs ${className}`}>
      {/* Figure Top Bar */}
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100 text-[11px]">
        <span className="font-bold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>{result.caption || 'Hình vẽ Minh họa Toán học Đạt chuẩn'}</span>
        </span>

        {/* Toggle View TikZ / SVG */}
        <div className="flex items-center gap-1 print:hidden">
          <button
            type="button"
            onClick={() => setShowTikZ(!showTikZ)}
            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold flex items-center gap-1 transition-colors"
            title="Xem mã nguồn TikZ cho LaTeX"
          >
            <Code className="w-3 h-3 text-blue-600" />
            <span>{showTikZ ? 'Xem hình SVG' : 'Mã TikZ'}</span>
          </button>
        </div>
      </div>

      {/* Content: SVG or TikZ */}
      {showTikZ ? (
        <div className="relative bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
          <button
            type="button"
            onClick={handleCopyTikZ}
            className="absolute top-2 right-2 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md text-[10px] flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Đã chép' : 'Sao chép TikZ'}</span>
          </button>
          <pre>{result.tikzCode.trim()}</pre>
        </div>
      ) : (
        <div
          className="flex justify-center items-center overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: result.svgMarkup }}
        />
      )}
    </div>
  );
};
