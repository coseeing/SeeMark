import { escapeHtml, escapeAttr } from '../escape';

const internalLinkTitle = ({ display = '', title = '', target = '' } = {}) => {
  const safeTarget = escapeAttr(target);
  return `<a href="#${safeTarget}" id="${safeTarget}-source" title="${escapeAttr(title)}" class="underline">${escapeHtml(display)}</a>`;
};

export default internalLinkTitle;
