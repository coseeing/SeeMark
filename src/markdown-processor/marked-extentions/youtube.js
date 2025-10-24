import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';
import createEmbedExtension from './embed-factory';

/**
 * Marked extension for YouTube embed syntax: @{YOUTUBE}[title](source)
 */
const markedYoutube = () => {
  return createEmbedExtension(SUPPORTED_COMPONENT_TYPES.YOUTUBE);
};

export default markedYoutube;
