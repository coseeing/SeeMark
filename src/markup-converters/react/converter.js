import { createElement } from 'react';

import parse, { domToReact } from 'html-react-parser';

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
  const proccessedComponents = {
    ...defaultComponents,
    ...components,
  };

  return parse(markup, {
    replace(domNode) {
      const elementType =
        domNode?.attribs?.[SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE];
      // If the node doesn't have seemark type attribute, skip it
      if (!elementType) {
        return;
      }

      const Component = proccessedComponents[elementType];

      if (!Component) {
        return;
      }

      const payloadString = domNode.attribs[SEE_MARK_PAYLOAD_DATA_ATTRIBUTES];

      const props = JSON.parse(payloadString);

      return createElement(Component, props);
    },
  });
};

export default convertMarkup;
