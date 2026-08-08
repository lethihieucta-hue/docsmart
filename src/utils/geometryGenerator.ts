import { MathFigureData, MathFigureType } from '../types';

/**
 * Trình sinh hình học Toán học 2D, 3D và Bảng biến thiên
 * Sinh đồng thời:
 * 1. Mã SVG để hiển thị trên Live Preview & Bản in
 * 2. Mã TikZ để nhúng vào tệp xuất bản LaTeX (.tex)
 */

export interface GeometryResult {
  svgMarkup: string;
  tikzCode: string;
  caption: string;
}

/**
 * Sinh Đồ thị Hệ trục tọa độ Oxy (Parabol / Bậc ba / Phân thức / Lượng giác)
 */
export function generateCoordinatePlane(figureData?: MathFigureData): GeometryResult {
  const formula = figureData?.funcFormula || 'y = x^2 - 4x + 3';
  const caption = figureData?.caption || `Đồ thị hàm số ${formula}`;

  // Tọa độ tính toán mẫu cho Parabol y = x^2 - 4x + 3 -> Đỉnh I(2; -1)
  const isParabola = formula.includes('x^2') || formula.includes('x²');
  const isFraction = formula.includes('/');

  let pathData = 'M 40 30 Q 140 230 240 30'; // Parabol cong mẫu
  if (isFraction) {
    pathData = 'M 30 110 Q 110 120 120 20 M 160 260 Q 170 160 250 170';
  }

  const svgMarkup = `
    <svg viewBox="0 0 280 240" class="w-full max-w-[280px] h-auto mx-auto my-2 text-slate-800" xmlns="http://www.w3.org/2000/svg">
      <!-- Lưới trục tọa độ mờ -->
      <defs>
        <pattern id="gridOxy" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="1"/>
        </pattern>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
        </marker>
      </defs>
      <rect width="100%" height="100%" fill="url(#gridOxy)" />
      
      <!-- Trục hoành Ox -->
      <line x1="20" y1="140" x2="260" y2="140" stroke="#334155" stroke-width="1.5" marker-end="url(#arrow)" />
      <text x="262" y="144" font-size="11" font-style="italic" font-weight="bold" fill="#0f172a">x</text>

      <!-- Trục tung Oy -->
      <line x1="140" y1="220" x2="140" y2="20" stroke="#334155" stroke-width="1.5" marker-end="url(#arrow)" />
      <text x="144" y="16" font-size="11" font-style="italic" font-weight="bold" fill="#0f172a">y</text>
      
      <!-- Gốc tọa độ O -->
      <text x="126" y="154" font-size="11" font-style="italic" font-weight="bold" fill="#334155">O</text>

      <!-- Đường cong đồ thị hàm số -->
      <path d="${pathData}" fill="none" stroke="#1d4ed8" stroke-width="2.5" stroke-linecap="round" />

      <!-- Đỉnh Parabol I(2; -1) và các đường dóng nét đứt -->
      <line x1="180" y1="140" x2="180" y2="170" stroke="#94a3b8" stroke-dasharray="3,3" stroke-width="1.2" />
      <line x1="140" y1="170" x2="180" y2="170" stroke="#94a3b8" stroke-dasharray="3,3" stroke-width="1.2" />
      <circle cx="180" cy="170" r="3.5" fill="#dc2626" />
      <text x="186" y="180" font-size="10" font-weight="bold" fill="#b91c1c">I(2; -1)</text>

      <!-- Các điểm giao trục Ox (x=1, x=3) -->
      <circle cx="160" cy="140" r="2.5" fill="#1e293b" />
      <text x="156" y="132" font-size="9" fill="#334155">1</text>
      <circle cx="200" cy="140" r="2.5" fill="#1e293b" />
      <text x="198" y="132" font-size="9" fill="#334155">3</text>
    </svg>
  `;

  const tikzCode = `
\\begin{center}
\\begin{tikzpicture}[scale=0.8, >=stealth]
  \\draw[->, thick] (-1,0) -- (5,0) node[right] {$x$};
  \\draw[->, thick] (0,-2) -- (0,4) node[above] {$y$};
  \\node[below left] at (0,0) {$O$};
  \\draw[dashed] (2,0) -- (2,-1) -- (0,-1);
  \\fill[red] (2,-1) circle (2pt) node[below right] {$I(2;-1)$};
  \\draw[blue, thick, domain=0.2:3.8, samples=100] plot (\\x, {(\\x)^2 - 4*\\x + 3});
  \\node[above] at (2, -3) {\\small \\textbf{${caption}}};
\\end{tikzpicture}
\\end{center}
  `;

  return { svgMarkup, tikzCode, caption };
}

