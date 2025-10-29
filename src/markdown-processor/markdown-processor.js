import markedProcessorFactory from './marked-wrapper/marked-wrapper';

import math from './marked-extentions/math';
import alert from './marked-extentions/alert';
import internalLink from './marked-extentions/internal-link';
import image from './marked-extentions/image';
import internalLinkTitle from './marked-extentions/internal-link-title';
import externalLinkTab from './marked-extentions/external-link-tab';
import externalLinkTitle from './marked-extentions/external-link-title';
import externalLinkTabTitle from './marked-extentions/external-link-tab-title';
import imageLink from './marked-extentions/image-link';

const markdownProcessor = (markdownContent = '', options = {}) => {
  const asciimathDelimiter = 'graveaccent';

  const markdownProcessor = markedProcessorFactory({
    latexDelimiter: options.latexDelimiter,
    asciimathDelimiter,
    documentFormat: options.documentFormat,
    imageFiles: options.imageFiles,
    shouldBuildImageObjectURL: options.shouldBuildImageObjectURL,
    extensions: [
      math,
      alert,
      internalLink,
      internalLinkTitle,
      image,
      externalLinkTab,
      externalLinkTitle,
      externalLinkTabTitle,
      imageLink,
    ],
  });

  return markdownProcessor(markdownContent);
};

export default markdownProcessor;
