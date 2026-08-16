import { DocumentData, QuestionItem } from '../types';
import { TEMPLATE_THEMES } from './templateThemes';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  Footer,
  PageNumber,
  NumberFormat,
} from 'docx';
import { saveAs } from 'file-saver';

/**
 * Utility to clean Hex color string for docx (removes # and normalizes)
 */
function cleanHex(color: string | undefined, fallback: string = '1E3A8A'): string {
  if (!color) return fallback;
  const hex = color.replace('#', '').trim();
  return hex.length === 6 || hex.length === 8 ? hex.substring(0, 6).toUpperCase() : fallback;
}

/**
 * Smart LaTeX-to-Unicode and Text cleaner for Microsoft Word
 * Transforms raw LaTeX tokens into beautiful, readable mathematical typography
 */
export function cleanMathForDocx(text: string | undefined): string {
  if (!text) return '';
  let s = text;

  // 1. Common Math Sets & Standard Symbols
  s = s.replace(/\\mathbb\{R\}|\b\\R\b/g, 'ℝ');
  s = s.replace(/\\mathbb\{N\}|\b\\N\b/g, 'ℕ');
  s = s.replace(/\\mathbb\{Z\}|\b\\Z\b/g, 'ℤ');
  s = s.replace(/\\mathbb\{Q\}|\b\\Q\b/g, 'ℚ');
  s = s.replace(/\\mathbb\{C\}|\b\\C\b/g, 'ℂ');

  // 2. Infinity and Special Values
  s = s.replace(/\\infty/g, '∞');
  s = s.replace(/\\pi\b/g, 'π');
  s = s.replace(/\\alpha\b/g, 'α');
  s = s.replace(/\\beta\b/g, 'β');
  s = s.replace(/\\gamma\b/g, 'γ');
  s = s.replace(/\\Delta\b/g, 'Δ');
  s = s.replace(/\\delta\b/g, 'δ');
  s = s.replace(/\\theta\b/g, 'θ');
  s = s.replace(/\\lambda\b/g, 'λ');
  s = s.replace(/\\mu\b/g, 'μ');
  s = s.replace(/\\sigma\b/g, 'σ');
  s = s.replace(/\\omega\b/g, 'ω');
  s = s.replace(/\\Omega\b/g, 'Ω');

  // 3. Comparison & Operators
  s = s.replace(/\\le\b|\\leq\b/g, '≤');
  s = s.replace(/\\ge\b|\\geq\b/g, '≥');
  s = s.replace(/\\ne\b|\\neq\b/g, '≠');
  s = s.replace(/\\approx\b/g, '≈');
  s = s.replace(/\\pm\b/g, '±');
  s = s.replace(/\\mp\b/g, '∓');
  s = s.replace(/\\cdot\b/g, '·');
  s = s.replace(/\\times\b/g, '×');
  s = s.replace(/\\circ\b/g, '°');

  // 4. Sets and Logic
  s = s.replace(/\\in\b/g, '∈');
  s = s.replace(/\\notin\b/g, '∉');
  s = s.replace(/\\subset\b/g, '⊂');
  s = s.replace(/\\cup\b/g, '∪');
  s = s.replace(/\\cap\b/g, '∩');
  s = s.replace(/\\emptyset\b/g, '∅');
  s = s.replace(/\\setminus\b/g, ' \\ ');
  s = s.replace(/\\forall\b/g, '∀');
  s = s.replace(/\\exists\b/g, '∃');
  s = s.replace(/\\rightarrow\b|\\to\b/g, '→');
  s = s.replace(/\\Rightarrow\b/g, '⇒');
  s = s.replace(/\\Leftrightarrow\b/g, '⇔');

  // 5. Calculus and Functions
  s = s.replace(/\\int/g, '∫');
  s = s.replace(/\\sum/g, '∑');
  s = s.replace(/\\sqrt\[(\d+)\]\{([^}]+)\}/g, '$1√($2)');
  s = s.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

  // 6. Fractions \frac{a}{b} -> (a)/(b) or a/b
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (_, num, den) => {
    const cleanNum = num.trim();
    const cleanDen = den.trim();
    if (cleanNum.length <= 3 && cleanDen.length <= 3 && !cleanNum.includes(' ') && !cleanDen.includes(' ')) {
      return `${cleanNum}/${cleanDen}`;
    }
    return `(${cleanNum})/(${cleanDen})`;
  });

  // 7. Superscripts and Subscripts
  const superMap: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
    'n': 'ⁿ', 'x': 'ˣ', 'y': 'ʸ'
  };
  const subMap: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
    'a': 'ₐ', 'e': 'ₑ', 'i': 'ᵢ', 'o': 'ₒ', 'r': 'ᵣ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
  };

  s = s.replace(/\^\{([0-9\+\-nxy]+)\}/g, (_, exp) => {
    return exp.split('').map((c: string) => superMap[c] || c).join('');
  });
  s = s.replace(/\^([0-9nxy])/g, (_, c) => superMap[c] || `^${c}`);

  s = s.replace(/_\{([0-9\+\-aeioruvx]+)\}/g, (_, sub) => {
    return sub.split('').map((c: string) => subMap[c] || c).join('');
  });
  s = s.replace(/_([0-9])/g, (_, c) => subMap[c] || `_${c}`);

  // 8. Delimiters and Enclosures
  s = s.replace(/\\left\(/g, '(').replace(/\\right\)/g, ')');
  s = s.replace(/\\left\[/g, '[').replace(/\\right\]/g, ']');
  s = s.replace(/\\left\\\{/g, '{').replace(/\\right\\\}/g, '}');
  s = s.replace(/\\\{/g, '{').replace(/\\\}/g, '}');
  s = s.replace(/\\left\|/g, '|').replace(/\\right\|/g, '|');

  // 9. LaTeX Text and Styling Commands
  s = s.replace(/\\text\{([^}]+)\}/g, '$1');
  s = s.replace(/\\mathrm\{([^}]+)\}/g, '$1');
  s = s.replace(/\\mathbf\{([^}]+)\}/g, '$1');
  s = s.replace(/\\mathit\{([^}]+)\}/g, '$1');
  s = s.replace(/\\vec\{([^}]+)\}/g, 'vec($1)');

  // 10. Clean math delimiters ($ and $$)
  s = s.replace(/\$\$/g, '');
  s = s.replace(/\$/g, '');

  // 11. Normalize spaces
  s = s.replace(/[ \t]+/g, ' ').trim();
  return s;
}

