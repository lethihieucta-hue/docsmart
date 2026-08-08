import { DocumentData } from '../types';
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
  HeadingLevel,
} from 'docx';
import { saveAs } from 'file-saver';

export async function exportToDocx(docData: DocumentData) {
  const { header, footer, questions, showAnswerKey, title } = docData;

  // Header Table for Exam Meta (2 columns)
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: '1E3A8A' },
      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: header.schoolName, bold: true, size: 22, color: '1E3A8A' }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: header.departmentName || 'TỔ TOÁN - TIN HỌC', bold: true, size: 20, color: '334155' }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Biên soạn: ${footer.teacherName} - SĐT/Zalo: ${footer.contactPhone}`, italics: true, size: 18, color: '475569' }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `"${header.quote}"`, italics: true, size: 16, color: '64748B' }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: header.examTitle, bold: true, size: 22, color: '0F172A' }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: header.subject, bold: true, size: 20, color: '1E3A8A' }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: header.duration, italics: true, size: 18, color: '475569' }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: `MÃ ĐỀ THI: [${header.examCode || '101'}]`, bold: true, size: 18, color: 'DC2626' }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Student Info Box
  const studentInfoParagraphs: Paragraph[] = [];
  if (header.showStudentInfoBox) {
    studentInfoParagraphs.push(
      new Paragraph({
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({ text: 'Họ và tên thí sinh: ............................................................................  SBD: ......................  Lớp: .............', size: 20, italics: true }),
        ],
      })
    );
  }

  // Build Questions Elements
  const questionParagraphs: (Paragraph | Table)[] = [];

  questions.forEach((q) => {
    const qTypeStr = q.type === 'multiple_choice' ? 'Trắc nghiệm' : q.type === 'short_answer' ? 'Trả lời ngắn' : 'Tự luận';
    const levelStr = q.cognitiveLevel ? ` [Mức độ: ${q.cognitiveLevel}]` : '';

    questionParagraphs.push(
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({ text: `Câu ${q.number} (${qTypeStr}${levelStr}): `, bold: true, color: '1E3A8A', size: 22 }),
          new TextRun({ text: q.questionText, size: 22 }),
        ],
      })
    );

    // Options for Multiple choice (2 columns or 4 lines)
    if (q.type === 'multiple_choice' && q.options && q.options.length > 0) {
      q.options.forEach((opt) => {
        questionParagraphs.push(
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 60 },
            children: [new TextRun({ text: opt, size: 20 })],
          })
        );
      });
    }

    // Inlined Solution if selected
    if (showAnswerKey === 'inline_teacher' && q.solution) {
      questionParagraphs.push(
        new Paragraph({
          indent: { left: 360 },
          spacing: { before: 80, after: 120 },
          children: [
            new TextRun({ text: '💡 Hướng dẫn giải chi tiết (Bản Giáo viên): ', bold: true, color: '059669', size: 20 }),
            new TextRun({ text: q.solution, italics: true, color: '047857', size: 20 }),
          ],
        })
      );
    }

    // Space / Lines for answers
    if (q.spaceType === 'lines' && q.calculatedLines > 0) {
      for (let i = 0; i < q.calculatedLines; i++) {
        questionParagraphs.push(
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({ text: '........................................................................................................................................................................', color: '94A3B8', size: 18 }),
            ],
          })
        );
      }
    } else if (q.spaceType === 'grid_box' || q.spaceType === 'blank_box') {
      const boxRows: TableRow[] = [];
      const rowCount = Math.max(3, q.calculatedLines || 6);
      for (let r = 0; r < rowCount; r++) {
        boxRows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: 100, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: r === 0 ? ' Bài làm / Trình bày lời giải chi tiết:' : '', color: '94A3B8', italics: true, size: 18 })],
                  }),
                ],
              }),
            ],
          })
        );
      }

      const spaceBoxTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
          left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
          right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
          insideHorizontal: { style: BorderStyle.DOTTED, size: 4, color: 'E2E8F0' },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        },
        rows: boxRows,
      });

      questionParagraphs.push(spaceBoxTable);
    }
  });

  // Answer Key Section if 'bottom'
  const answerKeyElements: (Paragraph | Table)[] = [];
  if (showAnswerKey === 'bottom') {
    answerKeyElements.push(
      new Paragraph({
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({ text: '------------------------------------------------------------------------------------------------------------------------', color: 'CBD5E1' }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 200 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: 'ĐÁP ÁN & HƯỚNG DẪN GIẢI CHI TIẾT (BẢN TRA CỨU)', bold: true, size: 24, color: '1E3A8A' }),
        ],
      })
    );

    questions.forEach((q) => {
      answerKeyElements.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({ text: `Câu ${q.number}: `, bold: true, color: '1E3A8A', size: 20 }),
            new TextRun({ text: q.answerKey ? `Đáp án: [${q.answerKey}] - ` : '', bold: true, color: '059669', size: 20 }),
            new TextRun({ text: q.solution || 'Chưa có lời giải.', size: 20 }),
          ],
        })
      );
    });
  }

  // Document Footer
  const documentFooter = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: `${footer.teacherName} | ${footer.tagline} | Hotline/Zalo: ${footer.contactPhone}`, italics: true, size: 18, color: '475569' }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ children: [PageNumber.CURRENT], size: 16 }),
          new TextRun({ text: ' / ', size: 16 }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16 }),
        ],
      }),
    ],
  });

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
          headerTable,
          ...studentInfoParagraphs,
          ...questionParagraphs,
          ...answerKeyElements,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanTitle = (title || 'Tai_Lieu_Toan_DocuSmart').replace(/[^a-zA-Z0-9_ -]/g, '');
  saveAs(blob, `${cleanTitle}_DocuSmart.docx`);
}
