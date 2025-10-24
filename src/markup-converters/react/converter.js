import { createElement } from 'react';

// Since we need to convert bnudle to commonjs for mathjax, we need to dynamically handle the default export of html-react-parser
import htmlReactParser, { domToReact } from 'html-react-parser';

// Handle both ESM and CommonJS scenarios
const parser =
  typeof htmlReactParser === 'function'
    ? htmlReactParser
    : htmlReactParser.default;

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
  const processedComponents = {
    ...defaultComponents,
    ...components,
  };

  return parser(markup, {
    replace(domNode) {
      const elementType =
        domNode?.attribs?.[SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE];

      // If the node doesn't have seemark type attribute, skip it
      if (!elementType) {
        return;
      }

      const Component = processedComponents[elementType];

      if (!Component) {
        return;
      }

      const payloadString = domNode.attribs[SEE_MARK_PAYLOAD_DATA_ATTRIBUTES];

      const props = JSON.parse(payloadString);
      const childrenNode = domToReact(domNode.children, options);

      return createElement(Component, props, childrenNode);
    },
  });
};

export default convertMarkup;
