import { h } from 'vue';

// Attributes adapted from YouTube's official embed snippet.
const youtube = ({ title = '', source = '' }) =>
  h('iframe', {
    width: '560',
    height: '315',
    src: source,
    title,
    frameborder: '0',
    allow:
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    referrerpolicy: 'strict-origin-when-cross-origin',
    allowfullscreen: '',
  });
youtube.inheritAttrs = false;

export default youtube;