export async function exportToDocx(docData: DocumentData) {
  const { header, footer, questions, showAnswerKey, title, templateId } = docData;
  const theme = TEMPLATE_THEMES[templateId] || TEMPLATE_THEMES.thpt_national;

  const primaryColorHex = cleanHex(theme.primaryColor, '0F172A');
  const accentColorHex = cleanHex(theme.accentColor, 'D97706');
  const primaryBgHex = cleanHex(theme.primaryBg, 'FFFFFF');
  const slateDarkHex = '0F172A';
  const emeraldHex = '059669';
  const roseHex = 'DC2626';

  // =========================================================================
  // 1. SLEEK TOP BANNER BAR (Khung dải ruy-băng trên cùng tách riêng bo góc)
  // [ 🎓 CÓ HỌC MỚI THÀNH TÀI – MIỆT MÀI MỚI THÀNH GIỎI        TRƯỜNG THPT CHÂU THÀNH A ]
  // =========================================================================
  const topSloganTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: primaryColorHex },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: primaryColorHex },
      left: { style: BorderStyle.SINGLE, size: 6, color: primaryColorHex },
      right: { style: BorderStyle.SINGLE, size: 6, color: primaryColorHex },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [
      new TableRow({
        children: [
          // Left: Motto/Quote with Graduation Cap
          new TableCell({
            width: { size: 62, type: WidthType.PERCENTAGE },
            shading: { fill: primaryColorHex },
            margins: { top: 90, bottom: 90, left: 160, right: 100 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `🎓  ${(header.quote || 'CÓ HỌC MỚI THÀNH TÀI – MIỆT MÀI MỚI THÀNH GIỎI').toUpperCase()}`,
                    bold: true,
                    size: 20,
                    color: 'FFFFFF',
                  }),
                ],
              }),
            ],
          }),

          // Right: School Name
          new TableCell({
            width: { size: 38, type: WidthType.PERCENTAGE },
            shading: { fill: primaryColorHex },
            margins: { top: 90, bottom: 90, left: 100, right: 160 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: (header.schoolName || 'TRƯỜNG THPT CHÂU THÀNH A').toUpperCase(),
                    bold: true,
                    size: 20,
                    color: 'FEF08A', // Gold/Amber accent
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // =========================================================================
  // 2. MAIN WHITE CANVAS TITLE & METADATA
  // =========================================================================
  const titleParagraphs: Paragraph[] = [
    new Paragraph({
      spacing: { before: 180, after: 60 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: (header.examTitle || 'ĐỀ ÔN TẬP TOÁN THPT QUỐC GIA').toUpperCase(),
          bold: true,
          size: 32, // 16pt
          color: primaryColorHex,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 60 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: (header.subject || 'MÔN: TOÁN HỌC - KHỐI 12').toUpperCase(),
          bold: true,
          size: 23,
          color: slateDarkHex,
        }),
      ],
    }),
    // Decorative Star Separator Line
    new Paragraph({
      spacing: { after: 120 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '───────────────  ★  ───────────────',
          bold: true,
          size: 19,
          color: primaryColorHex,
        }),
      ],
    }),
  ];

  // =========================================================================
  // 3. TEACHER INFO & STUDENT INFO SUB-BAR (2 Columns with subtle dashed divider)
  // Left: Teacher Name & Duration | Right: Student Name, SBD, Class, Exam Code
  // =========================================================================
  const teacherAndStudentTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.DASHED, size: 6, color: 'CBD5E1' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [
      new TableRow({
        children: [
          // Left Cell: Teacher Name & Duration
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 60, right: 60 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `👤 Biên soạn: ${footer.teacherName || 'Ths Lê Thị Hiếu'}`,
                    bold: true,
                    size: 20,
                    color: '0F172A',
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `⏱ ${header.duration || 'Thời gian làm bài: 90 phút (Không kể thời gian phát đề)'}`,
                    italics: true,
                    size: 18,
                    color: '64748B',
                  }),
                ],
              }),
            ],
          }),

          // Right Cell: Student Info & Exam Code
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 60, right: 60 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Họ và tên thí sinh: ................................................................',
                    italics: true,
                    size: 19,
                    color: '334155',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'SBD: .................... Lớp: .........   Mã đề: ',
                    size: 19,
                    color: '334155',
                  }),
                  new TextRun({
                    text: `[${header.examCode || '101'}]`,
                    bold: true,
                    size: 20,
                    color: primaryColorHex,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // =========================================================================
  // 4. OPTICAL MARK SHEET (PHIẾU TRẢ LỜI TRẮC NGHIỆM)
  // =========================================================================
  let markSheetTable: Table | null = null;
  const mcQuestions = questions.filter((q) => q.type === 'multiple_choice');
  if (header.showOpticalMarkSheet && mcQuestions.length > 0) {
    const colCount = Math.min(10, Math.max(5, mcQuestions.length));
    const headerRowCells: TableCell[] = [
      new TableCell({
        columnSpan: colCount,
        shading: { fill: 'F1F5F9' },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `📋 PHIẾU TRẢ LỜI TRẮC NGHIỆM (TÔ ĐEN Ô TRÒN PHƯƠNG ÁN ĐÚNG) - MÃ ĐỀ: [${header.examCode || '101'}]`,
                bold: true,
                size: 18,
                color: primaryColorHex,
              }),
            ],
          }),
        ],
      }),
    ];

    // Build columns for bubbles
    const bubbleCells: TableCell[] = mcQuestions.slice(0, colCount).map((q) => {
      return new TableCell({
        shading: { fill: 'FFFFFF' },
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `Câu ${q.number}`, bold: true, size: 16, color: '1E293B' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'Ⓐ Ⓑ Ⓒ Ⓓ', size: 16, color: '64748B' }),
            ],
          }),
        ],
      });
    });

    markSheetTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
        left: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
        right: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
        insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
      },
      rows: [
        new TableRow({ children: headerRowCells }),
        new TableRow({ children: bubbleCells }),
      ],
    });
  }

  // =========================================================================
  // 5. QUESTION CARDS (ĐÓNG KHUNG MÀU TỪNG CÂU HỎI NHƯ BẢN PDF)
  // =========================================================================
  const questionElements: (Table | Paragraph)[] = [];

  questions.forEach((q) => {
    const qTypeStr =
      q.type === 'multiple_choice'
        ? 'Trắc nghiệm'
        : q.type === 'true_false_group'
        ? 'Đúng / Sai'
        : q.type === 'short_answer'
        ? 'Trả lời ngắn'
        : 'Tự luận';

    const cellContents: (Paragraph | Table)[] = [];

    // --- A. Question Header Badge & Text ---
    const headerRuns: TextRun[] = [
      new TextRun({
        text: ` CÂU ${q.number} `,
        bold: true,
        size: 21,
        color: 'FFFFFF',
        shading: { fill: primaryColorHex },
      }),
      new TextRun({ text: ' ' }),
    ];

    if (q.cognitiveLevel) {
      headerRuns.push(
        new TextRun({
          text: ` [${q.cognitiveLevel}] `,
          bold: true,
          size: 19,
          color: '1E293B',
          shading: { fill: 'E2E8F0' },
        }),
        new TextRun({ text: ' ' })
      );
    }

    headerRuns.push(
      new TextRun({
        text: `(${qTypeStr}): `,
        bold: true,
        size: 21,
        color: primaryColorHex,
      }),
      new TextRun({
        text: cleanMathForDocx(q.questionText),
        size: 21,
        color: '0F172A',
      })
    );

    cellContents.push(
      new Paragraph({
        spacing: { before: 80, after: 100 },
        children: headerRuns,
      })
    );

    // --- B. Math Figure Box (Hình học minh họa 2D/3D/Bảng biến thiên nếu có) ---
    if (q.mathFigure && q.mathFigure.type !== 'none') {
      const figureNote =
        q.mathFigure.type === 'pyramid_3d'
          ? 'Minh họa hình chóp S.ABCD trong không gian 3D - Đường cao SH ⊥ (ABCD)'
          : q.mathFigure.type === 'cube_3d'
          ? 'Minh họa hình lập phương ABCD.A\'B\'C\'D\''
          : q.mathFigure.type === 'triangle_geometry'
          ? 'Minh họa tam giác đều và đường cao tính đoạn vuông góc chung'
          : q.mathFigure.type === 'variation_table'
          ? 'Bảng biến thiên hàm số f(x)'
          : q.mathFigure.type === 'coordinate_plane'
          ? 'Đồ thị minh họa hàm số trên hệ trục Oxy'
          : 'Hình vẽ hình học minh họa';

      const figureBoxTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
          bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
          left: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
          right: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: 'F8FAFC' },
                margins: { top: 100, bottom: 100, left: 140, right: 140 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: `✨ ${q.mathFigure.caption || figureNote}`,
                        bold: true,
                        size: 20,
                        color: primaryColorHex,
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 40 },
                    children: [
                      new TextRun({
                        text: `[ Hình vẽ minh họa chuẩn KaTeX/SVG: ${figureNote} ]`,
                        italics: true,
                        size: 18,
                        color: '64748B',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      cellContents.push(
        new Paragraph({ spacing: { before: 60, after: 60 } }),
        figureBoxTable
      );
    }

    // --- C. Multiple Choice Options (Formatted Grid Table) ---
    if (q.type === 'multiple_choice' && q.options && q.options.length > 0) {
      const cleanOpts = q.options.map((opt) => cleanMathForDocx(opt.replace(/^[A-D]\.\s*/, '')));
      const optRows: TableRow[] = [];

      if (cleanOpts.length >= 4) {
        // 2x2 Grid Layout
        optRows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                shading: { fill: 'F8FAFC' },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'A. ', bold: true, size: 20, color: primaryColorHex }),
                      new TextRun({ text: cleanOpts[0], size: 20, color: '1E293B' }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                shading: { fill: 'F8FAFC' },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'B. ', bold: true, size: 20, color: primaryColorHex }),
                      new TextRun({ text: cleanOpts[1] || '', size: 20, color: '1E293B' }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                shading: { fill: 'F8FAFC' },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'C. ', bold: true, size: 20, color: primaryColorHex }),
                      new TextRun({ text: cleanOpts[2] || '', size: 20, color: '1E293B' }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                shading: { fill: 'F8FAFC' },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'D. ', bold: true, size: 20, color: primaryColorHex }),
                      new TextRun({ text: cleanOpts[3] || '', size: 20, color: '1E293B' }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      } else {
        // Linear Rows
        cleanOpts.forEach((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          optRows.push(
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  shading: { fill: 'F8FAFC' },
                  margins: { top: 60, bottom: 60, left: 120, right: 120 },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: `${letter}. `, bold: true, size: 20, color: primaryColorHex }),
                        new TextRun({ text: opt, size: 20, color: '1E293B' }),
                      ],
                    }),
                  ],
                }),
              ],
            })
          );
        });
      }

      const optionsTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          left: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          right: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
        },
        rows: optRows,
      });

      cellContents.push(optionsTable);
    }

    // --- D. True / False Group Table (Chuẩn Bộ GD&ĐT 2025: Bảng Đúng/Sai 4 ý) ---
    if (q.type === 'true_false_group' && q.tfItems && q.tfItems.length > 0) {
      const tfRows: TableRow[] = [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 72, type: WidthType.PERCENTAGE },
              shading: { fill: 'F1F5F9' },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Lệnh hỏi / Các mệnh đề khẳng định',
                      bold: true,
                      size: 20,
                      color: primaryColorHex,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 14, type: WidthType.PERCENTAGE },
              shading: { fill: 'ECFDF5' },
              margins: { top: 80, bottom: 80, left: 60, right: 60 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'Đúng', bold: true, size: 20, color: emeraldHex })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 14, type: WidthType.PERCENTAGE },
              shading: { fill: 'FEF2F2' },
              margins: { top: 80, bottom: 80, left: 60, right: 60 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'Sai', bold: true, size: 20, color: roseHex })],
                }),
              ],
            }),
          ],
        }),
      ];

      q.tfItems.forEach((item) => {
        const isTeacher = showAnswerKey === 'inline_teacher';
        const dMark = isTeacher ? (item.isCorrect ? '[ X ]' : '◯') : '◯';
        const sMark = isTeacher ? (!item.isCorrect ? '[ X ]' : '◯') : '◯';

        tfRows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: 72, type: WidthType.PERCENTAGE },
                shading: { fill: 'FFFFFF' },
                margins: { top: 70, bottom: 70, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: `${item.letter}) `, bold: true, size: 20, color: primaryColorHex }),
                      new TextRun({ text: cleanMathForDocx(item.statement), size: 20, color: '1E293B' }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 14, type: WidthType.PERCENTAGE },
                shading: { fill: 'FFFFFF' },
                margins: { top: 70, bottom: 70, left: 60, right: 60 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: dMark,
                        bold: true,
                        size: 20,
                        color: isTeacher && item.isCorrect ? emeraldHex : '94A3B8',
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 14, type: WidthType.PERCENTAGE },
                shading: { fill: 'FFFFFF' },
                margins: { top: 70, bottom: 70, left: 60, right: 60 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: sMark,
                        bold: true,
                        size: 20,
                        color: isTeacher && !item.isCorrect ? roseHex : '94A3B8',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      });

      const tfTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
          bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
          left: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
          right: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
        },
        rows: tfRows,
      });

      cellContents.push(tfTable);
    }

    // --- E. Teacher Solution Box (Emerald Styled Card) ---
    if (showAnswerKey === 'inline_teacher' && (q.solution || q.answerKey)) {
      const solutionChildren: Paragraph[] = [
        new Paragraph({
          children: [
            new TextRun({
              text: '💡 Hướng dẫn giải chi tiết (Bản dành cho Giáo viên):',
              bold: true,
              size: 20,
              color: '065F46',
            }),
          ],
        }),
      ];

      if (q.keyMethod) {
        solutionChildren.push(
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: '📌 Phương pháp: ', bold: true, size: 19, color: '047857' }),
              new TextRun({ text: cleanMathForDocx(q.keyMethod), size: 19, color: '064E3B' }),
            ],
          })
        );
      }

      if (q.solution) {
        solutionChildren.push(
          new Paragraph({
            spacing: { before: 40 },
            children: [
              new TextRun({
                text: cleanMathForDocx(q.solution),
                italics: true,
                size: 19,
                color: '064E3B',
              }),
            ],
          })
        );
      }

      const solutionTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 8, color: '059669' },
          bottom: { style: BorderStyle.SINGLE, size: 8, color: '059669' },
          left: { style: BorderStyle.SINGLE, size: 8, color: '059669' },
          right: { style: BorderStyle.SINGLE, size: 8, color: '059669' },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: 'ECFDF5' },
                margins: { top: 100, bottom: 100, left: 140, right: 140 },
                children: solutionChildren,
              }),
            ],
          }),
        ],
      });

      cellContents.push(
        new Paragraph({ spacing: { before: 100 } }),
        solutionTable
      );
    }

    // --- F. Working Lines / Student Working Area ---
    if (docData.workingSpaceMode !== 'compact_none') {
      if (q.spaceType === 'lines' || docData.workingSpaceMode === 'all_lines') {
        const lineCount = Math.max(3, q.calculatedLines || 4);
        for (let i = 0; i < lineCount; i++) {
          cellContents.push(
            new Paragraph({
              spacing: { after: 120 },
              children: [
                new TextRun({
                  text: '........................................................................................................................................................................',
                  color: '94A3B8',
                  size: 18,
                }),
              ],
            })
          );
        }
      } else if (q.spaceType === 'grid_box' || q.spaceType === 'blank_box') {
        const boxTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.DASHED, size: 6, color: 'CBD5E1' },
            bottom: { style: BorderStyle.DASHED, size: 6, color: 'CBD5E1' },
            left: { style: BorderStyle.DASHED, size: 6, color: 'CBD5E1' },
            right: { style: BorderStyle.DASHED, size: 6, color: 'CBD5E1' },
            insideHorizontal: { style: BorderStyle.DOTTED, size: 4, color: 'E2E8F0' },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { fill: 'FAFAFA' },
                  margins: { top: 160, bottom: 160, left: 140, right: 140 },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `[ Khung làm bài / Ô trình bày lời giải - ${q.calculatedLines || 6} dòng ô ly ]`,
                          italics: true,
                          size: 18,
                          color: '94A3B8',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        });

        cellContents.push(
          new Paragraph({ spacing: { before: 80 } }),
          boxTable
        );
      }
    }

    // --- G. Wrap all into Outer Card Table for this Question ---
    const questionCardTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 10, color: primaryColorHex },
        bottom: { style: BorderStyle.SINGLE, size: 10, color: primaryColorHex },
        left: { style: BorderStyle.SINGLE, size: 10, color: primaryColorHex },
        right: { style: BorderStyle.SINGLE, size: 10, color: primaryColorHex },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: primaryBgHex === 'FFFFFF' ? 'FFFFFF' : primaryBgHex },
              margins: { top: 140, bottom: 140, left: 180, right: 180 },
              children: cellContents,
            }),
          ],
        }),
      ],
    });

    questionElements.push(
      questionCardTable,
      new Paragraph({ spacing: { after: 180 } }) // Spacing between question cards
    );
  });

  // =========================================================================
  // 6. ANSWER KEY SECTION AT BOTTOM (IF SELECTED)
  // =========================================================================
  const answerKeyElements: (Paragraph | Table)[] = [];
  if (showAnswerKey === 'bottom') {
    const answerKeyHeaderTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 8, color: primaryColorHex },
        bottom: { style: BorderStyle.SINGLE, size: 8, color: primaryColorHex },
        left: { style: BorderStyle.SINGLE, size: 8, color: primaryColorHex },
        right: { style: BorderStyle.SINGLE, size: 8, color: primaryColorHex },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: primaryColorHex },
              margins: { top: 100, bottom: 100, left: 160, right: 160 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: '--- ĐÁP ÁN & HƯỚNG DẪN GIẢI CHI TIẾT (BẢN TRA CỨU) ---',
                      bold: true,
                      size: 22,
                      color: 'FFFFFF',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    answerKeyElements.push(
      new Paragraph({ spacing: { before: 300, after: 120 } }),
      answerKeyHeaderTable,
      new Paragraph({ spacing: { after: 140 } })
    );

    questions.forEach((q) => {
      const qAnsChildren: Paragraph[] = [
        new Paragraph({
          children: [
            new TextRun({ text: `Câu ${q.number}: `, bold: true, size: 20, color: primaryColorHex }),
            new TextRun({
              text: q.answerKey ? ` [Đáp án: ${q.answerKey}] ` : '',
              bold: true,
              size: 20,
              color: emeraldHex,
            }),
          ],
        }),
      ];

      if (q.keyMethod) {
        qAnsChildren.push(
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: '• Phương pháp: ', bold: true, size: 19, color: '334155' }),
              new TextRun({ text: cleanMathForDocx(q.keyMethod), size: 19, color: '475569' }),
            ],
          })
        );
      }

      if (q.solution) {
        qAnsChildren.push(
          new Paragraph({
            spacing: { before: 40 },
            children: [
              new TextRun({
                text: cleanMathForDocx(q.solution),
                italics: true,
                size: 19,
                color: '334155',
              }),
            ],
          })
        );
      }

      const answerRowTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          left: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          right: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: 'F8FAFC' },
                margins: { top: 80, bottom: 80, left: 140, right: 140 },
                children: qAnsChildren,
              }),
            ],
          }),
        ],
      });

      answerKeyElements.push(
        answerRowTable,
        new Paragraph({ spacing: { after: 100 } })
      );
    });
  }

  // =========================================================================
  // 7. BRANDED FOOTER (Chân trang Giáo viên)
  // =========================================================================
  const documentFooter = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: `Biên soạn: ${footer.teacherName} | SĐT/Zalo: ${footer.contactPhone} | "${footer.tagline}"`,
            italics: true,
            size: 18,
            color: '475569',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ text: 'Trang ', size: 17, color: '64748B' }),
          new TextRun({ children: [PageNumber.CURRENT], size: 17, bold: true, color: primaryColorHex }),
          new TextRun({ text: ' / ', size: 17, color: '64748B' }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 17, bold: true, color: primaryColorHex }),
        ],
      }),
    ],
  });

  // =========================================================================
  // 8. ASSEMBLE DOCUMENT & SAVE
  // =========================================================================
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            pageNumbers: {
              start: 1,
              formatType: NumberFormat.DECIMAL,
            },
          },
        },
        footers: {
          default: documentFooter,
        },
        children: [
          topSloganTable,
          ...titleParagraphs,
          teacherAndStudentTable,
          new Paragraph({ spacing: { after: 180 } }),
          ...(markSheetTable ? [markSheetTable, new Paragraph({ spacing: { after: 200 } })] : []),
          ...questionElements,
          ...answerKeyElements,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanTitle = (title || 'De_Thi_Toan_DocuSmart').replace(/[^a-zA-Z0-9_ -]/g, '');
  saveAs(blob, `${cleanTitle}_DocuSmart.docx`);
}
