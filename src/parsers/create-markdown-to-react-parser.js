import markdownProcessor from '../markdown-processor/markdown-processor';
import convertMarkup from '../see-mark-markup-converters/react/converter';

import { createMarkdownParserOptions } from './options';

const createMarkdownToReactParser = ({
  options = {
    latexDelimiter: null,
    htmlMathDisplay: null,
    imageFiles: null,
  },
  components,
}) => {
  const parsedOptions = createMarkdownParserOptions(options);
  const parseMarkdown = (markdownContent) => {
    // TODO: validate and clean markdownContent
    const seemarkMarkup = markdownProcessor(markdownContent, parsedOptions);

    const reactNodes = convertMarkup(seemarkMarkup, components, parsedOptions);

    return reactNodes;
  };

  return parseMarkdown;
};

export default createMarkdownToReactParser;
