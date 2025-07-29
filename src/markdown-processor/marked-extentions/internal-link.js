import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';

import { buildHTMLMarkup } from './helpers';

const LINK_REGEXP = /^\[([^\]]+)\]<([^>]+)>/;

function markedInternalLink() {
  return {
    extensions: [
      {
        name: SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK,
        level: 'inline',
        start(src) {
          return src.match(/\[/)?.index;
        },
        tokenizer(src) {
          const match = src.match(LINK_REGEXP);

          if (match) {
            return {
              type: SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK,
              raw: match[0],
              text: match[1],
              id: match[2],
              meta: {
                text: match[1],
                id: match[2],
              },
            };
          }
        },
        renderer({ meta, tokens = [] }) {
          const children = this.parser.parse(tokens);

          return buildHTMLMarkup(
            SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK,
            meta,
            children
          );
        },
      },
    ],
  };
}

export default markedInternalLink;
