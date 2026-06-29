import { escapeAttr } from '../escape';

// Attributes adapted from YouTube's official embed snippet.
const youtube = ({ title = '', source = '' } = {}) => {
  return `<iframe width="560" height="315" src="${escapeAttr(source)}" title="${escapeAttr(title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
};

export default youtube;
