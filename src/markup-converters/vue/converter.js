import { h } from 'vue';
import { parseDocument } from 'htmlparser2';

import {
  SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE,
  SEE_MARK_PAYLOAD_DATA_ATTRIBUTES,
} from '../../shared/common-markup';

import defaultComponents from './default-components/default-components';

// Vue turns string on* attributes into live inline handlers; React ignores
// them. Drop them so this adapter is no more dangerous than React — everything
// else (javascript: URLs included) passes through, per the README trust model.
const isInlineHandlerAttr = (name) => /^on/i.test(name);

// Vue treats these as framework directives, not DOM attributes. Untrusted
// markup must never reach them: `ref` would register on the consuming
// component's $refs, and `key`/`ref_for`/`ref_key` corrupt keyed diffing.
const RESERVED_VNODE_PROPS = new Set(['key', 'ref', 'ref_for', 'ref_key']);

// htmlparser2 lowercases attribute names, which breaks SVG's case-sensitive
// camelCase attributes (`viewbox` never acts as `viewBox`). Restore the
// casing, as the React adapter and the browser's SVG parser do. Only raw
// inline SVG hits this — MathJax's SVG is injected via innerHTML.
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

// Stage 1 guarantees parseable payloads, so a parse failure can only be a
// SeeMark bug — fail loudly instead of silently leaking data-seemark-* markup.
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
    // No VNode representation for comments; the React adapter drops them too.
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
        // Children travel as the default slot (the idiom every Vue component
        // form understands). Rebuilt per invocation, never cached: a slot must
        // return fresh VNodes each call.
        return h(Component, props, { default: () => walkAll(node.children) });
      }
      // A <script> built as a VNode executes on mount (React's and the HTML
      // adapter's are inert). Drop it so this adapter is no more dangerous than
      // React. <style> is inert either way, so it stays.
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
