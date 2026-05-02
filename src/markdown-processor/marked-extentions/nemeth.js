import { translate as nemeth2latex } from '@coseeing/nemeth2latex';
import latex2mmlFactory from '../marked-wrapper/tex-to-mml';
import mml2svg from '../marked-wrapper/mml-to-svg';
import { createRenderer } from './helpers';
import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';

// ^@<braille U+2800-U+28FF>@ or ^\n<braille>\n (literal backslash+n)
const reNemeth = /^(?:@([\u2800-\u28FF]+)@|\\n([\u2800-\u28FF]+)\\n)/;

const markedNemeth = ({ documentFormat }) => {
  const latex2mml = latex2mmlFactory({ htmlMathDisplay: documentFormat });

  return {
    extensions: [
      {
        name: 'nemeth',
        level: 'inline',
        start(src) {
          // @ followed by braille char (disambiguates from @[ and @!)
          // or literal \n followed by braille char
          const result1 = src.match(/@(?=[\u2800-\u28FF])/);
          const result2 = src.match(/\\n(?=[\u2800-\u28FF])/);
          return Math.min(
            result1?.index ?? Infinity,
            result2?.index ?? Infinity
          );
        },
        tokenizer(src) {
          const match = src.match(reNemeth);
          if (match) {
            return {
              type: 'nemeth',
              raw: match[0],
              math: match[1] ?? match[2],
            };
          }
        },
        renderer: createRenderer(SUPPORTED_COMPONENT_TYPES.MATH, {
          extractMeta(token) {
            const latex = nemeth2latex(token.math);
            const mathMl = latex2mml(latex);
            const svg = mml2svg(mathMl);
            return { math: token.math, typed: 'nemeth', latex, mathMl, svg };
          },
          parseChildren: false,
          inline: true,
        }),
      },
    ],
  };
};

export default markedNemeth;
