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
// them keeps this adapter no more dangerous than the React one. Everything
// else (including javascript: URLs) passes through verbatim — see the README
// trust model.
const isInlineHandlerAttr = (name) => /^on/i.test(name);

// Vue reserves these vnode props: handed to h() they become framework
// directives, not DOM attributes. Raw user markup must never reach them —
// `ref` would register on the CONSUMING component's $refs (letting untrusted
// content clobber a ref the app relies on), and `key`/`ref_for`/`ref_key`
// corrupt keyed diffing across re-renders. htmlparser2 lowercases attribute
// names, so a lowercase check suffices.
const RESERVED_VNODE_PROPS = new Set(['key', 'ref', 'ref_for', 'ref_key']);

// htmlparser2 lowercases attribute names when parsing HTML, which turns SVG's
// case-sensitive camelCase attributes into inert ones: Vue applies attributes
// on an SVG element via setAttribute, which (unlike on HTML elements)
// preserves case, so `viewbox` never behaves as `viewBox`. The React adapter
// (html-react-parser) and the browser's own SVG foreign-content parsing both
// restore this casing; we mirror them. Keyed by the lowercased name
// htmlparser2 emits. (MathJax's own SVG never travels this path — the math
// component injects it via innerHTML — so this only affects raw inline SVG.)
const SVG_CAMELCASE_ATTRS = {
  allowreorder: 'allowReorder',
  attributename: 'attributeName',
  attributetype: 'attributeType',
  autoreverse: 'autoReverse',
  basefrequency: 'baseFrequency',
  baseprofile: 'baseProfile',
  calcmode: 'calcMode',
  clippathunits: 'clipPathUnits',
  diffuseconstant: 'diffuseConstant',
  edgemode: 'edgeMode',
  externalresourcesrequired: 'externalResourcesRequired',
  filterres: 'filterRes',
  filterunits: 'filterUnits',
  glyphref: 'glyphRef',
  gradienttransform: 'gradientTransform',
  gradientunits: 'gradientUnits',
  kernelmatrix: 'kernelMatrix',
  kernelunitlength: 'kernelUnitLength',
  keypoints: 'keyPoints',
  keysplines: 'keySplines',
  keytimes: 'keyTimes',
  lengthadjust: 'lengthAdjust',
  limitingconeangle: 'limitingConeAngle',
  markerheight: 'markerHeight',
  markerunits: 'markerUnits',
  markerwidth: 'markerWidth',
  maskcontentunits: 'maskContentUnits',
  maskunits: 'maskUnits',
  numoctaves: 'numOctaves',
  pathlength: 'pathLength',
  patterncontentunits: 'patternContentUnits',
  patterntransform: 'patternTransform',
  patternunits: 'patternUnits',
  pointsatx: 'pointsAtX',
  pointsaty: 'pointsAtY',
  pointsatz: 'pointsAtZ',
  preservealpha: 'preserveAlpha',
  preserveaspectratio: 'preserveAspectRatio',
  primitiveunits: 'primitiveUnits',
  refx: 'refX',
  refy: 'refY',
  repeatcount: 'repeatCount',
  repeatdur: 'repeatDur',
  requiredextensions: 'requiredExtensions',
  requiredfeatures: 'requiredFeatures',
  specularconstant: 'specularConstant',
  specularexponent: 'specularExponent',
  spreadmethod: 'spreadMethod',
  startoffset: 'startOffset',
  stddeviation: 'stdDeviation',
  stitchtiles: 'stitchTiles',
  surfacescale: 'surfaceScale',
  systemlanguage: 'systemLanguage',
  tablevalues: 'tableValues',
  targetx: 'targetX',
  targety: 'targetY',
  textlength: 'textLength',
  viewbox: 'viewBox',
  viewtarget: 'viewTarget',
  xchannelselector: 'xChannelSelector',
  ychannelselector: 'yChannelSelector',
  zoomandpan: 'zoomAndPan',
};

const toPassthroughProps = (attribs) => {
  if (!attribs) return null;
  const props = {};
  for (const [name, value] of Object.entries(attribs)) {
    if (isInlineHandlerAttr(name)) continue;
    if (RESERVED_VNODE_PROPS.has(name)) continue;
    props[SVG_CAMELCASE_ATTRS[name] || name] = value;
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
      // A raw <script> built via h()/createElement is NOT parser-inserted, so
      // it EXECUTES on mount — unlike the React adapter (its script elements
      // are inert) and the HTML adapter (its string output is inert under
      // innerHTML). Drop it so the Vue adapter is not more dangerous than the
      // React one. <style> applies identically in both adapters, so it stays.
      if (node.type === 'script') return null;
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
