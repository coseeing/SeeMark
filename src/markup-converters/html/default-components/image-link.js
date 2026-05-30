import { escapeAttr, safeUrl } from '../escape';

const imageLink = ({
  alt = '',
  imageId = '',
  source = '',
  target = '',
} = {}) => {
  return `<a href="${safeUrl(target)}"><img src="${safeUrl(source)}" alt="${escapeAttr(alt)}" data-seemark-image-id="${escapeAttr(imageId)}"></a>`;
};

export default imageLink;
