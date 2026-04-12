import { Marked } from 'marked';

import { createPositionTracker } from './position-tracker';

const markedProcessorFactory = ({
  latexDelimiter,
  asciimathDelimiter,
  documentFormat,
  imageFiles = {},
  shouldBuildImageObjectURL = false,
  extensions = [],
}) => {
  const marked = new Marked();

  const positionTracker = createPositionTracker();

  marked.use({
    breaks: true,
    hooks: {
      preprocess: positionTracker.preprocess,
    },
    walkTokens: positionTracker.walkTokens,
  });

  extensions.forEach((extension) => {
    marked.use(
      extension({
        latexDelimiter,
        asciimathDelimiter,
        documentFormat,
        imageFiles,
        shouldBuildImageObjectURL,
      })
    );
  });

  return {
    parse: (raw) => marked.parse(raw),
    lexer: (raw) => marked.lexer(raw),
  };
};

export default markedProcessorFactory;
