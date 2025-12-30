import { SUPPORTED_COMPONENT_TYPES } from '../../../shared/supported-components';

import Alert from './alert/Alert.jsx';
import Heading from './heading/Heading.jsx';
import InternalLink from './internal-link/InternalLink.jsx';
import InternalLinkTitle from './internal-link-title/InternalLinkTitle.jsx';
import Image from './image/Image.jsx';
import ExternalLinkTab from './external-link-tab/ExternalLinkTab.jsx';
import ExternalLinkTitle from './external-link-title/ExternalLinkTitle.jsx';
import ExternalLinkTabTitle from './external-link-tab-title/ExternalLinkTabTitle.jsx';
import ImageLink from './image-link/ImageLink.jsx';
import ImageDisplay from './image-display/ImageDisplay.jsx';
import ImageDisplayLink from './image-display-link/ImageDisplayLink.jsx';
import YouTube from './youtube/YouTube.jsx';
import CodePen from './codepen/CodePen.jsx';
import Iframe from './iframe/Iframe.jsx';

const defaultComponents = {
  [SUPPORTED_COMPONENT_TYPES.ALERT]: Alert,
  [SUPPORTED_COMPONENT_TYPES.HEADING]: Heading,
  [SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK]: InternalLink,
  [SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK_TITLE]: InternalLinkTitle,
  [SUPPORTED_COMPONENT_TYPES.IMAGE]: Image,
  [SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TAB]: ExternalLinkTab,
  [SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TITLE]: ExternalLinkTitle,
  [SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TAB_TITLE]: ExternalLinkTabTitle,
  [SUPPORTED_COMPONENT_TYPES.IMAGE_LINK]: ImageLink,
  [SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY]: ImageDisplay,
  [SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY_LINK]: ImageDisplayLink,
  [SUPPORTED_COMPONENT_TYPES.YOUTUBE]: YouTube,
  [SUPPORTED_COMPONENT_TYPES.CODEPEN]: CodePen,
  [SUPPORTED_COMPONENT_TYPES.IFRAME]: Iframe,
};

export default defaultComponents;
