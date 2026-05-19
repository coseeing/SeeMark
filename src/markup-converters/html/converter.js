import { parseDocument } from 'htmlparser2';

import {
  SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE,
  SEE_MARK_PAYLOAD_DATA_ATTRIBUTES,
} from '../../shared/common-markup';

import { escapeHtml, escapeAttr } from './escape';
import defaultComponents from './default-components/default-components';

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const serializeAttrs = (attribs) => {
  if (!attribs) return '';
  return Object.entries(attribs)
    .map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
    .join('');
};

const renderElement = (name, attribs, innerHtml) => {
  const attrs = serializeAttrs(attribs);
  if (VOID_TAGS.has(name)) return `<${name}${attrs}>`;
  return `<${name}${attrs}>${innerHtml}</${name}>`;
};

const convertMarkup = (markup = '', components = {}, options = {}) => {
  const { sanitize } = options;
  const processedComponents = { ...defaultComponents, ...components };

  const walk = (node) => {
    if (node.type === 'text') return escapeHtml(node.data);
    if (node.type === 'comment') return `<!--${node.data}-->`;
    if (
      node.type === 'tag' ||
      node.type === 'script' ||
      node.type === 'style'
    ) {
      const type = node.attribs?.[SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE];
      const Component = type && processedComponents[type];
      if (Component) {
        const payloadStr = node.attribs[SEE_MARK_PAYLOAD_DATA_ATTRIBUTES];
        try {
          const props = payloadStr ? JSON.parse(payloadStr) : {};
          const childrenHtml = (node.children || []).map(walk).join('');
          return Component(props, childrenHtml);
        } catch {
          // Payload parse failed — fall through to render as a normal element
          // so the placeholder is at least visible rather than silently dropped.
        }
      }
      const innerHtml = (node.children || []).map(walk).join('');
      return renderElement(node.name, node.attribs, innerHtml);
    }
    // root / document / cdata / directive
    return (node.children || []).map(walk).join('');
  };

  const doc = parseDocument(markup, { decodeEntities: true });
  const result = (doc.children || []).map(walk).join('');
  return sanitize ? sanitize(result) : result;
};

export default convertMarkup;
