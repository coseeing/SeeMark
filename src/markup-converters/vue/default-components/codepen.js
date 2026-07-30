import { h } from 'vue';

// Attributes adapted from CodePen's official embed snippet.
const codepen = ({ title = '', source = '' }) =>
  h('iframe', {
    height: '300',
    style: 'width: 100%;',
    scrolling: 'no',
    title,
    src: source,
    frameborder: 'no',
    loading: 'lazy',
    allowtransparency: 'true',
  });
codepen.inheritAttrs = false;

export default codepen;
