import { SUPPORTED_COMPONENT_TYPES } from '../../../shared/supported-components';

import Alert from './alert/Alert.jsx';
import InternalLink from './internal-link/InternalLink.jsx';
import Image from './image/Image.jsx';
import ImageLink from './image-link/ImageLink.jsx';
import ImageDisplay from './image-display/ImageDisplay.jsx';
import ImageDisplayLink from './image-display-link/ImageDisplayLink.jsx';

const defaultComponents = {
  [SUPPORTED_COMPONENT_TYPES.ALERT]: Alert,
  [SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK]: InternalLink,
  [SUPPORTED_COMPONENT_TYPES.IMAGE]: Image,
  [SUPPORTED_COMPONENT_TYPES.IMAGE_LINK]: ImageLink,
  [SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY]: ImageDisplay,
  [SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY_LINK]: ImageDisplayLink,
};

export default defaultComponents;
