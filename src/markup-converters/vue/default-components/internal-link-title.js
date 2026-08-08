import { h } from 'vue';

const internalLinkTitle = ({ display = '', title = '', target = '' }) =>
  h(
    'a',
    {
      href: `#${target}`,
      id: `${target}-source`,
      title,
      class: 'underline',
    },
    display
  );
internalLinkTitle.inheritAttrs = false;

export default internalLinkTitle;
