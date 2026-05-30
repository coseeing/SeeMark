import { escapeAttr, safeUrl } from '../escape';

// Mirrors the React YouTube default (official embed attributes).
const youtube = ({ title = '', source = '' } = {}) => {
  return `<iframe width="560" height="315" src="${safeUrl(source)}" title="${escapeAttr(title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
};

export default youtube;
