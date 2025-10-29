import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';

import { buildHTMLMarkup } from './helpers';

const IMAGE_DISPLAY_LINK_REGEXP =
  /^!\[([^\]]*)\]\[\[([^\]]+)\]\]\(([^)]+)\)\(\(([^)]+)\)\)/;

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

const markedImageDisplayLink = ({ imageFiles, shouldBuildImageObjectURL }) => {
  return {
    extensions: [
      {
        name: SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY_LINK,
        level: 'inline',
        start(src) {
          return src.match(/!\[/)?.index;
        },
        tokenizer(src) {
          const match = src.match(IMAGE_DISPLAY_LINK_REGEXP);

          if (match) {
            const alt = match[1];
            const display = match[2];
            const imageId = match[3];
            const target = match[4];

            try {
              const imageFile = imageFiles[imageId];
              const src = shouldBuildImageObjectURL
                ? blobUrlManager(imageId, imageFile)
                : imageFile;

              return {
                type: SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY_LINK,
                raw: match[0],
                alt,
                display,
                imageId,
                target,
                meta: {
                  alt,
                  display,
                  imageId,
                  src,
                  target,
                },
              };
            } catch (error) {
              console.error('Error processing image display link:', error);

              return {
                type: SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY_LINK,
                raw: match[0],
                alt,
                display,
                imageId,
                target,
                meta: {
                  alt,
                  display,
                  imageId,
                  src: imageId,
                  target,
                },
              };
            }
          }
        },
        renderer({ meta, tokens = [] }) {
          const children = this.parser.parse(tokens);

          return buildHTMLMarkup(
            SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY_LINK,
            meta,
            children
          );
        },
      },
    ],
  };
};

export default markedImageDisplayLink;
