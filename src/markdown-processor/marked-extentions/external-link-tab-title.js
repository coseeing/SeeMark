import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';
import { buildHTMLMarkup } from './helpers';

/**
 * Matches external link tab title syntax: @[display][[title]](url)
 *
 * Pattern breakdown:
 * - ^           : Must start at beginning (required by marked.js tokenizer since it checks from start of string)
 * - @           : Literal @ symbol (indicates opening in new tab)
 * - \[          : Opening square bracket for display (escaped)
 * - ([^\]]+)    : Capture group 1 - display text (one or more non-closing-bracket chars)
 * - \]          : Closing square bracket for display (escaped)
 * - \[\[        : Double opening square brackets for title (escaped)
 * - ([^\]]+)    : Capture group 2 - title text (one or more non-closing-bracket chars)
 * - \]\]        : Double closing square brackets for title (escaped)
 * - \(          : Opening parenthesis (escaped)
 * - ([^)]+)     : Capture group 3 - target URL (one or more non-closing-paren chars)
 * - \)          : Closing parenthesis (escaped)
 *
 * Example match: @[Documentation][[Read the docs]](https://docs.example.com)
 * - match[1] = "Documentation" (display)
 * - match[2] = "Read the docs" (title)
 * - match[3] = "https://docs.example.com" (target)
 */
const EXTERNAL_LINK_TAB_TITLE_REGEXP =
  /^@\[([^\]]+)\]\[\[([^\]]+)\]\]\(([^)]+)\)/;

const markedExternalLinkTabTitle = () => {
  return {
    extensions: [
      {
        name: SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TAB_TITLE,
        level: 'inline',
        start(src) {
          return src.match(/@\[/)?.index;
        },
        tokenizer(src) {
          const match = src.match(EXTERNAL_LINK_TAB_TITLE_REGEXP);

          if (match) {
            return {
              type: SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TAB_TITLE,
              raw: match[0],
              display: match[1],
              title: match[2],
              target: match[3],
              meta: {
                display: match[1],
                title: match[2],
                target: match[3],
              },
            };
          }
        },
        renderer({ meta, tokens = [] }) {
          const children = this.parser.parse(tokens);

          return buildHTMLMarkup(
            SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TAB_TITLE,
            meta,
            children
          );
        },
      },
    ],
  };
};

export default markedExternalLinkTabTitle;
