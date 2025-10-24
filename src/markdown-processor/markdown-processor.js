import markedProcessorFactory from './marked-wrapper/marked-wrapper';

import alert from './marked-extentions/alert';
import internalLink from './marked-extentions/internal-link';
import image from './marked-extentions/image';
import internalLinkTitle from './marked-extentions/internal-link-title';
import youtube from './marked-extentions/youtube';
import codepen from './marked-extentions/codepen';
import github from './marked-extentions/github';

const markdownProcessor = (markdownContent = '', options = {}) => {
  const asciimathDelimiter = 'graveaccent';

  const markdownProcessor = markedProcessorFactory({
    latexDelimiter: options.latexDelimiter,
    asciimathDelimiter,
    documentFormat: options.documentFormat,
    imageFiles: options.imageFiles,
    shouldBuildImageObjectURL: options.shouldBuildImageObjectURL,
    extensions: [
      alert,
      internalLink,
      internalLinkTitle,
      image,
      youtube,
      codepen,
      github,
    ],
  });

  return markdownProcessor(markdownContent);
};

export default markdownProcessor;
