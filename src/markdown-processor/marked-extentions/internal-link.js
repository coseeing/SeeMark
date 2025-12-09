import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';
import { createRenderer } from './helpers';

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
