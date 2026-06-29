import { escapeAttr } from '../escape';

import image from './image';

const imageLink = (props = {}) =>
  `<a href="${escapeAttr(props.target)}">${image(props)}</a>`;

export default imageLink;
