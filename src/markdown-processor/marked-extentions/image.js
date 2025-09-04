import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';

import { buildHTMLMarkup } from './helpers';

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

const markedImage = ({ imageFiles, shouldBuildImageObjectURL }) => {
  const renderer = {
    image(token) {
      try {
        const alt = token.text;
        const imageId = token.href;
        const imageFile = imageFiles[imageId];

        const src = shouldBuildImageObjectURL
          ? blobUrlManager(imageId, imageFile)
          : imageFile;

        const meta = { alt, imageId, src };

        return buildHTMLMarkup(SUPPORTED_COMPONENT_TYPES.IMAGE, meta);
      } catch (error) {
        console.error('Error processing image:', error);

        const alt = token.text;
        const imageId = token.href;
        const meta = { alt, imageId, src: imageId };

        return buildHTMLMarkup(SUPPORTED_COMPONENT_TYPES.IMAGE, meta);
      }
    },
  };
  return { renderer };
};

export default markedImage;
