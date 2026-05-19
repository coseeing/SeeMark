import { SUPPORTED_COMPONENT_TYPES } from '../../../shared/supported-components';

import alert from './alert';
import heading from './heading';
import internalLink from './internal-link';
import image from './image';
import math from './math';

// Phase 1A delivers the 5 components required by Access8MathTemplate.
// The remaining 11 (image-link, image-display, image-display-link,
// internal-link-title, external-link-tab/-title/-tab-title, youtube,
// codepen, iframe) are added in Phase 1B.
const defaultComponents = {
  [SUPPORTED_COMPONENT_TYPES.ALERT]: alert,
  [SUPPORTED_COMPONENT_TYPES.HEADING]: heading,
  [SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK]: internalLink,
  [SUPPORTED_COMPONENT_TYPES.IMAGE]: image,
  [SUPPORTED_COMPONENT_TYPES.MATH]: math,
};

export default defaultComponents;
