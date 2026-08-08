import { h } from 'vue';

const alert = (
  { internalLinkId = '', variant = '', title = '' },
  { slots }
) => {
  const children = [h('p', null, variant.toUpperCase())];
  if (slots.default) children.push(...slots.default());
  if (internalLinkId) {
    children.push(h('a', { href: `#${internalLinkId}-source` }, 'back'));
  }
  return h(
    'div',
    { role: 'region', 'aria-label': title, id: internalLinkId || null },
    children
  );
};
alert.inheritAttrs = false;

export default alert;
