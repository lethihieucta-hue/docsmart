import React from 'react';
import { Sparkles, Code2, Plus } from 'lucide-react';

interface Props {
  onInsert: (snippet: string) => void;
}

const MATH_SHORTCUTS = [
  { label: 'Phân số', snippet: '\\frac{a}{b}', latex: '\\frac{a}{b}' },
  { label: 'Căn bậc hai', snippet: '\\sqrt{x}', latex: '\\sqrt{x}' },
  { label: 'Căn bậc n', snippet: '\\sqrt[n]{x}', latex: '\\sqrt[n]{x}' },
  { label: 'Mũ/Lũy thừa', snippet: 'x^{2}', latex: 'x^2' },
  { label: 'Chỉ số dưới', snippet: 'x_{1}', latex: 'x_1' },
  { label: 'Tích phân', snippet: '\\int_{a}^{b} f(x)dx', latex: '\\int' },
  { label: 'Giới hạn', snippet: '\\lim_{x \\to x_0} f(x)', latex: '\\lim' },
  { label: 'Tổng xích-ma', snippet: '\\sum_{i=1}^{n} a_i', latex: '\\sum' },
  { label: 'Véc-tơ', snippet: '\\vec{v}', latex: '\\vec{v}' },
  { label: 'Đoạn thẳng hướng', snippet: '\\overrightarrow{AB}', latex: '\\overrightarrow{AB}' },
  { label: 'Góc', snippet: '\\widehat{ABC}', latex: '\\widehat{ABC}' },
  { label: 'Tam giác', snippet: '\\Delta ABC', latex: '\\Delta' },
  { label: 'Vuông góc', snippet: '\\perp', latex: '\\perp' },
  { label: 'Song song', snippet: '\\parallel', latex: '\\parallel' },
  { label: 'Thuộc', snippet: '\\in', latex: '\\in' },
  { label: 'Không thuộc', snippet: '\\notin', latex: '\\notin' },
  { label: 'Tập con', snippet: '\\subset', latex: '\\subset' },
  { label: 'Vô cùng', snippet: '+\\infty', latex: '\\infty' },
  { label: 'Cộng trừ', snippet: '\\pm', latex: '\\pm' },
  { label: 'Hệ phương trình', snippet: '\\begin{cases} x + y = 3 \\\\ 2x - y = 1 \\end{cases}', latex: '\\begin{cases}' },
  { label: 'Ma trận', snippet: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', latex: 'Matrix' },
  { label: 'Alpha', snippet: '\\alpha', latex: '\\alpha' },
  { label: 'Beta', snippet: '\\beta', latex: '\\beta' },
  { label: 'Theta', snippet: '\\theta', latex: '\\theta' },
  { label: 'Pi', snippet: '\\pi', latex: '\\pi' },
  { label: 'Delta', snippet: '\\Delta', latex: '\\Delta' },
];

export const MathSymbolPalette: React.FC<Props> = ({ onInsert }) => {
  return (
    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Thanh chèn nhanh Ký hiệu & Công thức Toán KaTeX / LaTeX:</span>
        </span>
        <span className="text-[10px] text-slate-400 font-normal">Nhấp để chèn vào vị trí con trỏ</span>
      </div>

      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-0.5">
        {MATH_SHORTCUTS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onInsert(`$${item.snippet}$`)}
            className="px-2 py-1 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-900 border border-slate-200 hover:border-blue-300 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 shadow-2xs transition-all"
            title={`Chèn công thức: ${item.snippet}`}
          >
            <span className="text-[10px] text-blue-700 font-bold">{item.latex}</span>
            <span className="text-[9px] text-slate-500 font-sans">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
