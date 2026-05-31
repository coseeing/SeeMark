import { escapeHtml } from '../escape';

import image from './image';

const imageDisplay = ({ display = '', ...props } = {}) =>
  `<figure>${image(props)}<figcaption>${escapeHtml(display)}</figcaption></figure>`;

export default imageDisplay;