/**
 * Sinh Hình Chóp S.ABCD (Đáy hình bình hành / chữ nhật với quy chuẩn nét đứt nét liền Việt Nam)
 */
export function generatePyramid3D(figureData?: MathFigureData): GeometryResult {
  const caption = figureData?.caption || 'Khối chóp S.ABCD với đáy ABCD và đường cao SH ⊥ (ABCD)';

  const svgMarkup = `
    <svg viewBox="0 0 280 230" class="w-full max-w-[280px] h-auto mx-auto my-2 text-slate-800" xmlns="http://www.w3.org/2000/svg">
      <!-- Đỉnh S -->
      <circle cx="110" cy="30" r="3.5" fill="#1e3a8a" />
      <text x="105" y="20" font-size="12" font-weight="bold" fill="#1e3a8a">S</text>

      <!-- Điểm A (Khuất góc trong) -->
      <circle cx="60" cy="130" r="3" fill="#334155" />
      <text x="44" y="132" font-size="11" font-weight="bold" fill="#334155">A</text>

      <!-- Điểm B (Góc trái dưới) -->
      <circle cx="30" cy="190" r="3" fill="#334155" />
      <text x="14" y="196" font-size="11" font-weight="bold" fill="#334155">B</text>

      <!-- Điểm C (Góc phải dưới) -->
      <circle cx="180" cy="190" r="3" fill="#334155" />
      <text x="186" y="196" font-size="11" font-weight="bold" fill="#334155">C</text>

      <!-- Điểm D (Góc phải trên) -->
      <circle cx="210" cy="130" r="3" fill="#334155" />
      <text x="216" y="132" font-size="11" font-weight="bold" fill="#334155">D</text>

      <!-- Chân đường cao H thuộc đáy -->
      <circle cx="110" cy="150" r="3" fill="#dc2626" />
      <text x="104" y="166" font-size="11" font-weight="bold" fill="#b91c1c">H</text>

      <!-- NÉT ĐỨT (Cạnh khuất không nhìn thấy) -->
      <line x1="60" y1="130" x2="210" y2="130" stroke="#475569" stroke-width="1.8" stroke-dasharray="4,4" /> <!-- AD -->
      <line x1="60" y1="130" x2="30" y2="190" stroke="#475569" stroke-width="1.8" stroke-dasharray="4,4" /> <!-- AB -->
      <line x1="110" y1="30" x2="60" y2="130" stroke="#475569" stroke-width="1.8" stroke-dasharray="4,4" /> <!-- SA -->
      <line x1="110" y1="30" x2="110" y2="150" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="4,4" /> <!-- SH -->

      <!-- Ký hiệu góc vuông tại H (SH ⊥ đáy) -->
      <path d="M 110 142 L 118 142 L 118 150" fill="none" stroke="#dc2626" stroke-width="1.2" />

      <!-- NÉT LIỀN (Cạnh nhìn thấy) -->
      <line x1="30" y1="190" x2="180" y2="190" stroke="#0f172a" stroke-width="2" /> <!-- BC -->
      <line x1="180" y1="190" x2="210" y2="130" stroke="#0f172a" stroke-width="2" /> <!-- CD -->
      <line x1="110" y1="30" x2="30" y2="190" stroke="#0f172a" stroke-width="2" /> <!-- SB -->
      <line x1="110" y1="30" x2="180" y2="190" stroke="#0f172a" stroke-width="2" /> <!-- SC -->
      <line x1="110" y1="30" x2="210" y2="130" stroke="#0f172a" stroke-width="2" /> <!-- SD -->
    </svg>
  `;

  const tikzCode = `
\\begin{center}
\\begin{tikzpicture}[scale=0.85, line join=round, line cap=round]
  \\coordinate (A) at (0,0);
  \\coordinate (B) at (-1.5,-2);
  \\coordinate (C) at (3.5,-2);
  \\coordinate (D) at (5,0);
  \\coordinate (H) at (1.5,-0.8);
  \\coordinate (S) at (1.5,4);

  \\draw[dashed, thick] (A)--(D) (A)--(B) (S)--(A) (S)--(H);
  \\draw[thick] (B)--(C)--(D) (S)--(B) (S)--(C) (S)--(D);
  
  \\foreach \\p/\\pos in {S/above, A/left, B/below left, C/below right, D/right, H/below}
    \\fill (\\p) circle (1.5pt) node[\\pos] {$\\p$};
  \\node[above] at (1.75, -2.8) {\\small \\textbf{${caption}}};
\\end{tikzpicture}
\\end{center}
  `;

  return { svgMarkup, tikzCode, caption };
}

