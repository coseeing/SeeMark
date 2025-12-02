import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';
import { createRenderer } from './helpers';

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
    image: createRenderer(SUPPORTED_COMPONENT_TYPES.IMAGE, {
      extractMeta(token) {
        const alt = token.text;
        const imageId = token.href;
        const imageFile = imageFiles[imageId];

        const src = shouldBuildImageObjectURL
          ? blobUrlManager(imageId, imageFile)
          : imageFile;

        return { alt, imageId, src };
      },
      parseChildren: false,
      onError(error, token) {
        console.error('Error processing image:', error);
        return {
          alt: token.text,
          imageId: token.href,
          src: token.href,
        };
      },
    }),
  };
  return { renderer };
};

export default markedImage;
