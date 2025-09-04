import { SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE } from '../shared/common-markup';

export const getElementByType = (container, elementType) =>
  container.querySelector(
    `[${SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE}="${elementType}"]`
  );
