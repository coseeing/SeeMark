import parse from 'html-react-parser';

import { SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE } from '../../shared/common-markup';

const convertMarkup = (markup = '', components = {}, options = {}) => {
  // TODO: handle components and options

  return parse(markup, {
    replace(domNode) {
      // If the node doesn't have seemark type attribute, skip it
      if (
        !domNode.attribs ||
        !domNode.attribs[SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE]
      ) {
        return;
      }
    },
  });
};

export default convertMarkup;
