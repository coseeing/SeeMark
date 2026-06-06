import { escapeHtml, safeUrl } from '../escape';

const externalLinkTab = ({ display = '', target = '' } = {}) => {
  return `<a href="${safeUrl(target)}" target="_blank" rel="noopener noreferrer">${escapeHtml(display)}</a>`;
};

export default externalLinkTab;
