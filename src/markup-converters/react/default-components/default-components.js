import { SUPPORTED_COMPONENT_TYPES } from '../../../shared/supported-components';

import Alert from './alert/Alert.jsx';
import InternalLink from './internal-link/InternalLink.jsx';

const defaultComponents = {
  [SUPPORTED_COMPONENT_TYPES.ALERT]: Alert,
  [SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK]: InternalLink,
};

export default defaultComponents;
