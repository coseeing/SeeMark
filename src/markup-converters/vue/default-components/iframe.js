import { h } from 'vue';

const iframe = ({ title = '', source = '' }) =>
  h('iframe', { title, src: source });
iframe.inheritAttrs = false;

export default iframe;
