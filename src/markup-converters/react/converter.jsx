import React from 'react';

import parse from 'html-react-parser';

import {
  SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE,
  SEE_MARK_PAYLOAD_DATA_ATTRIBUTES,
} from '../../shared/common-markup';

import defaultComponents from './default-components/default-components';

const convertMarkup = (
  markup = '',
  components = defaultComponents,
  options = {}
) => {
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

      Object.keys(components).forEach((type) => {
        // avoid nullish component
        if (!components[type]) {
          return;
        }

        if (domNode.attribs[SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE] === type) {
          const Component = components[type];

          const payloadString =
            domNode.attribs[SEE_MARK_PAYLOAD_DATA_ATTRIBUTES];

          const props = JSON.parse(payloadString);

          return <Component {...props} />;
        }
      });
    },
  });
};

export default convertMarkup;
