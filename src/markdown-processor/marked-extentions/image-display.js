import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';

import { buildHTMLMarkup } from './helpers';

// Regex exported for test
export const IMAGE_DISPLAY_REGEXP = /^!\[([^\]]*)\]\[\[([^\]]+)\]\]\(([^)]+)\)/;

const createBlobUrlManager = () => {
  const cache = new Map();

  return (href, imageFile) => {
    if (cache.has(href)) {
      return cache.get(href);
    }
    const blobUrl = URL.createObjectURL(imageFile);
    cache.set(href, blobUrl);
    return blobUrl;
  };
};

const blobUrlManager = createBlobUrlManager();

const markedImageDisplay = ({ imageFiles, shouldBuildImageObjectURL }) => {
  return {
    extensions: [
      {
        name: SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY,
        level: 'inline',
        start(src) {
          return src.match(/!\[/)?.index;
        },
        tokenizer(src) {
          const match = src.match(IMAGE_DISPLAY_REGEXP);

          if (match) {
            const alt = match[1];
            const display = match[2];
            const imageId = match[3];

            try {
              const imageFile = imageFiles[imageId];
              const src = shouldBuildImageObjectURL
                ? blobUrlManager(imageId, imageFile)
                : imageFile;

              return {
                type: SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY,
                raw: match[0],
                alt,
                display,
                imageId,
                meta: {
                  alt,
                  display,
                  imageId,
                  src,
                },
              };
            } catch (error) {
              console.error('Error processing image display:', error);

              return {
                type: SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY,
                raw: match[0],
                alt,
                display,
                imageId,
                meta: {
                  alt,
                  display,
                  imageId,
                  src: imageId,
                },
              };
            }
          }
        },
        renderer({ meta, tokens = [] }) {
          const children = this.parser.parse(tokens);

          return buildHTMLMarkup(
            SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY,
            meta,
            children
          );
        },
      },
    ],
  };
};

export default markedImageDisplay;
