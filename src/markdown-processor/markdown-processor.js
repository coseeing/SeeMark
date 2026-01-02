import markedProcessorFactory from './marked-wrapper/marked-wrapper';

import math from './marked-extentions/math';
import alert from './marked-extentions/alert';
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

const markdownProcessor = (markdownContent = '', options = {}) => {
  const asciimathDelimiter = 'graveaccent';

  const markdownProcessor = markedProcessorFactory({
    latexDelimiter: options.latexDelimiter,
    asciimathDelimiter,
    documentFormat: options.documentFormat,
    imageFiles: options.imageFiles,
    shouldBuildImageObjectURL: options.shouldBuildImageObjectURL,
    extensions: [
      math,
      alert,
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

  return markdownProcessor(markdownContent);
};

export default markdownProcessor;
