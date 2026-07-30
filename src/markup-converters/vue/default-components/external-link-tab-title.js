import { h } from 'vue';

const externalLinkTabTitle = ({ display = '', title = '', target = '' }) =>
  h(
    'a',
    { href: target, title, target: '_blank', rel: 'noopener noreferrer' },
    display
  );
externalLinkTabTitle.inheritAttrs = false;

export default externalLinkTabTitle;
