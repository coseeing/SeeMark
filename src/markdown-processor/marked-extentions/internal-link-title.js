import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';
import { buildHTMLMarkup } from './helpers';

const INTERNAL_LINK_TITLE_REGEXP = /^\[([^\]]+)\]\[\[([^\]]+)\]\]<([^>]+)>/;

const markedInternalLinkTitle = () => {
  return {
    extensions: [
      {
        name: SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK_TITLE,
        level: 'inline',
        start(src) {
          return src.match(/\[/)?.index;
        },
        tokenizer(src) {
          const match = src.match(INTERNAL_LINK_TITLE_REGEXP);

          if (match) {
            return {
              type: SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK_TITLE,
              raw: match[0],
              display: match[1],
              title: match[2],
              id: match[3],
              meta: {
                display: match[1],
                title: match[2],
                id: match[3],
              },
            };
          }
        },
        renderer({ meta, tokens = [] }) {
          const children = this.parser.parse(tokens);

          return buildHTMLMarkup(
            SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK_TITLE,
            meta,
            children
          );
        },
      },
    ],
  };
};

export default markedInternalLinkTitle;
