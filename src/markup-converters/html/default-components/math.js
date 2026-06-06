// mathMl and svg are MathJax output produced in Stage 1 — trusted markup
// (Stage 1 strips forged data-seemark-* from user raw HTML, so a math payload
// can only come from the math extension itself). Do not escape — they must
// render as live HTML.
const math = ({ mathMl = '', svg = '' } = {}) => {
  return `<span class="sr-only">${mathMl}</span><span aria-hidden="true">${svg}</span>`;
};

export default math;
