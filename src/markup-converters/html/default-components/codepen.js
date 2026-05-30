import { escapeAttr, safeUrl } from '../escape';

// Mirrors the React CodePen default (official embed attributes).
const codepen = ({ title = '', source = '' } = {}) => {
  return `<iframe height="300" style="width: 100%;" scrolling="no" title="${escapeAttr(title)}" src="${safeUrl(source)}" frameborder="no" loading="lazy" allowtransparency="true"></iframe>`;
};

export default codepen;
