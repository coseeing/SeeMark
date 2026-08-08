import markdownProcessor from '../markdown-processor/markdown-processor';
import convertMarkup from '../markup-converters/vue/converter';

import { createMarkdownParserOptions } from './options';

// Factory, mirroring createMarkdownToReactParser: fix the configuration once,
// render many times. Returns an array of VNodes — call it inside a render
// function (VNodes must be freshly created on every render).
const createMarkdownToVueParser = ({ options, components } = {}) => {
  // AsciiMath is off by default for the Vue entry (React/HTML default it on):
  // its backtick delimiter turns ordinary inline code into math, and MathJax's
  // AsciiMath shim crashes under Vite/esbuild dep pre-bundling — the bundlers
  // most Vue apps use (see load-asciimath.cjs). Opt in with enableAsciimath:
  // true where it works.
  const parsedOptions = createMarkdownParserOptions({
    enableAsciimath: false,
    ...options,
  });

  const parseMarkdown = (markdownContent) => {
    const seemarkMarkup = markdownProcessor(markdownContent, parsedOptions);
    return convertMarkup(seemarkMarkup, components);
  };

  return parseMarkdown;
};

export default createMarkdownToVueParser;
