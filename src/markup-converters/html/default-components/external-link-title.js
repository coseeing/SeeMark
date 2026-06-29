import { escapeHtml, escapeAttr } from '../escape';

const externalLinkTitle = ({ display = '', title = '', target = '' } = {}) => {
  return `<a href="${escapeAttr(target)}" title="${escapeAttr(title)}">${escapeHtml(display)}</a>`;
};

export default externalLinkTitle;
