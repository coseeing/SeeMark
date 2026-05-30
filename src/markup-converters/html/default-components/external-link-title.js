import { escapeHtml, escapeAttr, safeUrl } from '../escape';

const externalLinkTitle = ({ display = '', title = '', target = '' } = {}) => {
  return `<a href="${safeUrl(target)}" title="${escapeAttr(title)}">${escapeHtml(display)}</a>`;
};

export default externalLinkTitle;
