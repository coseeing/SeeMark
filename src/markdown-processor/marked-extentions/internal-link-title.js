import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';
import { createRenderer } from './helpers';

/**
 * Matches internal link with title syntax: [display][[title]]<target>
 *
 * Pattern breakdown:
 * - ^           : Must start at beginning (required by marked.js tokenizer since it checks from start of string)
 * - \[          : Opening square bracket (escaped)
 * - ([^\]]+)    : Capture group 1 - display text (one or more non-closing-bracket chars)
 * - \]          : Closing square bracket (escaped)
 * - \[\[        : Opening double square brackets (escaped)
 * - ([^\]]+)    : Capture group 2 - title text (one or more non-closing-bracket chars)
 * - \]\]        : Closing double square brackets (escaped)
 * - <           : Opening angle bracket
 * - ([^>]+)     : Capture group 3 - internal target (one or more non-closing-angle-bracket chars)
 * - >           : Closing angle bracket
 *
 * Example match: [Read More][[Full Article]]<article-123>
 * - match[1] = "Read More" (display)
 * - match[2] = "Full Article" (title)
 * - match[3] = "article-123" (target)
 */
// Regex exported for test
export const INTERNAL_LINK_TITLE_REGEXP = /^\[([^\]]+)\]\[\[([^\]]+)\]\]<([^>]+)>/;

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
              target: match[3],
              meta: {
                display: match[1],
                title: match[2],
                target: match[3],
              },
            };
          }
        },
        renderer: createRenderer(SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK_TITLE),
      },
    ],
  };
};

export default markedInternalLinkTitle;
