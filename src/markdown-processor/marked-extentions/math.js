import latex2mmlFactory from '../marked-wrapper/tex-to-mml';
import mml2svg from '../marked-wrapper/mml-to-svg';
import { createRenderer } from './helpers';
import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';

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

/**
 * Marked extension for LaTeX math expressions.
 *
 * This extension handles inline math rendering with support for multiple
 * delimiter styles ('bracket', 'dollar', 'latex').
 *
 * The tokenizer includes preceding text in token.raw but stores the pure math
 * expression in token.mathraw, which is used by the position tracker for
 * accurate position tracking.
 *
 * @param {Object} options - Configuration options
 * @param {string} options.latexDelimiter - LaTeX delimiter style ('bracket', 'dollar', 'latex')
 * @param {string} options.documentFormat - Document format for MathML display ('inline' or 'block')
 * @returns {Object} Marked extension object with math tokenizer and renderer
 */
const markedMath = ({ enableLatex = true, latexDelimiter, documentFormat }) => {
  if (!enableLatex) {
    return { extensions: [] };
  }

  const latex2mml = latex2mmlFactory({ htmlMathDisplay: documentFormat });

  const LaTeX_delimiter = LaTeX_delimiter_dict[latexDelimiter];

  const latex_restring = `(?<=[^\\\\]?)${LaTeX_delimiter.start}(.*?[^\\\\])?${LaTeX_delimiter.end}`;
  const latex_start_restring = `(?<=[^\\\\]?)${LaTeX_delimiter.start}`;

  const reTexMath = new RegExp(`(.*?)(${latex_restring})`, 's');
  const reTexMath_start = new RegExp(latex_start_restring);

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
            const math = match[3];
            return {
              type: 'math',
              typed: 'latex',
              raw: match[0],
              text: match[1] || '',
              tokens: this.lexer.inlineTokens(match[1]),
              math: math ? math.trim() : '',
              mathraw: match[2], // Important: used by position tracker!
            };
          }
        },
        renderer: createRenderer(SUPPORTED_COMPONENT_TYPES.MATH, {
          extractMeta(token) {
            const mathMl = latex2mml(token.math);
            const svg = mml2svg(mathMl);
            return {
              math: token.math,
              typed: token.typed,
              mathMl,
              svg,
            };
          },
          parseChildren: false,
          prependInlineTokens: true,
          inline: true,
        }),
      },
    ],
  };
};

export default markedMath;
