import { escapeHtml, escapeAttr } from '../escape';

const externalLinkTab = ({ display = '', target = '' } = {}) => {
  return `<a href="${escapeAttr(target)}" target="_blank" rel="noopener noreferrer">${escapeHtml(display)}</a>`;
};

export default externalLinkTab;
