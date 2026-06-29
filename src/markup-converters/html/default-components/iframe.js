import { escapeAttr } from '../escape';

const iframe = ({ title = '', source = '' } = {}) => {
  return `<iframe title="${escapeAttr(title)}" src="${escapeAttr(source)}"></iframe>`;
};

export default iframe;
