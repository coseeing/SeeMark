import markdownProcessor from '../markdown-processor/markdown-processor';
import convertMarkup from '../markup-converters/html/converter';

import { createMarkdownParserOptions } from './options';

// Factory, mirroring createMarkdownToReactParser: fix the configuration once,
// render many times.
const createMarkdownToHtmlParser = ({ options, components, sanitize } = {}) => {
  const parsedOptions = createMarkdownParserOptions(options);

  const parseMarkdown = (markdownContent) => {
    const seemarkMarkup = markdownProcessor(markdownContent, parsedOptions);
    return convertMarkup(seemarkMarkup, components, { sanitize });
  };

  return parseMarkdown;
};

// One-shot convenience for the common "render a document once" case
// (e.g. the exported-website template).
export const renderToHtml = (markdownContent, config = {}) =>
  createMarkdownToHtmlParser(config)(markdownContent);

export default createMarkdownToHtmlParser;
