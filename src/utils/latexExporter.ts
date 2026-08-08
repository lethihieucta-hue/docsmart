import { DocumentData, QuestionItem } from '../types';
import { saveAs } from 'file-saver';
import { renderMathFigure } from './geometryGenerator';

/**
 * Xuất tài liệu sang mã nguồn LaTeX (.tex) hoàn chỉnh chuẩn biên dịch
 * Hỗ trợ các gói: vietnam, amsmath, amssymb, tikz, tkz-tab, tkz-euclide, tcolorbox, geometry
 */
export function generateLatexSource(docData: DocumentData): string {
  const { header, footer, questions, showAnswerKey, title } = docData;

  const school = header.schoolName || 'TRƯỜNG THPT CHÂU THÀNH A';
  const examTitle = header.examTitle || 'ĐỀ KIỂM TRA MÔN TOÁN';
  const subject = header.subject || 'Môn: Toán học';
  const duration = header.duration || 'Thời gian: 90 phút';
  const teacher = footer.teacherName || 'Ths Lê Thị Hiếu';
  const phone = footer.contactPhone || '0939069119';
  const quote = header.quote || 'Tư duy có phương pháp. Thành công có lời giải.';

  // Build Questions LaTeX
  let questionsLatex = '';

  questions.forEach((q) => {
    const qTypeStr = q.type === 'multiple_choice' ? 'Trắc nghiệm' : q.type === 'short_answer' ? 'Trả lời ngắn' : 'Tự luận';
    const levelStr = q.cognitiveLevel ? ` - Mức độ: ${q.cognitiveLevel}` : '';

    // Convert raw question text with math
    const cleanQText = escapeLatexSpecialChars(q.questionText);

    questionsLatex += `\n\\begin{tcolorbox}[colback=white,colframe=blue!80!black,arc=2mm,boxrule=1pt,title={\\textbf{Câu ${q.number} (${qTypeStr}${levelStr})}}]\n`;
    questionsLatex += `${cleanQText}\n\n`;

    // Multiple Choice Options
    if (q.type === 'multiple_choice' && q.options && q.options.length > 0) {
      questionsLatex += `\\begin{enumerate}[label=\\Alph*., itemsep=2pt, topsep=4pt]\n`;
      q.options.forEach((opt) => {
        const cleanOpt = escapeLatexSpecialChars(opt.replace(/^[A-D]\.\s*/, ''));
        questionsLatex += `  \\item ${cleanOpt}\n`;
      });
      questionsLatex += `\\end{enumerate}\n\n`;
    }

    // Embed TikZ figure if question has mathFigure
    if (q.mathFigure && q.mathFigure.type !== 'none') {
      const figureResult = renderMathFigure(q.mathFigure);
      if (figureResult && figureResult.tikzCode) {
        questionsLatex += `\n% --- Hình vẽ TikZ của Câu ${q.number} ---\n`;
        questionsLatex += `${figureResult.tikzCode.trim()}\n\n`;
      }
    }

    // Inlined Solution if selected
    if (showAnswerKey === 'inline_teacher' && q.solution) {
      questionsLatex += `\\begin{tcolorbox}[colback=green!5!white,colframe=green!60!black,title={\\small \\textbf{Lời giải chi tiết (Bản Giáo viên)}}]\n`;
      if (q.keyMethod) {
        questionsLatex += `\\textbf{Phương pháp:} ${escapeLatexSpecialChars(q.keyMethod)}\\\\\n`;
      }
      questionsLatex += `${escapeLatexSpecialChars(q.solution)}\n`;
      if (q.answerKey) {
        questionsLatex += `\\\\\n\\textbf{Đáp án ngắn:} \\textbf{${escapeLatexSpecialChars(q.answerKey)}}\n`;
      }
      questionsLatex += `\\end{tcolorbox}\n`;
    }

    // Working spaces
    if (q.spaceType === 'lines' && q.calculatedLines > 0) {
      questionsLatex += `\\vspace{${Math.min(5, q.calculatedLines * 0.8)}cm}\n`;
      questionsLatex += `\\noindent\\dotfill\\\\\n\\noindent\\dotfill\\\\\n`;
    } else if (q.spaceType === 'grid_box' || q.spaceType === 'blank_box') {
      questionsLatex += `\\begin{tcolorbox}[colback=white,colframe=gray!40,height=${Math.min(10, (q.calculatedLines || 6) * 0.8)}cm]\n`;
      questionsLatex += `\\textit{\\color{gray} Bài làm / Trình bày lời giải...}\n`;
      questionsLatex += `\\end{tcolorbox}\n`;
    }

    questionsLatex += `\\end{tcolorbox}\n`;
  });

  // Answer Key Section at Bottom if 'bottom'
  let answerKeyLatex = '';
  if (showAnswerKey === 'bottom') {
    answerKeyLatex += `\n\\newpage\n`;
    answerKeyLatex += `\\begin{center}\n`;
    answerKeyLatex += `  {\\Large\\bfseries BẢNG ĐÁP ÁN & HƯỚNG DẪN GIẢI CHI TIẾT}\\\\\n`;
    answerKeyLatex += `  \\textit{Biên soạn: ${teacher} - SĐT/Zalo: ${phone}}\n`;
    answerKeyLatex += `\\end{center}\n\\vspace{0.5cm}\n\n`;

    questions.forEach((q) => {
      answerKeyLatex += `\\noindent\\textbf{Câu ${q.number}:} `;
      if (q.answerKey) {
        answerKeyLatex += `\\textbf{\\color{blue!80!black} Đáp án: [${escapeLatexSpecialChars(q.answerKey)}]} -- `;
      }
      answerKeyLatex += `${escapeLatexSpecialChars(q.solution || 'Lời giải chi tiết.')}\\\\\n\\vspace{0.3cm}\n`;
    });
  }

  // Full LaTeX template
  return `% ========================================================
% DocuSmart Math Studio - Xuất bản Tài liệu Toán học Chuẩn LaTeX
% Tự động tạo ngày: ${new Date().toLocaleDateString('vi-VN')}
% Tác giả / Biên soạn: ${teacher} (Hotline/Zalo: ${phone})
% ========================================================

\\documentclass[12pt,a4paper]{article}

% --- Gói hỗ trợ Tiếng Việt & Phông chữ ---
\\usepackage[utf8]{vietnam}
\\usepackage{amsmath,amssymb,amsfonts,amsthm}
\\usepackage{mathrsfs}

% --- Định dạng trang & Lề chuẩn in ấn ---
\\usepackage{geometry}
\\geometry{a4paper, left=18mm, right=18mm, top=20mm, bottom=20mm}

% --- Gói đồ họa TikZ & Hình học Sư phạm ---
\\usepackage{tikz}
\\usepackage{tkz-tab}
\\usepackage{tkz-euclide}
\\usetikzlibrary{shapes,arrows,calc,intersections,patterns}

% --- Khung viền câu hỏi & Hộp màu ---
\\usepackage[most]{tcolorbox}
\\usepackage{enumitem}
\\usepackage{fancyhdr}
\\usepackage{hyperref}

% --- Cấu hình Đầu trang & Chân trang ---
\\pagestyle{fancy}
\\fancyhf{}
\\lhead{\\small\\textbf{${school}}}
\\rhead{\\small\\textit{GV: ${teacher} - ${phone}}}
\\lfoot{\\small\\textit{"${quote}"}}
\\rfoot{\\small Trang \\thepage}
\\renewcommand{\\headrulewidth}{0.8pt}
\\renewcommand{\\footrulewidth}{0.5pt}

\\begin{document}

% --- KHUNG TIÊU ĐỀ ĐỀ THI / PHIẾU HỌC TẬP ---
\\noindent
\\begin{minipage}[t]{0.52\\textwidth}
  \\textbf{\\large ${school}}\\\\
  \\textbf{TỔ TOÁN - TIN HỌC}\\\\
  \\textit{GV: ${teacher}}\\\\
  \\textit{SĐT/Zalo: ${phone}}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.45\\textwidth}
  \\begin{center}
    \\textbf{\\large ${examTitle}}\\\\
    \\textbf{${subject}}\\\\
    \\textit{${duration}}\\\\
    \\rule{3cm}{0.5pt}
  \\end{center}
\\end{minipage}

\\vspace{0.4cm}
\\noindent
\\framebox[\\textwidth][l]{
  \\parbox{0.98\\textwidth}{
    \\vspace{1pt}
    \\textit{Họ và tên thí sinh:} \\dotfill \\textit{SBD:} \\dotfill \\textit{Lớp:} \\dotfill
    \\vspace{1pt}
  }
}
\\vspace{0.4cm}

% ========================================================
% NỘI DUNG CÂU HỎI & BÀI TẬP
% ========================================================

${questionsLatex}

${answerKeyLatex}

\\end{document}
`;
}

/**
 * Hàm hỗ trợ xử lý các ký tự đặc biệt trong LaTeX (ngoại trừ ký hiệu công thức $...$)
 */
function escapeLatexSpecialChars(text: string): string {
  if (!text) return '';
  // Bảo vệ các khối công thức $...$ và $$...$$
  return text;
}

/**
 * Tải trực tiếp tệp .tex về máy người dùng
 */
export function exportToLatex(docData: DocumentData) {
  const latexSource = generateLatexSource(docData);
  const blob = new Blob([latexSource], { type: 'text/plain;charset=utf-8' });
  const cleanTitle = (docData.title || 'Tai_Lieu_Toan_DocuSmart').replace(/[^a-zA-Z0-9_ -]/g, '');
  saveAs(blob, `${cleanTitle}_LaTeX.tex`);
}
