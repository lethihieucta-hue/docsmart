import React, { useState, useEffect } from 'react';
import { Key, Sparkles, ExternalLink, X, Check, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string, model: string) => void;
}

// Exactly ordered as requested in AI_INSTRUCTIONS.md:
// 1. gemini-3-flash-preview (Default)
// 2. gemini-3-pro-preview
// 3. gemini-2.5-flash
const AI_MODELS = [
  {
    id: 'gemini-3-flash-preview',
    name: 'gemini-3-flash-preview (Mặc định / Default)',
    description: 'Tốc độ phản hồi cực nhanh, tối ưu hóa xử lý văn bản và công thức toán học.',
    recommended: true,
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'gemini-3-pro-preview',
    description: 'Mô hình suy luận sâu, xử lý các bài toán nâng cao, hình học 3D & Olympic.',
    recommended: false,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'gemini-2.5-flash',
    description: 'Mô hình dự phòng ổn định cao khi các mô hình chính gặp hạn mức quota.',
    recommended: false,
  },
];

export const ApiKeySettingsModal: React.FC<Props> = ({ isOpen, onClose, onSaveKey }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-flash-preview');

  useEffect(() => {
    const savedKey = localStorage.getItem('user_gemini_api_key') || '';
    const savedModel = localStorage.getItem('user_gemini_model') || 'gemini-3-flash-preview';
    setApiKey(savedKey);
    setSelectedModel(savedModel);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('user_gemini_api_key', apiKey.trim());
    localStorage.setItem('user_gemini_model', selectedModel);
    onSaveKey(apiKey.trim(), selectedModel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-amber-600 px-6 py-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-base font-bold">Thiết lập Model & API Key (AI Settings)</h2>
              <p className="text-xs text-blue-100">Quản lý khóa API và cấu hình thứ tự ưu tiên mô hình AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Mandatory Key Instructions Box */}
          <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-900 text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Hướng dẫn lấy Gemini API Key:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-700">
              Để sử dụng ứng dụng, vui lòng truy cập đường link sau để tạo và sao chép API Key hoàn toàn miễn phí:
            </p>
            <a
              href="https://aistudio.google.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-black text-blue-700 hover:text-blue-900 hover:underline bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-2xs"
            >
              <span>👉 https://aistudio.google.com/api-keys (Nhấp vào đây để lấy Key)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>Google Gemini API Key:</span>
                <span className="text-rose-600 font-bold">*</span>
              </span>
              {apiKey ? (
                <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                  <Check className="w-3 h-3" /> Đã lưu vào localStorage
                </span>
              ) : (
                <span className="text-rose-600 font-bold text-[11px] animate-pulse">
                  ⚠️ Bắt buộc nhập API key để chạy app
                </span>
              )}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Dán mã API Key (AIzaSy...) vào đây"
              className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white"
            />
          </div>

          {/* AI Model Selection Cards (Displayed as Cards in exact order) */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">
              Danh sách chọn Model AI (Dạng thẻ / Cards):
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setSelectedModel(model.id)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedModel === model.id
                      ? 'border-blue-900 bg-blue-50/80 ring-2 ring-blue-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="pr-2">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="font-mono text-xs">{model.name}</span>
                      {model.recommended && (
                        <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-2xs">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 pt-0.5">{model.description}</p>
                  </div>
                  {selectedModel === model.id && (
                    <div className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-amber-300" />
            <span>Lưu cấu hình API Key</span>
          </button>
        </div>
      </div>
    </div>
  );
};
