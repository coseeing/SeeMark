import { escapeHtml, escapeAttr, safeUrl } from '../escape';

const externalLinkTabTitle = ({
  display = '',
  title = '',
  target = '',
} = {}) => {
  return `<a href="${safeUrl(target)}" title="${escapeAttr(title)}" target="_blank" rel="noopener noreferrer">${escapeHtml(display)}</a>`;
};

export default externalLinkTabTitle;
