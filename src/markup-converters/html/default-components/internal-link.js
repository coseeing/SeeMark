import { escapeHtml, escapeAttr } from '../escape';

const internalLink = ({ display = '', target = '' } = {}) => {
  const safeTarget = escapeAttr(target);
  return `<a href="#${safeTarget}" id="${safeTarget}-source" class="underline">${escapeHtml(display)}</a>`;
};

export default internalLink;
