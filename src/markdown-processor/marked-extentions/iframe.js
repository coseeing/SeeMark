import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';
import { buildHTMLMarkup } from './helpers';

/**
 * Matches iframe syntax: @[title](source)
 *
 * Pattern breakdown:
 * - ^           : Must start at beginning (required by marked.js tokenizer since it checks from start of string)
 * - @           : Literal @ symbol (indicates iframe embed)
 * - \[          : Opening square bracket (escaped)
 * - ([^\]]+)    : Capture group 1 - title text (one or more non-closing-bracket chars)
 * - \]          : Closing square bracket (escaped)
 * - \(          : Opening parenthesis (escaped)
 * - ([^)]+)     : Capture group 2 - source URL (one or more non-closing-paren chars)
 * - \)          : Closing parenthesis (escaped)
 *
 * Example match: @[YouTube Video](https://www.youtube.com/embed/dQw4w9WgXcQ)
 * - match[1] = "YouTube Video" (title)
 * - match[2] = "https://www.youtube.com/embed/dQw4w9WgXcQ" (source)
 */
// Regex exported for test
export const IFRAME_REGEXP = /^@\[([^\]]+)\]\(([^)]+)\)/;

const YOUTUBE_REGEXP = /^https:\/\/www\.youtube\.com\/embed\/.*/;
const CODEPEN_REGEXP = /^https:\/\/codepen\.io\/.*\/embed\/.*/;

const determineIframeType = (source) => {
  if (YOUTUBE_REGEXP.test(source)) {
    return SUPPORTED_COMPONENT_TYPES.YOUTUBE;
  }
  if (CODEPEN_REGEXP.test(source)) {
    return SUPPORTED_COMPONENT_TYPES.CODEPEN;
  }
  return SUPPORTED_COMPONENT_TYPES.IFRAME;
};

const markedIframe = () => {
  // Shared renderer function for all iframe types
  const sharedRenderer = function ({ type, meta, tokens = [] }) {
    const children = this.parser.parse(tokens);
    return buildHTMLMarkup(type, meta, children);
  };

  return {
    extensions: [
      // Main extension that tokenizes the iframe syntax
      {
        name: SUPPORTED_COMPONENT_TYPES.IFRAME,
        level: 'inline',
        start(src) {
          return src.match(/@\[/)?.index;
        },
        tokenizer(src) {
          const match = src.match(IFRAME_REGEXP);

          if (match) {
            const title = match[1];
            const source = match[2];
            const type = determineIframeType(source);

            return {
              type,
              raw: match[0],
              title,
              source,
              meta: {
                title,
                source,
              },
            };
          }
        },
        renderer: sharedRenderer,
      },
      // YouTube renderer extension
      {
        name: SUPPORTED_COMPONENT_TYPES.YOUTUBE,
        level: 'inline',
        renderer: sharedRenderer,
      },
      // Codepen renderer extension
      {
        name: SUPPORTED_COMPONENT_TYPES.CODEPEN,
        level: 'inline',
        renderer: sharedRenderer,
      },
    ],
  };
};

export default markedIframe;
