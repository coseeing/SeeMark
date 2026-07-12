import { h } from 'vue';

const image = ({ alt = '', imageId = '', source = '' }) =>
  h('img', { src: source, alt, 'data-seemark-image-id': imageId });
image.inheritAttrs = false;

export default image;
