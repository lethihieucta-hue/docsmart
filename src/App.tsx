import React, { useState, useEffect } from 'react';
import { DocumentData, QuestionItem, TemplateId, HeaderConfig, FooterConfig } from './types';
import { SAMPLE_DOCUMENTS } from './data/sampleDocs';
import { DocumentInputPanel } from './components/DocumentInputPanel';
import { TemplateSelector } from './components/TemplateSelector';
import { AiStatusOutputPanel } from './components/AiStatusOutputPanel';
import { DocumentLivePreview } from './components/DocumentLivePreview';
import { HeaderFooterEditor } from './components/HeaderFooterEditor';
import { QuestionEditorModal } from './components/QuestionEditorModal';
import { LatexExportModal } from './components/LatexExportModal';
import { ApiKeySettingsModal } from './components/ApiKeySettingsModal';
import { ExamShufflerModal } from './components/ExamShufflerModal';
import { PresentationModal } from './components/PresentationModal';
import { StudentPracticeModal } from './components/StudentPracticeModal';
import { exportToDocx } from './utils/docxExporter';
import { exportToLatex } from './utils/latexExporter';
import {
  Sparkles,
  BookOpen,
  FileText,
  Sliders,
  Download,
  Printer,
  CheckCircle2,
  GraduationCap,
  Heart,
  Key,
  Shuffle,
  Tv,
  Trophy,
  AlertCircle,
} from 'lucide-react';

