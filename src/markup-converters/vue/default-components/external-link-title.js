import { h } from 'vue';

const externalLinkTitle = ({ display = '', title = '', target = '' }) =>
  h('a', { href: target, title }, display);
externalLinkTitle.inheritAttrs = false;

export default externalLinkTitle;
