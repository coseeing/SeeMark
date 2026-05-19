import markdownProcessor from '../markdown-processor/markdown-processor';
import convertMarkup from '../markup-converters/html/converter';

import { createMarkdownParserOptions } from './options';

const renderToHtml = (
  markdownContent,
  { options, components, sanitize } = {}
) => {
  const parsedOptions = createMarkdownParserOptions(options);
  const seemarkMarkup = markdownProcessor(markdownContent, parsedOptions);
  return convertMarkup(seemarkMarkup, components, { sanitize });
};

export default renderToHtml;
