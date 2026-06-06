import { escapeAttr, safeUrl } from '../escape';

const iframe = ({ title = '', source = '' } = {}) => {
  return `<iframe title="${escapeAttr(title)}" src="${safeUrl(source)}"></iframe>`;
};

export default iframe;
