import { Marked } from 'marked';

import latex2mmlFactory from './tex-to-mml';
import asciimath2mmlFactory from './ascii-math-to-mml';
import mml2svg from './mml-to-svg';
import markedAlert from './extensions/alert';
import markedInternalLink from './extensions/internalLink';

const LaTeX_delimiter_dict = {
  latex: {
    start: '\\\\\\l',
    end: '\\\\\\l',
    type: 'latex',
  },
  bracket: {
    start: '\\\\\\(',
    end: '\\\\\\)',
    type: 'latex',
  },
  dollar: {
    start: '\\$',
    end: '\\$',
    type: 'latex',
  },
};

const AsciiMath_delimiter_dict = {
  asciimath: {
    start: '\\\\\\a',
    end: '\\\\\\a',
    type: 'asciimath',
  },
  graveaccent: {
    start: '`',
    end: '`',
    type: 'asciimath',
  },
};

const createBlobUrlManager = () => {
  const cache = new Map();

  return (href, imageFile) => {
    if (cache.has(href)) {
      return cache.get(href);
    }
    const blobUrl = URL.createObjectURL(imageFile);
    cache.set(href, blobUrl);
    return blobUrl;
  };
};

const markedProcessorFactory = ({
  latexDelimiter,
  asciimathDelimiter,
  htmlMathDisplay,
  imageFiles,
}) => {
  const asciimath2mml = asciimath2mmlFactory({ htmlMathDisplay });
  const latex2mml = latex2mmlFactory({ htmlMathDisplay });

  const LaTeX_delimiter = LaTeX_delimiter_dict[latexDelimiter];
  const AsciiMath_delimiter = AsciiMath_delimiter_dict[asciimathDelimiter];

  const latex_restring = `(?<=[^\\\\]?)${LaTeX_delimiter.start}(.*?[^\\\\])?${LaTeX_delimiter.end}`;
  const asciimath_restring = `(?<=[^\\\\]?)${AsciiMath_delimiter.start}(.*?[^\\\\])?${AsciiMath_delimiter.end}`;
  const reTexMath = new RegExp(
    `(.*?)(${latex_restring}|${asciimath_restring})`,
    's'
  );

  const latex_start_restring = `(?<=[^\\\\]?)${LaTeX_delimiter.start}`;
  const asciimath_start_restring = `(?<=[^\\\\]?)${AsciiMath_delimiter.start}`;
  const reTexMath_start = new RegExp(
    `${latex_start_restring}|${asciimath_start_restring}`
  );

  const math = {
    name: 'math',
    level: 'inline', // Is this a block-level or inline-level tokenizer?
    start(src) {
      const result = src.match(reTexMath_start);
      return result ? result.index : 0;
    }, // Hint to Marked.js to stop and check for a match
    tokenizer(src) {
      const match = reTexMath.exec(src);
      if (match) {
        const math = match[3] || match[4];
        const AsciiMath_delimiter_raw_start = AsciiMath_delimiter.start.replace(
          /\\\\\\/g,
          '\\'
        );
        let typed;
        if (match[2].startsWith(AsciiMath_delimiter_raw_start)) {
          typed = 'asciimath';
        } else {
          typed = 'latex';
        }
        return {
          type: 'math',
          typed,
          raw: match[0],
          text: match[1] || '',
          tokens: this.lexer.inlineTokens(match[1]),
          math: math ? math.trim() : '',
          mathraw: match[2],
        };
      }
    },
    renderer(token) {
      let mathMl;
      if (token.typed === 'asciimath') {
        mathMl = asciimath2mml(token.math);
      } else {
        mathMl = latex2mml(token.math);
      }
      return `${this.parser.parseInline(
        token.tokens
      )}<span class="sr-only">${mathMl}</span><span aria-hidden="true">${mml2svg(
        mathMl
      )}</span>`;
    },
  };

  const blobUrlManager = createBlobUrlManager();

  const renderer = {
    text(token) {
      if (token.tokens?.length > 0) {
        return this.parser.parseInline(token.tokens);
      }
      return token.text.replace(/\n/g, '<br />');
    },

    // Use Marked's built-in image renderer
    image(token) {
      try {
        if (!imageFiles) {
          // For HTML render
          const imageId = token.href.split('/').pop();
          const imageExt = window.contentConfig.images[imageId];
          return `<img src="./images/${imageExt}" alt="${token.text}" data-id="${imageId}">`;
        }
        // For editor preview
        const imageFile = imageFiles[token.href];
        const blobUrl = blobUrlManager(token.href, imageFile);
        return `<img src="${blobUrl}" alt="${token.text}" data-id="${token.href}">`;
      } catch (error) {
        console.error('Error processing image:', error);
        return `<img src="${token.href}" alt="${token.text}" data-id="${token.href}">`;
      }
    },
  };

  const marked = new Marked();

  marked.use({
    extensions: [math],
    renderer,
  });

  marked.use(markedAlert());

  marked.use(markedInternalLink());

  return (raw) => marked.parse(raw);
};

export default markedProcessorFactory;
