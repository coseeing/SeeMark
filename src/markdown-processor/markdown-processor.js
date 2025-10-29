import markedProcessorFactory from './marked-wrapper/marked-wrapper';

import alert from './marked-extentions/alert';
import internalLink from './marked-extentions/internal-link';
import image from './marked-extentions/image';
import imageLink from './marked-extentions/image-link';
import imageDisplay from './marked-extentions/image-display';

const markdownProcessor = (markdownContent = '', options = {}) => {
  const asciimathDelimiter = 'graveaccent';

  const markdownProcessor = markedProcessorFactory({
    latexDelimiter: options.latexDelimiter,
    asciimathDelimiter,
    documentFormat: options.documentFormat,
    imageFiles: options.imageFiles,
    shouldBuildImageObjectURL: options.shouldBuildImageObjectURL,
    extensions: [alert, internalLink, image, imageLink, imageDisplay],
  });

  return markdownProcessor(markdownContent);
};

export default markdownProcessor;
