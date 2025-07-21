import markedProcessorFactory from '../content-processor/markdown-process';

import alert from './marked-extentions/alert';
import internalLink from './marked-extentions/internalLink';

const markdownProcessor = (markdownContent = '', options = {}) => {
  const asciimathDelimiter = 'graveaccent';

  const markdownProcessor = markedProcessorFactory({
    latexDelimiter: options.latexDelimiter,
    asciimathDelimiter,
    documentFormat: options.documentFormat,
    imageFiles: options.imageFiles,
    extensions: [alert, internalLink],
  });

  return markdownProcessor(markdownContent);
};

export default markdownProcessor;
