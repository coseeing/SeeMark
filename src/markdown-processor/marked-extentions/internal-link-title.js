import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';
import { createRenderer } from './helpers';

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
