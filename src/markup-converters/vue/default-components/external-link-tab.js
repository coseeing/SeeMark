import { h } from 'vue';

const externalLinkTab = ({ display = '', target = '' }) =>
  h(
    'a',
    { href: target, target: '_blank', rel: 'noopener noreferrer' },
    display
  );
externalLinkTab.inheritAttrs = false;

export default externalLinkTab;