/**
 * Sinh Hình Lập Phương ABCD.A'B'C'D' (Chuẩn nét đứt & góc phối cảnh 3D)
 */
export function generateCube3D(figureData?: MathFigureData): GeometryResult {
  const caption = figureData?.caption || 'Hình lập phương ABCD.A\'B\'C\'D\'';

  const svgMarkup = `
    <svg viewBox="0 0 280 230" class="w-full max-w-[280px] h-auto mx-auto my-2 text-slate-800" xmlns="http://www.w3.org/2000/svg">
      <!-- Mặt trước: B-C-C'-B' -->
      <!-- Đáy dưới: A-B-C-D -->
      <!-- Nét đứt: A-B, A-D, A-A' -->
      <line x1="50" y1="90" x2="170" y2="90" stroke="#475569" stroke-width="1.8" stroke-dasharray="4,4" /> <!-- AD -->
      <line x1="50" y1="90" x2="20" y2="160" stroke="#475569" stroke-width="1.8" stroke-dasharray="4,4" /> <!-- AB -->
      <line x1="50" y1="90" x2="50" y2="30" stroke="#475569" stroke-width="1.8" stroke-dasharray="4,4" /> <!-- AA' -->

      <!-- Nét liền -->
      <line x1="20" y1="160" x2="140" y2="160" stroke="#0f172a" stroke-width="2" /> <!-- BC -->
      <line x1="140" y1="160" x2="170" y2="90" stroke="#0f172a" stroke-width="2" /> <!-- CD -->
      
      <!-- Cạnh đứng -->
      <line x1="20" y1="160" x2="20" y2="100" stroke="#0f172a" stroke-width="2" /> <!-- BB' -->
      <line x1="140" y1="160" x2="140" y2="100" stroke="#0f172a" stroke-width="2" /> <!-- CC' -->
      <line x1="170" y1="90" x2="170" y2="30" stroke="#0f172a" stroke-width="2" /> <!-- DD' -->

      <!-- Đáy trên: A'B'C'D' -->
      <line x1="50" y1="30" x2="170" y2="30" stroke="#0f172a" stroke-width="2" /> <!-- A'D' -->
      <line x1="50" y1="30" x2="20" y2="100" stroke="#0f172a" stroke-width="2" /> <!-- A'B' -->
      <line x1="20" y1="100" x2="140" y2="100" stroke="#0f172a" stroke-width="2" /> <!-- B'C' -->
      <line x1="140" y1="100" x2="170" y2="30" stroke="#0f172a" stroke-width="2" /> <!-- C'D' -->

      <!-- Nhãn các đỉnh -->
      <text x="36" y="92" font-size="11" font-weight="bold">A</text>
      <text x="8" y="174" font-size="11" font-weight="bold">B</text>
      <text x="144" y="174" font-size="11" font-weight="bold">C</text>
      <text x="176" y="94" font-size="11" font-weight="bold">D</text>

      <text x="44" y="24" font-size="11" font-weight="bold" fill="#1e3a8a">A'</text>
      <text x="8" y="98" font-size="11" font-weight="bold" fill="#1e3a8a">B'</text>
      <text x="146" y="104" font-size="11" font-weight="bold" fill="#1e3a8a">C'</text>
      <text x="176" y="28" font-size="11" font-weight="bold" fill="#1e3a8a">D'</text>
    </svg>
  `;

  const tikzCode = `
\\begin{center}
\\begin{tikzpicture}[scale=0.85, line join=round, line cap=round]
  \\coordinate (A) at (0,0);
  \\coordinate (B) at (-1,-1.5);
  \\coordinate (C) at (3,-1.5);
  \\coordinate (D) at (4,0);
  \\coordinate (AA) at (0,3.5);
  \\coordinate (BB) at (-1,2);
  \\coordinate (CC) at (3,2);
  \\coordinate (DD) at (4,3.5);

  \\draw[dashed, thick] (A)--(D) (A)--(B) (A)--(AA);
  \\draw[thick] (B)--(C)--(D) (B)--(BB) (C)--(CC) (D)--(DD) (AA)--(BB)--(CC)--(DD)--cycle;

  \\foreach \\p/\\pos in {A/left, B/below left, C/below right, D/right, AA/above left, BB/left, CC/right, DD/above right}
    \\fill (\\p) circle (1.5pt) node[\\pos] {$\\p$};
\\end{tikzpicture}
\\end{center}
  `;

  return { svgMarkup, tikzCode, caption };
}

