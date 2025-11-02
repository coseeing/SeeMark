import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';

import { buildHTMLMarkup, extractTokenMeta } from './helpers';

const LINK_REGEXP = /^\[([^\]]+)\]<([^>]+)>/;

const markedInternalLink = () => {
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
              display: match[1],
              target: match[2],
              meta: {
                display: match[1],
                target: match[2],
              },
            };
          }
        },
        renderer(token) {
          const { meta, tokens = [] } = token;
          const children = this.parser.parse(tokens);
          const fullMeta = extractTokenMeta(token, meta);

          return buildHTMLMarkup(
            SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK,
            fullMeta,
            children
          );
        },
      },
    ],
  };
};

export default markedInternalLink;
