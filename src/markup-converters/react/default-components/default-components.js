import { SUPPORTED_COMPONENT_TYPES } from '../../../shared/supported-components';

import Alert from './alert/Alert.jsx';
import InternalLink from './internal-link/InternalLink.jsx';
import InternalLinkTitle from './internal-link-title/InternalLinkTitle.jsx';
import Image from './image/Image.jsx';

const defaultComponents = {
  [SUPPORTED_COMPONENT_TYPES.ALERT]: Alert,
  [SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK]: InternalLink,
  [SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK_TITLE]: InternalLinkTitle,
  [SUPPORTED_COMPONENT_TYPES.IMAGE]: Image,
};

export default defaultComponents;