/**
 * Sinh Hình học phẳng 2D: Tam giác ABC với đường tròn nội/ngoại tiếp & đường cao
 */
export function generateTriangleGeometry(figureData?: MathFigureData): GeometryResult {
  const caption = figureData?.caption || 'Tam giác ABC có đường cao AH và đường tròn nội tiếp (I; r)';

  const svgMarkup = `
    <svg viewBox="0 0 280 220" class="w-full max-w-[280px] h-auto mx-auto my-2 text-slate-800" xmlns="http://www.w3.org/2000/svg">
      <!-- Tam giác ABC -->
      <polygon points="120,30 30,180 230,180" fill="#f8fafc" stroke="#0f172a" stroke-width="2.2" />

      <!-- Đường cao AH -->
      <line x1="120" y1="30" x2="120" y2="180" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="3,3" />
      <path d="M 120 170 L 128 170 L 128 180" fill="none" stroke="#dc2626" stroke-width="1.2" />

      <!-- Đường tròn nội tiếp tâm I(122, 130) bán kính r=48 -->
      <circle cx="122" cy="130" r="48" fill="none" stroke="#2563eb" stroke-width="1.8" stroke-dasharray="4,2" />
      <circle cx="122" cy="130" r="3" fill="#2563eb" />
      <text x="126" y="128" font-size="11" font-weight="bold" fill="#1d4ed8">I</text>

      <!-- Nhãn các đỉnh -->
      <text x="115" y="20" font-size="12" font-weight="bold" fill="#0f172a">A</text>
      <text x="14" y="192" font-size="12" font-weight="bold" fill="#0f172a">B</text>
      <text x="236" y="192" font-size="12" font-weight="bold" fill="#0f172a">C</text>
      <text x="114" y="196" font-size="11" font-weight="bold" fill="#b91c1c">H</text>
    </svg>
  `;

  const tikzCode = `
\\begin{center}
\\begin{tikzpicture}[scale=0.85]
  \\coordinate (A) at (2,3.5);
  \\coordinate (B) at (-1,0);
  \\coordinate (C) at (4.5,0);
  \\coordinate (H) at (2,0);
  
  \\draw[thick] (A)--(B)--(C)--cycle;
  \\draw[dashed, red, thick] (A)--(H);
  \\draw (2, 0.3) -- (2.3, 0.3) -- (2.3, 0);
  
  \\node[above] at (A) {$A$};
  \\node[below left] at (B) {$B$};
  \\node[below right] at (C) {$C$};
  \\node[below] at (H) {$H$};
\\end{tikzpicture}
\\end{center}
  `;

  return { svgMarkup, tikzCode, caption };
}

