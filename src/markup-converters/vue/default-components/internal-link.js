import { h } from 'vue';

const internalLink = ({ display = '', target = '' }) =>
  h(
    'a',
    { href: `#${target}`, id: `${target}-source`, class: 'underline' },
    display
  );
internalLink.inheritAttrs = false;

export default internalLink;
