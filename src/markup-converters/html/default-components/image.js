import { escapeAttr } from '../escape';

const image = ({ alt = '', imageId = '', source = '' } = {}) => {
  return `<img src="${escapeAttr(source)}" alt="${escapeAttr(alt)}" data-seemark-image-id="${escapeAttr(imageId)}">`;
};

export default image;
