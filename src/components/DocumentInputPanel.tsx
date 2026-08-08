import React, { useState } from 'react';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocs';
import { QuestionBoxStyle, WorkingSpaceMode } from '../types';
import { MathSymbolPalette } from './MathSymbolPalette';
import {
  Sparkles,
  FileText,
  Upload,
  RefreshCw,
  Layers,
  CheckSquare,
  Square,
  Box,
  Space,
  BookOpen,
  Code2,
  Wand2,
  FileType,
} from 'lucide-react';

interface Props {
  rawText: string;
  onRawTextChange: (text: string) => void;
  onRunAiProcessing: () => void;
  onOpenPromptGenerator: () => void;
  isLoading: boolean;
  onSelectPreset: (docIndex: number) => void;
  enableAiSolve: boolean;
  onToggleEnableAiSolve: (val: boolean) => void;
  workingSpaceMode: WorkingSpaceMode;
  onChangeWorkingSpaceMode: (mode: WorkingSpaceMode) => void;
  questionBoxStyle: QuestionBoxStyle;
  onChangeQuestionBoxStyle: (style: QuestionBoxStyle) => void;
}

declare global {
  interface Window {
    mammoth?: any;
    pdfjsLib?: any;
  }
}

// Dynamic script loader helper for PDF.js and Mammoth.js
async function loadScriptIfNeeded(src: string, globalName: string): Promise<any> {
  if ((window as any)[globalName]) {
    return (window as any)[globalName];
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any)[globalName]));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve((window as any)[globalName]);
    script.onerror = () => reject(new Error(`Không thể tải script ${src}`));
    document.head.appendChild(script);
  });
}

