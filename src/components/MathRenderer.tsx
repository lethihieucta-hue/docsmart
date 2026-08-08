import React, { useEffect, useRef } from 'react';

interface Props {
  content: string;
  className?: string;
  displayMode?: boolean;
}

declare global {
  interface Window {
    katex?: {
      renderToString: (tex: string, options?: any) => string;
      render: (tex: string, element: HTMLElement, options?: any) => void;
    };
  }
}

/**
 * Component chuyên kết xuất công thức Toán KaTeX
 * Tự động phân tách nội dung văn bản và các biểu thức toán học $...$, $$...$$, \(...\), \[...\]
 */
export const MathRenderer: React.FC<Props> = ({ content, className = '', displayMode = false }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!content) {
      containerRef.current.innerHTML = '';
      return;
    }

    try {
      if (typeof window !== 'undefined' && window.katex) {
        // Tách chuỗi văn bản theo công thức $...$, $$...$$, \[...\], \(...\)
        const html = renderMathInText(content, window.katex);
        containerRef.current.innerHTML = html;
      } else {
        // Fallback nhẹ nếu CDN đang tải hoặc offline
        containerRef.current.innerHTML = renderSimpleMathFallback(content);
      }
    } catch (err) {
      console.warn('KaTeX render error:', err);
      containerRef.current.innerText = content;
    }
  }, [content]);

  return <span ref={containerRef} className={`math-rendered-text ${className}`} />;
};

/**
 * Hàm phân tích và thay thế công thức $...$ thành HTML do KaTeX kết xuất
 */
function renderMathInText(text: string, katex: any): string {
  if (!text) return '';

  // 1. Xử lý Block Display Math $$...$$ hoặc \[...\]
  let processed = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return `<div class="my-2 py-1 text-center overflow-x-auto">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch (e) {
      return `$$${math}$$`;
    }
  });

  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    try {
      return `<div class="my-2 py-1 text-center overflow-x-auto">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch (e) {
      return `\\[${math}\\]`;
    }
  });

  // 2. Xử lý Inline Math $...$ hoặc \(...\)
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return `$${math}$`;
    }
  });

  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return `\\(${math}\\)`;
    }
  });

  // 3. Tự động chuyển đổi các ký hiệu toán quen thuộc nếu người dùng không gõ dấu $
  // Ví dụ: x^2, \sqrt{x}, \vec{a}, \Delta
  return processed;
}

/**
 * Fallback đơn giản hiển thị ký hiệu đẹp mắt khi chưa tải xong KaTeX
 */
function renderSimpleMathFallback(text: string): string {
  return text
    .replace(/\$([^\$]+)\$/g, '<span class="font-stix-math italic text-blue-900 font-semibold px-0.5">$1</span>')
    .replace(/\n/g, '<br/>');
}
