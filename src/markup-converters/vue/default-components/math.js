import { h } from 'vue';

// mathMl/svg are trusted MathJax output from Stage 1, so they render as live
// HTML via innerHTML.
const math = ({ mathMl = '', svg = '' }) => [
  h('span', { class: 'sr-only', innerHTML: mathMl }),
  h('span', { 'aria-hidden': 'true', innerHTML: svg }),
];
math.inheritAttrs = false;

export default math;
