import { parseDocument } from 'htmlparser2';

import {
  SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE,
  SEE_MARK_PAYLOAD_DATA_ATTRIBUTES,
} from '../../shared/common-markup';

import { escapeHtml, escapeAttr, safeUrl } from './escape';
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

// Raw HTML in the markdown source (e.g., <script>, <img onerror=...>) passes
// through Stage 1 verbatim. Since the HTML adapter's output is assigned to
// innerHTML (or jQuery .html(), document.write, etc.) by the consumer, we must
// neutralize the dangerous parts here — otherwise the adapter would be strictly
// more dangerous than the React adapter (which drops on* handlers and never
// executes vDOM scripts). This is "safe by default"; the optional sanitize hook
// covers stricter needs.

// Tags that should never be re-emitted from untrusted passthrough markup.
const DROPPED_TAGS = new Set(['script', 'style']);

// Attributes carrying URLs; their values run through safeUrl on passthrough.
const URL_ATTRS = new Set([
  'href',
  'src',
  'xlink:href',
  'action',
  'formaction',
  'poster',
  'srcset',
]);

const serializeAttrs = (attribs) => {
  if (!attribs) return '';
  return Object.entries(attribs)
    .filter(([k]) => !/^on/i.test(k)) // strip event-handler attributes
    .map(([k, v]) => {
      const value = URL_ATTRS.has(k.toLowerCase()) ? safeUrl(v) : escapeAttr(v);
      return ` ${k}="${value}"`;
    })
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
