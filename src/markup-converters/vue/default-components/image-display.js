import { h } from 'vue';

import image from './image';

const imageDisplay = ({ display = '', ...props }) =>
  h('figure', null, [image(props), h('figcaption', null, display)]);
imageDisplay.inheritAttrs = false;

export default imageDisplay;
