import { h } from 'vue';

import image from './image';

const imageDisplayLink = ({ display = '', ...props }) =>
  h('a', { href: props.target }, [
    h('figure', null, [image(props), h('figcaption', null, display)]),
  ]);
imageDisplayLink.inheritAttrs = false;

export default imageDisplayLink;
