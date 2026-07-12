import { h } from 'vue';
import { parseDocument } from 'htmlparser2';

import {
  SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE,
  SEE_MARK_PAYLOAD_DATA_ATTRIBUTES,
} from '../../shared/common-markup';

import defaultComponents from './default-components/default-components';

// Vue sets string-valued native on* props via setAttribute (see vuejs/core
// shouldSetAsProp's native-on special case), which creates LIVE inline
// handlers — unlike React, which warns and ignores string handlers. Dropping
// them keeps this adapter no more dangerous than the React one. This is the
// ONLY attribute filtering the adapter does; everything else (including
// javascript: URLs) passes through verbatim — see the README trust model.
const isInlineHandlerAttr = (name) => /^on/i.test(name);

const toPassthroughProps = (attribs) => {
  if (!attribs) return null;
  const props = {};
  for (const [name, value] of Object.entries(attribs)) {
    if (isInlineHandlerAttr(name)) continue;
    props[name] = value;
  }
  return props;
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

const convertMarkup = (markup = '', components = {}) => {
  const processedComponents = { ...defaultComponents, ...components };

  const walkAll = (nodes) =>
    (nodes || []).map(walk).filter((child) => child !== null);

  const walk = (node) => {
    if (node.type === 'text') return node.data;
    // Comments cannot round-trip through VNodes the way they do through the
    // HTML adapter's strings; the React adapter drops them too.
    if (node.type === 'comment') return null;
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
        // Children travel as the default slot — the one idiom every Vue
        // component form (functional, defineComponent, SFC) understands.
        // Rebuilt on every slot invocation: a slot must return fresh VNodes
        // each call (a component may call slots.default() twice in one
        // render, or re-render later) — never a cached, possibly-mounted
        // array.
        return h(Component, props, { default: () => walkAll(node.children) });
      }
      return h(
        node.name,
        toPassthroughProps(node.attribs),
        walkAll(node.children)
      );
    }
    // cdata / directive nodes have no VNode representation.
    return null;
  };

  const doc = parseDocument(markup, { decodeEntities: true });
  return walkAll(doc.children);
};

export default convertMarkup;
