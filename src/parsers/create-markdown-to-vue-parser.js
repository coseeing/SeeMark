import markdownProcessor from '../markdown-processor/markdown-processor';
import convertMarkup from '../markup-converters/vue/converter';

import { createMarkdownParserOptions } from './options';

// Factory, mirroring createMarkdownToReactParser: fix the configuration once,
// render many times. Returns an array of VNodes — call it inside a render
// function (VNodes must be freshly created on every render).
const createMarkdownToVueParser = ({ options, components } = {}) => {
  const parsedOptions = createMarkdownParserOptions(options);

  const parseMarkdown = (markdownContent) => {
    const seemarkMarkup = markdownProcessor(markdownContent, parsedOptions);
    return convertMarkup(seemarkMarkup, components);
  };

  return parseMarkdown;
};

export default createMarkdownToVueParser;
