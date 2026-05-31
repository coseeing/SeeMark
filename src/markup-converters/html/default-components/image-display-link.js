import { escapeHtml, safeUrl } from '../escape';

import image from './image';

const imageDisplayLink = ({ display = '', ...props } = {}) =>
  `<a href="${safeUrl(props.target)}"><figure>${image(props)}<figcaption>${escapeHtml(display)}</figcaption></figure></a>`;

export default imageDisplayLink;
