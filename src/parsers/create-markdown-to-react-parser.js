import markdownProcessor from '../markdown-processor';
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
    // use options and components
    console.log('Options:', parsedOptions);
    console.log('Components:', components);

    // TODO: validate and clean markdownContent
    // TODO: Parse markdown to SeeMark markup
    const seemarkMarkup = markdownProcessor(markdownContent, parsedOptions);
    // TODO: Parse SeeMark markup to React Components
    const reactComponents = convertMarkup(
      seemarkMarkup,
      components,
      parsedOptions
    );

    return reactComponents;
  };

  return parseMarkdown;
};

export default createMarkdownToReactParser;
