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

<<<<<<< HEAD
  marked.use({
    extensions: [math],
    breaks: true,
=======
  const renderer = {
    text(token) {
      if (token.tokens?.length > 0) {
        return this.parser.parseInline(token.tokens);
      }
      return token.text.replace(/\n/g, '<br />');
    },
  };

  const positionTracker = createPositionTracker();

  marked.use({
    renderer,
    hooks: {
      preprocess: positionTracker.preprocess,
    },
    walkTokens: positionTracker.walkTokens,
>>>>>>> 2fe2c3e (feat: integrate position tracker into Marked.js processor)
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

  return (raw) => marked.parse(raw);
};

export default markedProcessorFactory;
