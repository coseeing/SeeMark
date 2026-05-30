import { escapeHtml, escapeAttr, safeUrl } from '../escape';

const imageDisplay = ({
  alt = '',
  display = '',
  imageId = '',
  source = '',
} = {}) => {
  return `<figure><img src="${safeUrl(source)}" alt="${escapeAttr(alt)}" data-seemark-image-id="${escapeAttr(imageId)}"><figcaption>${escapeHtml(display)}</figcaption></figure>`;
};

export default imageDisplay;