export const DocumentInputPanel: React.FC<Props> = ({
  rawText,
  onRawTextChange,
  onRunAiProcessing,
  onOpenPromptGenerator,
  isLoading,
  onSelectPreset,
  enableAiSolve,
  onToggleEnableAiSolve,
  workingSpaceMode,
  onChangeWorkingSpaceMode,
  questionBoxStyle,
  onChangeQuestionBoxStyle,
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [showMathPalette, setShowMathPalette] = useState<boolean>(true);
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);
  const [fileStatusMsg, setFileStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReadingFile(true);
    setFileStatusMsg({ text: `Đang phân tích tệp: ${file.name}...` });

    const fileNameLower = file.name.toLowerCase();

    // 1. Handle DOCX File using Mammoth.js
    if (fileNameLower.endsWith('.docx') || fileNameLower.endsWith('.doc')) {
      try {
        let mammothLib = window.mammoth;
        if (!mammothLib) {
          mammothLib = await loadScriptIfNeeded(
            'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js',
            'mammoth'
          );
        }

        const arrayBuffer = await file.arrayBuffer();
        if (mammothLib && mammothLib.extractRawText) {
          const result = await mammothLib.extractRawText({ arrayBuffer });
          const extractedText = (result?.value || '').trim();
          if (extractedText.length > 0) {
            onRawTextChange(extractedText);
            setFileStatusMsg({
              text: `✅ Đã trích xuất thành công ${extractedText.length} ký tự từ file Word (${file.name})!`,
            });
          } else {
            throw new Error('File Word rỗng hoặc không chứa văn bản.');
          }
        } else {
          throw new Error('Thư viện xử lý Word chưa sẵn sàng.');
        }
      } catch (err: any) {
        console.error('Lỗi đọc Word DOCX:', err);
        setFileStatusMsg({ text: `Lỗi đọc file Word: ${err.message}`, isError: true });
      } finally {
        setIsReadingFile(false);
      }
      return;
    }

    // 2. Handle PDF File using PDF.js
    if (fileNameLower.endsWith('.pdf')) {
      try {
        let pdfjs = window.pdfjsLib || (window as any)['pdfjs-dist/build/pdf'];
        if (!pdfjs) {
          pdfjs = await loadScriptIfNeeded(
            'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.min.js',
            'pdfjsLib'
          );
        }

        if (pdfjs) {
          if (!pdfjs.GlobalWorkerOptions.workerSrc) {
            pdfjs.GlobalWorkerOptions.workerSrc =
              'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js';
          }

          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
          const pdfDoc = await loadingTask.promise;
          let fullPdfText = '';

          for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(' ');
            fullPdfText += `\n--- [Trang ${pageNum}] ---\n` + pageText;
          }

          if (fullPdfText.trim().length > 0) {
            onRawTextChange(fullPdfText.trim());
            setFileStatusMsg({
              text: `✅ Đã đọc thành công ${pdfDoc.numPages} trang PDF! Bạn có thể chỉnh sửa hoặc bấm Giải chi tiết ngay.`,
            });
          } else {
            throw new Error('File PDF scan dạng ảnh không có lớp ký tự.');
          }
        } else {
          throw new Error('Không thể tải thư viện PDF.js. Vui lòng kiểm tra kết nối mạng.');
        }
      } catch (err: any) {
        console.error('Lỗi đọc PDF:', err);
        setFileStatusMsg({ text: `Lỗi đọc file PDF: ${err.message}`, isError: true });
      } finally {
        setIsReadingFile(false);
      }
      return;
    }

    // 3. Handle Plain Text, LaTeX (.tex), Markdown
    try {
      const text = await file.text();
      if (text.trim().length > 0) {
        onRawTextChange(text.trim());
        setFileStatusMsg({ text: `✅ Đã nạp thành công file ${file.name} (${text.length} ký tự)!` });
      } else {
        setFileStatusMsg({ text: 'File rỗng.', isError: true });
      }
    } catch (err: any) {
      setFileStatusMsg({ text: `Lỗi đọc file: ${err.message}`, isError: true });
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleInsertSnippet = (snippet: string) => {
    onRawTextChange(rawText + ' ' + snippet);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
      {/* Title & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">1. Tiếp Nhận Văn Bản Thô & Soạn Thảo Toán Học</h2>
            <p className="text-xs text-slate-500">Tự động nhận diện công thức KaTeX ($...$), hình học 2D/3D & bảng biến thiên</p>
          </div>
        </div>

        {/* Action Controls in Header: AI Exam Prompt Generator & Sample Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenPromptGenerator}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-lg text-xs font-black flex items-center gap-1.5 shadow-xs transition-all animate-pulse"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>✨ AI Sinh Đề Từ Gợi Ý</span>
          </button>

          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPresetIndex}
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                setSelectedPresetIndex(idx);
                onSelectPreset(idx);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
            >
              {SAMPLE_DOCUMENTS.map((doc, idx) => (
                <option key={idx} value={idx}>
                  Nạp Đề Mẫu: {doc.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* File status notice with clear coloring */}
      {fileStatusMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
            fileStatusMsg.isError
              ? 'bg-rose-50 border border-rose-200 text-rose-900'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
          }`}
        >
          <span>{fileStatusMsg.text}</span>
          <button
            onClick={() => setFileStatusMsg(null)}
            className="text-slate-500 hover:text-slate-900 text-[11px] font-bold underline ml-3 shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Raw Textarea */}
      <div className="relative">
        <textarea
          rows={6}
          value={rawText}
          onChange={(e) => onRawTextChange(e.target.value)}
          placeholder="Dán câu hỏi, đề thi toán học thô hoặc tải lên tệp PDF, DOCX, LaTeX tại đây (Các công thức $...$, $$...$$, hình học 3D được bảo toàn nguyên vẹn)..."
          className="w-full p-4 text-xs font-mono border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all leading-relaxed"
        />

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMathPalette(!showMathPalette)}
            className="px-2 py-0.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-colors"
          >
            <Code2 className="w-3 h-3 text-blue-600" />
            <span>{showMathPalette ? 'Ẩn bảng ký hiệu' : 'Hiện bảng ký hiệu'}</span>
          </button>
          <span className="text-[10px] text-slate-400 font-mono">{rawText.length} ký tự</span>
        </div>
      </div>

      {/* Math Symbol Palette Toolbar */}
      {showMathPalette && <MathSymbolPalette onInsert={handleInsertSnippet} />}

      {/* THREE EXPLICIT PEDAGOGICAL TOGGLES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
        {/* Toggle 1: Enable AI Solve or Extract Only */}
        <div className="flex flex-col gap-1.5 justify-center">
          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Tự động Giải bài tập (AI Solve):</span>
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleEnableAiSolve(true)}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                enableAiSolve
                  ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Có Lời giải chi tiết</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleEnableAiSolve(false)}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                !enableAiSolve
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Chỉ trích xuất đề</span>
            </button>
          </div>
        </div>

        {/* Toggle 2: Working Space / Lines Options */}
        <div className="flex flex-col gap-1.5 justify-center">
          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <Space className="w-3.5 h-3.5 text-blue-600" />
            <span>Khoảng trống làm bài / Ô trình bày:</span>
          </label>
          <select
            value={workingSpaceMode}
            onChange={(e) => onChangeWorkingSpaceMode(e.target.value as WorkingSpaceMode)}
            className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="auto">Tự động (Theo phân loại câu tự luận/hình học)</option>
            <option value="all_lines">Thêm dòng kẻ ô ly cho TẤT CẢ các câu</option>
            <option value="compact_none">Tối ưu tiết kiệm giấy (Không thêm ô trống)</option>
          </select>
        </div>

        {/* Toggle 3: Question Box Framing Style */}
        <div className="flex flex-col gap-1.5 justify-center">
          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-purple-600" />
            <span>Phong cách Đóng khung câu hỏi:</span>
          </label>
          <select
            value={questionBoxStyle}
            onChange={(e) => onChangeQuestionBoxStyle(e.target.value as QuestionBoxStyle)}
            className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="simple_border">Khung viền nét mảnh cổ điển</option>
            <option value="card_shadow">Khung Thẻ Nổi (Modern Card & Shadow)</option>
            <option value="gradient_border">Khung Viền Gradient Rực Rỡ</option>
            <option value="left_accent_stripe">Khung Dải Màu Nhấn Bên Trái</option>
            <option value="double_border">Khung Viền Đôi Chuẩn Bộ GD&ĐT</option>
            <option value="none">Không đóng khung (Phẳng)</option>
          </select>
        </div>
      </div>

      {/* Action Bar: Smart File Upload (PDF, DOCX, TEX) & AI Execute Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Upload File with support for PDF, DOCX, TEX */}
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer border border-slate-300 transition-colors shadow-2xs">
            <Upload className="w-4 h-4 text-blue-700" />
            <span>{isReadingFile ? 'Đang đọc tệp...' : 'Tải lên PDF / Word (.docx) / LaTeX (.tex)'}</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.tex,.txt,.md"
              onChange={handleFileUpload}
              disabled={isReadingFile}
              className="hidden"
            />
          </label>
        </div>

        {/* AI Execute Button */}
        <button
          onClick={onRunAiProcessing}
          disabled={isLoading || isReadingFile || !rawText.trim()}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-900 via-indigo-900 to-amber-600 hover:from-blue-950 hover:to-indigo-950 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>AI đang phân tích cấu trúc Toán, hình vẽ & lời giải...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{enableAiSolve ? 'Tự động Trích xuất, Vẽ hình & Giải chi tiết' : 'Trích xuất & Bố trí Đề thi'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
