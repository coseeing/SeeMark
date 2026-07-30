import { h } from 'vue';

import image from './image';

// Call image() directly, not h(image, ...), to avoid an extra component
// instance in the tree — mirroring the HTML adapter's string composition.
const imageLink = (props = {}) =>
  h('a', { href: props.target }, [image(props)]);
imageLink.inheritAttrs = false;

export default imageLink;
