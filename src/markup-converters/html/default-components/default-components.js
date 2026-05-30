import { SUPPORTED_COMPONENT_TYPES } from '../../../shared/supported-components';

import alert from './alert';
import heading from './heading';
import internalLink from './internal-link';
import internalLinkTitle from './internal-link-title';
import image from './image';
import imageLink from './image-link';
import imageDisplay from './image-display';
import imageDisplayLink from './image-display-link';
import externalLinkTab from './external-link-tab';
import externalLinkTitle from './external-link-title';
import externalLinkTabTitle from './external-link-tab-title';
import youtube from './youtube';
import codepen from './codepen';
import iframe from './iframe';
import math from './math';

// Mirrors the React adapter's default-components (same SUPPORTED_COMPONENT_TYPES
// keys). Each is a pure (props, childrenHtml) => htmlString function.
const defaultComponents = {
  [SUPPORTED_COMPONENT_TYPES.ALERT]: alert,
  [SUPPORTED_COMPONENT_TYPES.HEADING]: heading,
  [SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK]: internalLink,
  [SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK_TITLE]: internalLinkTitle,
  [SUPPORTED_COMPONENT_TYPES.IMAGE]: image,
  [SUPPORTED_COMPONENT_TYPES.IMAGE_LINK]: imageLink,
  [SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY]: imageDisplay,
  [SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY_LINK]: imageDisplayLink,
  [SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TAB]: externalLinkTab,
  [SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TITLE]: externalLinkTitle,
  [SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TAB_TITLE]: externalLinkTabTitle,
  [SUPPORTED_COMPONENT_TYPES.YOUTUBE]: youtube,
  [SUPPORTED_COMPONENT_TYPES.CODEPEN]: codepen,
  [SUPPORTED_COMPONENT_TYPES.IFRAME]: iframe,
  [SUPPORTED_COMPONENT_TYPES.MATH]: math,
};

export default defaultComponents;
