import { h } from 'vue';

import image from './image';

// image() is a plain function — calling it directly (instead of h(image, ...))
// keeps the DOM free of an extra component instance, mirroring the HTML
// adapter's string composition.
const imageLink = (props = {}) =>
  h('a', { href: props.target }, [image(props)]);
imageLink.inheritAttrs = false;

export default imageLink;
