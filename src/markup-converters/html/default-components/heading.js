import { escapeAttr } from '../escape';

const VALID_LEVELS = new Set([1, 2, 3, 4, 5, 6]);

const heading = ({ id = null, level = 1 } = {}, childrenHtml = '') => {
  const lvl = VALID_LEVELS.has(level) ? level : 1;
  const idAttr = id ? ` id="${escapeAttr(id)}"` : '';
  return `<h${lvl}${idAttr}>${childrenHtml}</h${lvl}>`;
};

export default heading;
