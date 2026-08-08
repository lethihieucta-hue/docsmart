import React from 'react';
import { TemplateId } from '../types';
import { TEMPLATE_THEMES } from '../utils/templateThemes';
import { Layout, Check, Sparkles, Palette } from 'lucide-react';

interface Props {
  selectedTemplateId: TemplateId;
  onSelectTemplate: (id: TemplateId) => void;
}

export const TemplateSelector: React.FC<Props> = ({
  selectedTemplateId,
  onSelectTemplate,
}) => {
  const templateKeys = Object.keys(TEMPLATE_THEMES) as TemplateId[];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
            <Palette className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">2. Bộ Sưu Tập 10 Mẫu Thiết Kế Sư Phạm Đa Dạng (Math Templates)</h2>
            <p className="text-xs text-slate-500">Chuẩn Bộ GD&ĐT, Chuyên Toán Olympic, AMS-LaTeX, STEM Emerald, Sư Phạm & Chibi</p>
          </div>
        </div>
        <div className="text-[10px] bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          10 Mẫu Thiết Kế Sư Phạm Cao Cấp
        </div>
      </div>

      {/* Grid of 10 Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {templateKeys.map((id) => {
          const theme = TEMPLATE_THEMES[id];
          const isSelected = selectedTemplateId === id;

          return (
            <button
              key={id}
              onClick={() => onSelectTemplate(id)}
              className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between overflow-hidden group ${
                isSelected
                  ? 'border-blue-900 bg-blue-50/70 ring-2 ring-blue-900 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Top Colorful Ribbon */}
              <div
                className={`h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r ${theme.bannerGradient}`}
              />

              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-blue-900 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3" />
                </div>
              )}

              <div className="mt-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-3 h-3 rounded-full inline-block shadow-2xs shrink-0"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{theme.badgeTitle || theme.name}</h3>
                </div>
                <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">
                  {theme.description}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="font-mono text-slate-400 text-[9px] uppercase truncate max-w-[80px]">{theme.variant}</span>
                <span className="font-bold px-2 py-0.5 rounded-md" style={{ color: theme.primaryColor, backgroundColor: theme.primaryBg }}>
                  {isSelected ? 'Đang chọn' : 'Áp dụng'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
