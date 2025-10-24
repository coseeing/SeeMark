import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';
import { buildHTMLMarkup } from './helpers';

/**
 * Marked extension for YouTube embed syntax: @{YOUTUBE}[title](source)
 */
const markedYoutube = () => {
  return {
    extensions: [
      {
        name: SUPPORTED_COMPONENT_TYPES.YOUTUBE,
        level: 'block',
        start(src) {
          return src.match(/@\{YOUTUBE\}/)?.index;
        },
        tokenizer(src) {
          // Match @{YOUTUBE}[title](source) syntax
          const match = src.match(/^@\{YOUTUBE\}\[([^\]]*)\]\(([^)]+)\)/);

          if (match) {
            return {
              type: SUPPORTED_COMPONENT_TYPES.YOUTUBE,
              raw: match[0],
              meta: {
                title: match[1] || '',
                source: match[2] || '',
              },
              tokens: [],
            };
          }
        },
        renderer({ meta, tokens = [] }) {
          const children = this.parser.parse(tokens);
          return buildHTMLMarkup(
            SUPPORTED_COMPONENT_TYPES.YOUTUBE,
            meta,
            children
          );
        },
      },
    ],
  };
};

export default markedYoutube;
