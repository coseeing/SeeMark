import markdownProcessor from '../markdown-processor/markdown-processor';
import convertMarkup from '../markup-converters/react/converter';

import { createMarkdownParserOptions } from './options';

const createMarkdownToReactParser = ({ options, components }) => {
  const parsedOptions = createMarkdownParserOptions(options);
  const parseMarkdown = (markdownContent) => {
    const seemarkMarkup = markdownProcessor(markdownContent, parsedOptions);

    const reactNodes = convertMarkup(seemarkMarkup, components, parsedOptions);

    return reactNodes;
  };

  return parseMarkdown;
};

export default createMarkdownToReactParser;
