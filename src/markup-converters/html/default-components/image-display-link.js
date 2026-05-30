import { escapeHtml, escapeAttr, safeUrl } from '../escape';

const imageDisplayLink = ({
  alt = '',
  display = '',
  imageId = '',
  source = '',
  target = '',
} = {}) => {
  return `<a href="${safeUrl(target)}"><figure><img src="${safeUrl(source)}" alt="${escapeAttr(alt)}" data-seemark-image-id="${escapeAttr(imageId)}"><figcaption>${escapeHtml(display)}</figcaption></figure></a>`;
};

export default imageDisplayLink;
