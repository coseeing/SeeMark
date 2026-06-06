import { parseDocument } from 'htmlparser2';

import {
  SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE,
  SEE_MARK_PAYLOAD_DATA_ATTRIBUTES,
} from '../../shared/common-markup';

import { escapeHtml } from './escape';
import { DROPPED_TAGS, serializeAttrs } from './raw-html-policy';
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

const renderElement = (name, attribs, innerHtml) => {
  const attrs = serializeAttrs(attribs);
  if (VOID_TAGS.has(name)) return `<${name}${attrs}>`;
  return `<${name}${attrs}>${innerHtml}</${name}>`;
};

// Stage 1 guarantees parseable payloads (it attribute-escapes the JSON and
// strips forged data-seemark-* from user raw HTML), so an unparseable payload
// can only mean a SeeMark bug — fail loudly instead of silently emitting a
// fallback element that would leak data-seemark-* attributes downstream.
const parsePayload = (payloadStr, type) => {
  if (!payloadStr) return {};
  try {
    return JSON.parse(payloadStr);
  } catch (error) {
    throw new Error(
      `SeeMark: unparseable ${SEE_MARK_PAYLOAD_DATA_ATTRIBUTES} for component "${type}" — Stage 1/Stage 2 contract violation (${error.message})`
    );
  }
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
        const props = parsePayload(
          node.attribs[SEE_MARK_PAYLOAD_DATA_ATTRIBUTES],
          type
        );
        const childrenHtml = (node.children || []).map(walk).join('');
        // Component exceptions propagate: a throwing (custom) component is a
        // consumer bug that must surface, not degrade into a plain element.
        return Component(props, childrenHtml);
      }
      // Drop dangerous raw passthrough tags entirely.
      if (DROPPED_TAGS.has(node.name)) return '';
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
