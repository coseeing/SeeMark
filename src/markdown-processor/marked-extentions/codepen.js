import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';
import createEmbedExtension from './embed-factory';

/**
 * Marked extension for CodePen embed syntax: @{CODEPEN}[title](source)
 */
const markedCodepen = () => {
  return createEmbedExtension(SUPPORTED_COMPONENT_TYPES.CODEPEN);
};

export default markedCodepen;
