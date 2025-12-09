import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';
import { createRenderer } from './helpers';

/**
 * Matches internal link syntax: [display]<target>
 *
 * Pattern breakdown:
 * - ^           : Must start at beginning (required by marked.js tokenizer since it checks from start of string)
 * - \[          : Opening square bracket (escaped)
 * - ([^\]]+)    : Capture group 1 - display text (one or more non-closing-bracket chars)
 * - \]          : Closing square bracket (escaped)
 * - <           : Opening angle bracket
 * - ([^>]+)     : Capture group 2 - internal target (one or more non-closing-angle-bracket chars)
 * - >           : Closing angle bracket
 *
 * Example match: [Home Page]<home>
 * - match[1] = "Home Page" (display)
 * - match[2] = "home" (target)
 */
// Regex exported for test
export const INTERNAL_LINK_REGEXP = /^\[([^\]]+)\]<([^>]+)>/;

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
          const match = src.match(INTERNAL_LINK_REGEXP);

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
        renderer: createRenderer(SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK),
      },
    ],
  };
};

export default markedInternalLink;
