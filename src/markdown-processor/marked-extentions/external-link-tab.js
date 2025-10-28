import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';
import { buildHTMLMarkup } from './helpers';

const EXTERNAL_LINK_REGEXP = /^@\[([^\]]+)\]\(([^)]+)\)/;

const markedExternalLinkTab = () => {
  return {
    extensions: [
      {
        name: SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TAB,
        level: 'inline',
        start(src) {
          return src.match(/@\[/)?.index;
        },
        tokenizer(src) {
          const match = src.match(EXTERNAL_LINK_REGEXP);

          if (match) {
            return {
              type: SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TAB,
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
        renderer({ meta, tokens = [] }) {
          const children = this.parser.parse(tokens);

          return buildHTMLMarkup(
            SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TAB,
            meta,
            children
          );
        },
      },
    ],
  };
};

export default markedExternalLinkTab;
