// js/katex-render.js
// KaTeX rendering helpers. Loaded on pages that display math (quiz, results).

const KATEX_OPTIONS = {
  delimiters: [
    { left: '$$', right: '$$', display: true  },
    { left: '$',  right: '$',  display: false },
  ],
  throwOnError: false,   // Shows red error text instead of crashing
  errorColor: '#cc0000',
};

/**
 * Run KaTeX auto-render on an element after setting its innerHTML.
 * Safe to call even if KaTeX hasn't loaded (no-op).
 * @param {HTMLElement} element
 */
export function renderMath(element) {
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(element, KATEX_OPTIONS);
  }
}

/**
 * Create a DOM element for a content object.
 * Supports types: "text", "latex", "image".
 *
 * @param {{ type: string, content: string, alt?: string, caption?: string }} contentObj
 * @returns {HTMLElement}
 */
export function renderContent(contentObj) {
  const { type, content = '', alt = '', caption = '' } = contentObj || {};

  if (type === 'text') {
    const p = document.createElement('p');
    p.textContent = content;
    return p;
  }

  if (type === 'latex') {
    // innerHTML is safe here: content is authored JSON, not user input.
    // KaTeX escapes its own output.
    const p = document.createElement('p');
    p.innerHTML = content;
    renderMath(p);
    return p;
  }

  if (type === 'image') {
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = content;
    img.alt = alt;
    img.className = 'question-image';
    img.loading = 'lazy';
    figure.appendChild(img);
    if (caption) {
      const cap = document.createElement('figcaption');
      cap.textContent = caption;
      figure.appendChild(cap);
    }
    return figure;
  }

  // Fallback
  const p = document.createElement('p');
  p.textContent = content;
  return p;
}
