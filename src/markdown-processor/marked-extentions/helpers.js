import {
  SEE_MARK_PAYLOAD_DATA_ATTRIBUTES,
  SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE,
} from '../../shared/common-markup';

/**
 * Extracts metadata from a token, including position if available.
 * This helper reduces boilerplate in extension renderers.
 *
 * @param {Object} token - The Marked token object
 * @param {Object} customMeta - Custom metadata to merge with token data
 * @returns {Object} Combined metadata object with position if available
 */
export const extractTokenMeta = (token, customMeta = {}) => {
  return {
    ...customMeta,
    ...(token.position && { position: token.position }),
  };
};

/**
 * Builds HTML markup with SeeMark data attributes for custom components.
 *
 * @param {string} type - The component type identifier (from SUPPORTED_COMPONENT_TYPES)
 * @param {Object} meta - Metadata to include in payload (passed to React component as props)
 * @param {string} children - Inner HTML content
 * @returns {string} HTML string
 */
export const buildHTMLMarkup = (type = '', meta = {}, children = '') => {
  const payload = JSON.stringify(meta);

  return `<div ${SEE_MARK_PAYLOAD_DATA_ATTRIBUTES}='${payload}' ${SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE}="${type}">${children}</div>`;
};

/**
 * Creates a renderer function for Marked extensions that render custom components.
 *
 * This helper provides a standard rendering pipeline:
 * 1. Extract metadata (with optional custom logic)
 * 2. Add global metadata (e.g., position tracking)
 * 3. Parse child tokens (if needed)
 * 4. Build HTML markup wrapper with data attributes
 *
 * Supports both simple usage (no options) and advanced customization (with options).
 * Do NOT use for special cases like math extension that render inline HTML without wrapper.
 *
 * @param {string} componentType - The component type identifier (from SUPPORTED_COMPONENT_TYPES)
 * @param {Object} options - Optional configuration for custom rendering behavior
 * @param {Function} options.extractMeta - Optional custom metadata extraction function.
 *   Receives (token) and should return custom metadata object.
 *   Can access closure variables for context (e.g., imageFiles, options).
 *   If not provided, uses token.meta.
 * @param {boolean} options.parseChildren - Whether to parse child tokens (default: true).
 *   Set to false for extensions without children (e.g., image).
 * @param {Function} options.onError - Optional error handler.
 *   Receives (error, token) and should return fallback metadata object.
 *   If not provided, errors will propagate.
 * @returns {Function} A renderer function that can be used in a Marked extension
 *
 * @example
 * // Simple usage (alert, internal-link):
 * renderer: createRenderer(SUPPORTED_COMPONENT_TYPES.ALERT)
 *
 * @example
 * // Advanced usage with custom meta extraction (image):
 * const markedImage = ({ imageFiles, shouldBuildImageObjectURL }) => {
 *   const blobUrlManager = createBlobUrlManager();
 *   return {
 *     renderer: {
 *       image: createRenderer(SUPPORTED_COMPONENT_TYPES.IMAGE, {
 *         extractMeta(token) {
 *           // Access closure variables
 *           const imageFile = imageFiles[token.href];
 *           const src = shouldBuildImageObjectURL
 *             ? blobUrlManager(token.href, imageFile)
 *             : imageFile;
 *           return { alt: token.text, imageId: token.href, src };
 *         },
 *         parseChildren: false,
 *         onError(error, token) {
 *           console.error('Error:', error);
 *           return { alt: token.text, imageId: token.href, src: token.href };
 *         }
 *       })
 *     }
 *   };
 * };
 */
export const createRenderer = (componentType, options = {}) => {
  const { extractMeta = null, parseChildren = true, onError = null } = options;

  return function (token) {
    try {
      // Extract custom metadata: use provided function or fallback to token.meta
      const customMeta = extractMeta ? extractMeta(token) : token.meta || {};

      // Automatically add global metadata (e.g., position)
      const fullMeta = extractTokenMeta(token, customMeta);

      // Parse child tokens if needed
      const { tokens = [] } = token;
      const children = parseChildren ? this.parser.parse(tokens) : '';

      // Build HTML markup wrapper
      return buildHTMLMarkup(componentType, fullMeta, children);
    } catch (error) {
      if (onError) {
        const fallbackMeta = onError(error, token);
        const fullMeta = extractTokenMeta(token, fallbackMeta);
        return buildHTMLMarkup(componentType, fullMeta, '');
      }
      throw error;
    }
  };
};
