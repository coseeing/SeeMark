import { escapeAttr, safeUrl } from '../escape';

const image = ({ alt = '', imageId = '', source = '' } = {}) => {
  return `<img src="${safeUrl(source)}" alt="${escapeAttr(alt)}" data-seemark-image-id="${escapeAttr(imageId)}">`;
};

export default image;
