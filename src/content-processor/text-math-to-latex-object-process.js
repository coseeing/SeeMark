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

// Backtick code spans are shielded from delimiter conversion: a `$x$` inside
// a code span must stay literal, not get rewritten as LaTeX.
const codeSpan_delimiter = {
  start: '`',
  end: '`',
};

const textMathToLatexObjectFactory =
  ({ latexDelimiter }) =>
  (input) => {
    const LaTeX_delimiter = LaTeX_delimiter_dict[latexDelimiter];

    const latex_restring = `(?<=[^\\\\]?)${LaTeX_delimiter.start}(.*?[^\\\\])?${LaTeX_delimiter.end}`;
    const codespan_restring = `(?<=[^\\\\]?)${codeSpan_delimiter.start}(.*?[^\\\\])?${codeSpan_delimiter.end}`;
    const reTexMath = new RegExp(`${latex_restring}|${codespan_restring}`, 'g');

    const datas = [];
    let m = null;
    let start = 0;
    let end = input.length;
    let nextStart = 0;
    do {
      m = reTexMath.exec(input);
      if (m) {
        start = nextStart;
        end = m.index;
        if (start !== end) {
          datas.push({
            type: 'text-content',
            data: input.slice(start, end),
          });
        }
        let data, type;
        if (m[0].startsWith(codeSpan_delimiter.start)) {
          type = 'codespan-content';
          data = m[2];
        } else {
          type = 'latex-content';
          data = m[1];
        }

        datas.push({
          type,
          data,
        });
        nextStart = m.index + m[0].length;
      } else {
        start = nextStart;
        end = input.length;
        if (start !== end) {
          datas.push({
            type: 'text-content',
            data: input.slice(start, end),
          });
        }
      }
    } while (m);
    return datas;
  };

export default textMathToLatexObjectFactory;
