import { h } from 'vue';

// mathMl and svg are MathJax output produced in Stage 1 — trusted markup
// (Stage 1 strips forged data-seemark-* from user raw HTML, so a math payload
// can only come from the math extension itself). They must render as live
// HTML, hence innerHTML.
const math = ({ mathMl = '', svg = '' }) => [
  h('span', { class: 'sr-only', innerHTML: mathMl }),
  h('span', { 'aria-hidden': 'true', innerHTML: svg }),
];
math.inheritAttrs = false;

export default math;
