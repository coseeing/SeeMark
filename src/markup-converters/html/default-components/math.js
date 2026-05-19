// mathMl and svg are produced by MathJax from the math expression in Stage 1.
// They are trusted markup (matches the React adapter behavior for math).
// Do not escape — they must render as live HTML.
const math = ({ mathMl = '', svg = '' } = {}) => {
  return `<span class="sr-only">${mathMl}</span><span aria-hidden="true">${svg}</span>`;
};

export default math;
