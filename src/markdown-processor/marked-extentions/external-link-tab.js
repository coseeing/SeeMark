import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';
import { buildHTMLMarkup } from './helpers';

/**
 * Matches external link tab syntax: @[display](url)
 *
 * Pattern breakdown:
 * - ^           : Must start at beginning (required by marked.js tokenizer since it checks from start of string)
 * - @           : Literal @ symbol (distinguishes from standard markdown link `[display](target)`; also indicates opening in new tab)
 * - \[          : Opening square bracket (escaped)
 * - ([^\]]+)    : Capture group 1 - display text (one or more non-closing-bracket chars)
 * - \]          : Closing square bracket (escaped)
 * - \(          : Opening parenthesis (escaped)
 * - ([^)]+)     : Capture group 2 - target URL (one or more non-closing-paren chars)
 * - \)          : Closing parenthesis (escaped)
 *
 * Example match: @[Documentation](https://docs.example.com)
 * - match[1] = "Documentation" (display)
 * - match[2] = "https://docs.example.com" (target)
 */
// Regex exported for test
export const EXTERNAL_LINK_TAB_REGEXP = /^@\[([^\]]+)\]\(([^)]+)\)/;
const EXTERNAL_LINK_REGEXP = EXTERNAL_LINK_TAB_REGEXP;

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