export default function App() {
  // Initial state populated with the first sample document
  const [docData, setDocData] = useState<DocumentData>({ ...SAMPLE_DOCUMENTS[0] });
  const [rawText, setRawText] = useState<string>(SAMPLE_DOCUMENTS[0].rawText);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modals state
  const [isHeaderFooterModalOpen, setIsHeaderFooterModalOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isLatexModalOpen, setIsLatexModalOpen] = useState<boolean>(false);
  const [isShufflerModalOpen, setIsShufflerModalOpen] = useState<boolean>(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);
  const [isStudentPracticeOpen, setIsStudentPracticeOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const key = localStorage.getItem('user_gemini_api_key');
    if (key && key.trim().length > 0) {
      setHasApiKey(true);
    } else {
      setHasApiKey(false);
      // Automatically prompt new users to set up their API Key on initial visit
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Select Sample Preset
  const handleSelectPreset = (index: number) => {
    const preset = SAMPLE_DOCUMENTS[index];
    if (preset) {
      setDocData({ ...preset });
      setRawText(preset.rawText);
      setApiError(null);
      showToast(`Đã nạp mẫu: ${preset.title}`);
    }
  };

  // Run AI Processing via Express Server /api/process-doc with Fallback Retry
  const handleRunAiProcessing = async () => {
    if (!rawText.trim()) return;

    setIsLoading(true);
    setApiError(null);
    const userApiKey = localStorage.getItem('user_gemini_api_key') || '';
    const userModel = localStorage.getItem('user_gemini_model') || 'gemini-3-flash-preview';

    try {
      const res = await fetch('/api/process-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          subject: docData.header.subject,
          templateId: docData.templateId,
          enableAiSolve: docData.enableAiSolve,
          apiKey: userApiKey,
          model: userModel,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}: Lỗi kết nối API`);
      }

      const data = await res.json();
      if (data.questions && Array.isArray(data.questions)) {
        setDocData((prev) => ({
          ...prev,
          questions: data.questions,
          rawText,
        }));
        setApiError(null);
        showToast(`AI đã trích xuất & giải thành công ${data.questions.length} câu hỏi Toán!`);
      }
    } catch (err: any) {
      console.error('All AI models failed:', err);
      const errMsg = err.message || '429 RESOURCE_EXHAUSTED / Lỗi kết nối API';
      setApiError(errMsg);
      showToast(`Lỗi: ${errMsg}`);

      // Fallback local parsing logic
      const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
      const fallbackQuestions: QuestionItem[] = [];
      let currentQ: Partial<QuestionItem> | null = null;
      let qNum = 1;

      lines.forEach((line) => {
        if (/^(Câu|Bài|Question)\s*\d+/i.test(line)) {
          if (currentQ && currentQ.questionText) {
            fallbackQuestions.push({
              id: `q_fb_${Date.now()}_${qNum}`,
              number: qNum++,
              type: currentQ.options && currentQ.options.length > 0 ? 'multiple_choice' : 'short_answer',
              cognitiveLevel: qNum <= 2 ? 'NB' : qNum <= 4 ? 'TH' : 'VD',
              questionText: currentQ.questionText,
              options: currentQ.options || [],
              solution: currentQ.solution || 'Lời giải chi tiết đang được giáo viên biên soạn.',
              keyMethod: 'Áp dụng định lý & công thức toán học cơ bản.',
              answerKey: currentQ.answerKey || (currentQ.options && currentQ.options.length > 0 ? 'A' : ''),
              spaceType: currentQ.options && currentQ.options.length > 0 ? 'none' : 'lines',
              calculatedLines: 4,
              difficulty: 'medium',
              topic: 'Toán học THPT',
            });
          }
          currentQ = { questionText: line, options: [] };
        } else if (/^[A-D]\./.test(line.trim())) {
          if (!currentQ) {
            currentQ = { questionText: 'Câu hỏi', options: [] };
          }
          currentQ.options = [...(currentQ.options || []), line.trim()];
        } else {
          if (currentQ) {
            currentQ.questionText += '\n' + line;
          }
        }
      });

      if (currentQ && (currentQ as any).questionText) {
        fallbackQuestions.push({
          id: `q_fb_${Date.now()}_${qNum}`,
          number: qNum,
          type: currentQ.options && currentQ.options.length > 0 ? 'multiple_choice' : 'short_answer',
          cognitiveLevel: 'VD',
          questionText: (currentQ as any).questionText,
          options: currentQ.options || [],
          solution: currentQ.solution || 'Lời giải chi tiết từng bước.',
          keyMethod: 'Phương pháp phân tích & biến đổi tương đương.',
          answerKey: currentQ.answerKey || 'A',
          spaceType: currentQ.options && currentQ.options.length > 0 ? 'none' : 'lines',
          calculatedLines: 4,
          difficulty: 'medium',
          topic: 'Toán học THPT',
        });
      }

      if (fallbackQuestions.length > 0) {
        setDocData((prev) => ({
          ...prev,
          questions: fallbackQuestions,
          rawText,
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Export to Word (.docx)
  const handleExportDocx = async () => {
    try {
      showToast('Đang khởi tạo file Word (.docx)...');
      await exportToDocx(docData);
      showToast('Đã xuất file Word thành công!');
    } catch (err: any) {
      console.error('Word export error:', err);
      showToast('Có lỗi khi tạo file Word.');
    }
  };

  // Export to LaTeX (.tex)
  const handleExportLatex = () => {
    setIsLatexModalOpen(true);
  };

  // Print PDF
  const handlePrintPdf = () => {
    window.print();
  };

  // Template switch
  const handleSelectTemplate = (id: TemplateId) => {
    setDocData((prev) => ({ ...prev, templateId: id }));
    showToast(`Đã đổi sang mẫu: ${id}`);
  };

  // Update question
  const handleSaveQuestion = (updatedQ: QuestionItem) => {
    setDocData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === updatedQ.id ? updatedQ : q)),
    }));
    showToast(`Đã lưu thay đổi Câu ${updatedQ.number}`);
  };

  const handleDeleteQuestion = (qId: string) => {
    setDocData((prev) => {
      const filtered = prev.questions.filter((q) => q.id !== qId);
      filtered.forEach((q, i) => (q.number = i + 1));
      return { ...prev, questions: filtered };
    });
    showToast('Đã xóa câu hỏi.');
  };

  const handleSaveApiKey = (key: string, model: string) => {
    setHasApiKey(!!key);
    setApiError(null);
    showToast(`Đã lưu API Key & Model (${model})!`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* App Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center font-bold text-xl text-white shadow-md font-serif">
              ∑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight font-vietnam-pro">DocuSmart Math Studio</h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                  KaTeX & LaTeX v3.6
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Chuyên Gia Tự Động Hóa Tài Liệu Toán • Hình Học 2D/3D • Xuất LaTeX, DOCX & PDF</p>
            </div>
          </div>

          {/* Quick Header Buttons with strictly compliant API Key button */}
          <div className="flex items-center gap-2">
            {/* API Key Settings Button */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                hasApiKey
                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700'
                  : 'bg-rose-900/80 hover:bg-rose-900 text-rose-200 border border-rose-600 animate-pulse'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>{hasApiKey ? 'Settings (API Key)' : 'Lấy API key để sử dụng app'}</span>
            </button>

            <button
              onClick={() => setIsHeaderFooterModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Thương hiệu Giáo viên</span>
            </button>

            <button
              onClick={handleExportLatex}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>LaTeX (.tex)</span>
            </button>

            <button
              onClick={handleExportDocx}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xuất Word (.docx)</span>
            </button>

            <button
              onClick={handlePrintPdf}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In A4 / PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* SECTION 1: RAW DOCUMENT INTAKE */}
        <DocumentInputPanel
          rawText={rawText}
          onRawTextChange={setRawText}
          onRunAiProcessing={handleRunAiProcessing}
          isLoading={isLoading}
          onSelectPreset={handleSelectPreset}
          enableAiSolve={docData.enableAiSolve}
          onToggleEnableAiSolve={(val) => setDocData((prev) => ({ ...prev, enableAiSolve: val }))}
          workingSpaceMode={docData.workingSpaceMode}
          onChangeWorkingSpaceMode={(mode) => setDocData((prev) => ({ ...prev, workingSpaceMode: mode }))}
          questionBoxStyle={docData.globalQuestionBoxStyle}
          onChangeQuestionBoxStyle={(style) => setDocData((prev) => ({ ...prev, globalQuestionBoxStyle: style }))}
        />

        {/* SECTION 2: TEMPLATE SELECTOR */}
        <TemplateSelector
          selectedTemplateId={docData.templateId}
          onSelectTemplate={handleSelectTemplate}
        />

        {/* SECTION 3: AI STATUS & OUTPUT REPORT */}
        <AiStatusOutputPanel
          docData={docData}
          apiError={apiError}
          onExportDocx={handleExportDocx}
          onExportLatex={handleExportLatex}
          onPrintPdf={handlePrintPdf}
          onOpenHeaderFooterModal={() => setIsHeaderFooterModalOpen(true)}
          onOpenExamShuffler={() => setIsShufflerModalOpen(true)}
          onOpenPresentation={() => setIsPresentationOpen(true)}
          onOpenStudentPractice={() => setIsStudentPracticeOpen(true)}
        />

        {/* SECTION 4: LIVE PRINT DOCUMENT PREVIEW */}
        <DocumentLivePreview
          docData={docData}
          onUpdateDocData={setDocData}
          onEditQuestion={(q) => setEditingQuestion(q)}
          onExportDocx={handleExportDocx}
          onExportLatex={handleExportLatex}
          onPrintPdf={handlePrintPdf}
          onOpenExamShuffler={() => setIsShufflerModalOpen(true)}
          onOpenPresentation={() => setIsPresentationOpen(true)}
          onOpenStudentPractice={() => setIsStudentPracticeOpen(true)}
        />
      </main>

      {/* FOOTER BAR */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>DocuSmart Math Studio • Giải pháp Tự động hóa Giảng dạy Toán học & Sư Phạm Hàng Đầu</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Hệ thống nhận diện thương hiệu Ths Lê Thị Hiếu • HotLine/Zalo: 0939069119
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <HeaderFooterEditor
        isOpen={isHeaderFooterModalOpen}
        onClose={() => setIsHeaderFooterModalOpen(false)}
        header={docData.header}
        footer={docData.footer}
        onUpdateHeader={(newH: HeaderConfig) => setDocData((prev) => ({ ...prev, header: newH }))}
        onUpdateFooter={(newF: FooterConfig) => setDocData((prev) => ({ ...prev, footer: newF }))}
      />

      <QuestionEditorModal
        isOpen={!!editingQuestion}
        question={editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onSave={handleSaveQuestion}
        onDelete={handleDeleteQuestion}
      />

      <LatexExportModal
        isOpen={isLatexModalOpen}
        onClose={() => setIsLatexModalOpen(false)}
        docData={docData}
      />

      <ApiKeySettingsModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaveKey={handleSaveApiKey}
      />

      <ExamShufflerModal
        isOpen={isShufflerModalOpen}
        onClose={() => setIsShufflerModalOpen(false)}
        docData={docData}
      />

      <PresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        docData={docData}
      />

      <StudentPracticeModal
        isOpen={isStudentPracticeOpen}
        onClose={() => setIsStudentPracticeOpen(false)}
        docData={docData}
      />
    </div>
  );
}
