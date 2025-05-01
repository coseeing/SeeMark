import textMathToLatexObjectFactory from './text-math-to-latex-object-process';
import asciimath2mmlFactory from './ascii-math-to-mml';
import latex2mmlFactory from './tex-to-mml';

import mml2svg from './mml-to-svg';

const textProcessorFactory =
  ({ latexDelimiter, htmlMathDisplay, asciimathDelimiter }) =>
  (rawTxt) => {
    const textMathParser = textMathToLatexObjectFactory({
      latexDelimiter: latexDelimiter,
      asciimathDelimiter: asciimathDelimiter,
    });

    return rawTxt.split('\n').map((line) => {
      return textMathParser(line).reduce((a, b) => {
        let result;
        if (b.type === 'latex-content') {
          result = `<div class="sr-only">${latex2mmlFactory({
            htmlMathDisplay,
          })(b.data)}</div><div aria-hidden="true">${mml2svg(
            latex2mmlFactory({
              htmlMathDisplay,
            })(b.data)
          )}</div>`;
        } else if (b.type === 'asciimath-content') {
          result = `<div class="sr-only">${asciimath2mmlFactory({
            display: htmlMathDisplay,
          })(b.data)}</div><div aria-hidden="true">${mml2svg(
            asciimath2mmlFactory({
              htmlMathDisplay,
            })(b.data)
          )}</div>`;
        } else {
          result = `${b.data}`;
        }
        return a + result;
      }, '');
    });
  };

export default textProcessorFactory;
