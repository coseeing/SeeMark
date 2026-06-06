import { safeUrl } from '../escape';

import image from './image';

const imageLink = (props = {}) =>
  `<a href="${safeUrl(props.target)}">${image(props)}</a>`;

export default imageLink;
