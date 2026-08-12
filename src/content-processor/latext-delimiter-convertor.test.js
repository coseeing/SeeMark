import latexDelimiterConvertor from './latext-delimiter-convertor';

// Output always ends with a trailing newline (the convertor joins lines by
// appending '\n' to each), so expectations include it.
describe('latexDelimiterConvertor', () => {
  describe("mode 'b2d' (bracket → dollar)", () => {
    const convert = latexDelimiterConvertor('b2d');

    it('converts bracket-delimited math to dollar delimiters', () => {
      expect(convert('eq \\(a^2\\) done')).toBe('eq $a^2$ done\n');
    });

    it('converts every occurrence on a line', () => {
      expect(convert('\\(a\\) mid \\(b\\)')).toBe('$a$ mid $b$\n');
    });

    it('converts math on each line independently', () => {
      expect(convert('line1 \\(a\\)\nline2 \\(b\\)')).toBe(
        'line1 $a$\nline2 $b$\n'
      );
    });

    it('leaves text without math untouched', () => {
      expect(convert('plain text')).toBe('plain text\n');
    });

    it('handles an empty string', () => {
      expect(convert('')).toBe('\n');
    });
  });

  describe("mode 'd2b' (dollar → bracket)", () => {
    const convert = latexDelimiterConvertor('d2b');

    it('converts dollar-delimited math to bracket delimiters', () => {
      expect(convert('eq $a^2$ done')).toBe('eq \\(a^2\\) done\n');
    });

    it('converts every occurrence on a line', () => {
      expect(convert('$a$ mid $b$')).toBe('\\(a\\) mid \\(b\\)\n');
    });
  });

  // Backtick code spans are shielded so a delimiter inside inline code stays
  // literal — otherwise `$x$` in a code sample would be rewritten as math.
  describe('code span shielding', () => {
    it('does not convert dollar delimiters inside a code span', () => {
      const convert = latexDelimiterConvertor('d2b');
      expect(convert('x `$y$` z')).toBe('x `$y$` z\n');
    });

    it('still converts the same delimiters outside a code span', () => {
      const convert = latexDelimiterConvertor('d2b');
      expect(convert('x $y$ z')).toBe('x \\(y\\) z\n');
    });

    it('does not convert bracket delimiters inside a code span', () => {
      const convert = latexDelimiterConvertor('b2d');
      expect(convert('code `\\(a\\)` done')).toBe('code `\\(a\\)` done\n');
    });

    it('preserves a code span while converting math elsewhere on the line', () => {
      const convert = latexDelimiterConvertor('d2b');
      expect(convert('use `$literal$` and $real$ here')).toBe(
        'use `$literal$` and \\(real\\) here\n'
      );
    });
  });

  // An empty span leaves the regex's optional content group unmatched; the
  // literal string "undefined" must never reach the output.
  describe('empty delimiter pairs', () => {
    it('does not emit "undefined" for an empty code span', () => {
      expect(latexDelimiterConvertor('d2b')('a `` b')).toBe('a `` b\n');
    });

    it('does not emit "undefined" for an empty dollar pair', () => {
      expect(latexDelimiterConvertor('d2b')('a $$ b')).toBe('a \\(\\) b\n');
    });

    it('does not emit "undefined" for an empty bracket pair', () => {
      expect(latexDelimiterConvertor('b2d')('a \\(\\) b')).toBe('a $$ b\n');
    });
  });
});
