import latex2mmlFactory from '../marked-wrapper/tex-to-mml';
import asciimath2mmlFactory from '../marked-wrapper/ascii-math-to-mml';
import mml2svg from '../marked-wrapper/mml-to-svg';

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

/**
 * Marked extension for math expressions (LaTeX and AsciiMath).
 *
 * This extension handles inline math rendering with support for multiple
 * delimiter styles (bracket, dollar, latex for LaTeX; graveaccent for AsciiMath).
 *
 * The tokenizer includes preceding text in token.raw but stores the pure math
 * expression in token.mathraw, which is used by the position tracker for
 * accurate position tracking.
 *
 * @param {Object} options - Configuration options
 * @param {string} options.latexDelimiter - LaTeX delimiter style ('bracket', 'dollar', 'latex')
 * @param {string} options.asciimathDelimiter - AsciiMath delimiter style ('graveaccent', 'asciimath')
 * @param {string} options.documentFormat - Document format for MathML display ('inline' or 'block')
 * @returns {Object} Marked extension object with math tokenizer and renderer
 */
const markedMath = ({ latexDelimiter, asciimathDelimiter, documentFormat }) => {
  const asciimath2mml = asciimath2mmlFactory({
    htmlMathDisplay: documentFormat,
  });
  const latex2mml = latex2mmlFactory({ htmlMathDisplay: documentFormat });

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

  return {
    extensions: [
      {
        name: 'math',
        level: 'inline',
        start(src) {
          const result = src.match(reTexMath_start);
          return result ? result.index : 0;
        },
        tokenizer(src) {
          const match = reTexMath.exec(src);
          if (match) {
            const math = match[3] || match[4];
            const AsciiMath_delimiter_raw_start =
              AsciiMath_delimiter.start.replace(/\\\\\\/g, '\\');
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
              mathraw: match[2], // Important: used by position tracker!
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
      },
    ],
  };
};

export default markedMath;
