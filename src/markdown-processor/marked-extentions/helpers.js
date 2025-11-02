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

export const buildHTMLMarkup = (type = '', meta = {}, children = '') => {
  const payload = JSON.stringify(meta);

  return `<div ${SEE_MARK_PAYLOAD_DATA_ATTRIBUTES}='${payload}' ${SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE}="${type}">${children}</div>`;
};
