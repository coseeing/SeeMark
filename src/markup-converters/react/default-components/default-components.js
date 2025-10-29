import { SUPPORTED_COMPONENT_TYPES } from '../../../shared/supported-components';

import Alert from './alert/Alert.jsx';
import InternalLink from './internal-link/InternalLink.jsx';
import InternalLinkTitle from './internal-link-title/InternalLinkTitle.jsx';
import Image from './image/Image.jsx';
<<<<<<< HEAD
import ExternalLinkTab from './external-link-tab/ExternalLinkTab.jsx';
import ExternalLinkTitle from './external-link-title/ExternalLinkTitle.jsx';
import ExternalLinkTabTitle from './external-link-tab-title/ExternalLinkTabTitle.jsx';
=======
import ImageLink from './image-link/ImageLink.jsx';
>>>>>>> 4b7f3f6 (feat: support image_link custom syntax)

const defaultComponents = {
  [SUPPORTED_COMPONENT_TYPES.ALERT]: Alert,
  [SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK]: InternalLink,
  [SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK_TITLE]: InternalLinkTitle,
  [SUPPORTED_COMPONENT_TYPES.IMAGE]: Image,
<<<<<<< HEAD
  [SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TAB]: ExternalLinkTab,
  [SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TITLE]: ExternalLinkTitle,
  [SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TAB_TITLE]: ExternalLinkTabTitle,
=======
  [SUPPORTED_COMPONENT_TYPES.IMAGE_LINK]: ImageLink,
>>>>>>> 4b7f3f6 (feat: support image_link custom syntax)
};

export default defaultComponents;
