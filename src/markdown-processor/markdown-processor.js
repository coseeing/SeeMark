import markedProcessorFactory from './marked-wrapper/marked-wrapper';

import math from './marked-extentions/math';
import nemeth from './marked-extentions/nemeth';
import alert from './marked-extentions/alert';
import heading from './marked-extentions/heading';
import internalLink from './marked-extentions/internal-link';
import image from './marked-extentions/image';
import internalLinkTitle from './marked-extentions/internal-link-title';
import externalLinkTab from './marked-extentions/external-link-tab';
import externalLinkTitle from './marked-extentions/external-link-title';
import externalLinkTabTitle from './marked-extentions/external-link-tab-title';
import imageLink from './marked-extentions/image-link';
import imageDisplay from './marked-extentions/image-display';
import imageDisplayLink from './marked-extentions/image-display-link';
import iframe from './marked-extentions/iframe';

export const createMarkdownProcessor = (options = {}) => {
  const asciimathDelimiter = options.asciimathDelimiter || 'graveaccent';
  const nemethDelimiter = options.nemethDelimiter || 'at';

  const enableLatex = options.enableLatex !== false;
  const enableAsciimath = options.enableAsciimath !== false;
  const enableNemeth = options.enableNemeth !== false;

  return markedProcessorFactory({
    latexDelimiter: options.latexDelimiter,
    asciimathDelimiter,
    nemethDelimiter,
    documentFormat: options.documentFormat,
    imageFiles: options.imageFiles,
    shouldBuildImageObjectURL: options.shouldBuildImageObjectURL,
    enableLatex,
    enableAsciimath,
    extensions: [
      ...(enableLatex || enableAsciimath ? [math] : []),
      ...(enableNemeth ? [nemeth] : []),
      alert,
      heading,
      internalLink,
      internalLinkTitle,
      image,
      externalLinkTab,
      externalLinkTitle,
      externalLinkTabTitle,
      imageLink,
      // imageDisplay & imageDisplayLink have similar syntax, so order matters
      // imageDisplayLink must come after imageDisplay to avoid conflicts
      // marked processes content in the reverse order of extensions:
      // https://github.com/markedjs/marked/blob/v15.0.11/src/Instance.ts#L113
      // this should be used as last resort, prefer avoid conflicting syntaxes if possible.
      imageDisplay,
      imageDisplayLink,
      iframe,
    ],
  });
};

const markdownProcessor = (markdownContent = '', options = {}) =>
  createMarkdownProcessor(options).parse(markdownContent);

export default markdownProcessor;
