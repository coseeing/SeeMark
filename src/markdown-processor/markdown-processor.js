import markedProcessorFactory from './marked-wrapper/marked-wrapper';

import alert from './marked-extentions/alert';
import internalLink from './marked-extentions/internal-link';

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
