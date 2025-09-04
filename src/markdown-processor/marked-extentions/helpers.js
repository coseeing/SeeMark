import {
  SEE_MARK_PAYLOAD_DATA_ATTRIBUTES,
  SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE,
} from '../../shared/common-markup';

export const buildHTMLMarkup = (type = '', meta = {}, children = '') => {
  const payload = JSON.stringify(meta);

  return `<div ${SEE_MARK_PAYLOAD_DATA_ATTRIBUTES}='${payload}' ${SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE}="${type}">${children}</div>`;
};
