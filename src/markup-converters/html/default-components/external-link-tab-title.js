import { escapeHtml, escapeAttr } from '../escape';

const externalLinkTabTitle = ({
  display = '',
  title = '',
  target = '',
} = {}) => {
  return `<a href="${escapeAttr(target)}" title="${escapeAttr(title)}" target="_blank" rel="noopener noreferrer">${escapeHtml(display)}</a>`;
};

export default externalLinkTabTitle;
