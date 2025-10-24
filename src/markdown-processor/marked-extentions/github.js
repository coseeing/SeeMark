import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';
import createEmbedExtension from './embed-factory';

/**
 * Marked extension for GitHub embed syntax: @{GITHUB}[title](source)
 */
const markedGithub = () => {
  return createEmbedExtension(SUPPORTED_COMPONENT_TYPES.GITHUB);
};

export default markedGithub;