/**
 * Sinh Bảng Biến Thiên / Bảng Xét Dấu Đạo Hàm (SGK Toán Việt Nam)
 */
export function generateVariationTable(figureData?: MathFigureData): GeometryResult {
  const caption = figureData?.caption || 'Bảng biến thiên khảo sát hàm số y = f(x)';

  const svgMarkup = `
    <div class="w-full max-w-[420px] mx-auto my-2 overflow-x-auto border border-slate-300 rounded-xl bg-white shadow-xs p-2 text-xs font-serif">
      <table class="w-full border-collapse text-center">
        <!-- Hàng x -->
        <tr class="border-b border-slate-300 font-bold bg-slate-50">
          <td class="w-14 py-2 border-r border-slate-300 italic">x</td>
          <td class="py-2">-∞</td>
          <td class="py-2"></td>
          <td class="py-2 font-mono text-blue-900">1</td>
          <td class="py-2"></td>
          <td class="py-2 font-mono text-blue-900">3</td>
          <td class="py-2"></td>
          <td class="py-2">+∞</td>
        </tr>
        <!-- Hàng y' -->
        <tr class="border-b border-slate-300 font-bold">
          <td class="py-2 border-r border-slate-300 italic">y'</td>
          <td></td>
          <td class="text-emerald-600 text-sm font-black">+</td>
          <td class="font-bold text-slate-700">0</td>
          <td class="text-rose-600 text-sm font-black">-</td>
          <td class="font-bold text-slate-700">0</td>
          <td class="text-emerald-600 text-sm font-black">+</td>
          <td></td>
        </tr>
        <!-- Hàng y (Mũi tên biến thiên) -->
        <tr class="h-16">
          <td class="border-r border-slate-300 italic font-bold">y</td>
          <td class="align-bottom pb-1 text-slate-500">-∞</td>
          <td class="text-emerald-700 font-extrabold text-lg">↗</td>
          <td class="align-top pt-1 font-bold text-blue-900">4 (CĐ)</td>
          <td class="text-rose-700 font-extrabold text-lg">↘</td>
          <td class="align-bottom pb-1 font-bold text-blue-900">0 (CT)</td>
          <td class="text-emerald-700 font-extrabold text-lg">↗</td>
          <td class="align-top pt-1 text-slate-500">+∞</td>
        </tr>
      </table>
    </div>
  `;

  const tikzCode = `
\\begin{center}
\\begin{tikzpicture}
\\tkzTabInit[lgt=1.2,espcl=2]{$x$/1, $y'$/1, $y$/2}{$-\\infty$, $1$, $3$, $+\\infty$}
\\tkzTabLine{ ,+,0,-,0,+, }
\\tkzTabVar{-/ $-\\infty$, +/ $4$, -/ $0$, +/ $+\\infty$}
\\end{tikzpicture}
\\end{center}
  `;

  return { svgMarkup, tikzCode, caption };
}

/**
 * Dispatcher chung chuyển đổi MathFigureData sang SVG & TikZ
 */
export function renderMathFigure(figure?: MathFigureData): GeometryResult | null {
  if (!figure || figure.type === 'none') return null;

  switch (figure.type) {
    case 'coordinate_plane':
      return generateCoordinatePlane(figure);
    case 'pyramid_3d':
      return generatePyramid3D(figure);
    case 'cube_3d':
      return generateCube3D(figure);
    case 'triangle_geometry':
      return generateTriangleGeometry(figure);
    case 'variation_table':
      return generateVariationTable(figure);
    default:
      return generateCoordinatePlane(figure);
  }
}
