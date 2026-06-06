import { escapeAttr, safeUrl } from '../escape';

// Attributes adapted from CodePen's official embed snippet.
const codepen = ({ title = '', source = '' } = {}) => {
  return `<iframe height="300" style="width: 100%;" scrolling="no" title="${escapeAttr(title)}" src="${safeUrl(source)}" frameborder="no" loading="lazy" allowtransparency="true"></iframe>`;
};

export default codepen;
