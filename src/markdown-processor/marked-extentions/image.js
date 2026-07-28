import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';
import { createRenderer } from './helpers';
import { resolveImageSource } from './image-source';

const markedImage = ({ imageFiles, shouldBuildImageObjectURL }) => {
  const renderer = {
    image: createRenderer(SUPPORTED_COMPONENT_TYPES.IMAGE, {
      extractMeta(token) {
        const alt = token.text;
        const imageId = token.href;
        const source = resolveImageSource(imageId, {
          imageFiles,
          shouldBuildImageObjectURL,
        });

        return { alt, imageId, source };
      },
      parseChildren: false,
      onError(error, token) {
        console.error('Error processing image:', error);
        return {
          alt: token.text,
          imageId: token.href,
          source: token.href,
        };
      },
    }),
  };
  return { renderer };
};

export default markedImage;
