import createTableOfContents from './create-table-of-contents';

describe('createTableOfContents', () => {
  it('should return an empty array for markdown with no headings', () => {
    expect(createTableOfContents('Just some paragraph text.')).toEqual([]);
    expect(createTableOfContents('')).toEqual([]);
  });

  it('should capture all heading levels h1–h6', () => {
    const markdown = [1, 2, 3, 4, 5, 6]
      .map((n) => `${'#'.repeat(n)} Heading ${n}`)
      .join('\n\n');

    const result = createTableOfContents(markdown);

    expect(result).toHaveLength(6);
    result.forEach((item, i) => {
      expect(item.level).toBe(i + 1);
      expect(item.id).toBe(`heading-${i + 1}`);
      expect(item.text).toBe(`Heading ${i + 1}`);
    });
  });

  it('should return correct shape { level, id, text }', () => {
    const result = createTableOfContents('## Hello World');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      level: 2,
      id: 'hello-world',
      text: 'Hello World',
    });
  });

  it('should generate slug IDs matching the heading renderer extension', () => {
    const result = createTableOfContents('## What is JavaScript?');

    expect(result[0].id).toBe('what-is-javascript');
    expect(result[0].text).toBe('What is JavaScript?');
  });

  it('should preserve Chinese characters in both text and id', () => {
    const result = createTableOfContents('# 什麼是 React');

    expect(result[0].text).toBe('什麼是 React');
    expect(result[0].id).toBe('什麼是-react');
  });

  it('should handle headings with only Chinese characters', () => {
    const result = createTableOfContents('## 前端開發入門');

    expect(result[0].text).toBe('前端開發入門');
    expect(result[0].id).toBe('前端開發入門');
  });

  it('should append -1, -2 suffixes for duplicate heading text', () => {
    const markdown = '# Introduction\n\n## Introduction\n\n### Introduction';
    const result = createTableOfContents(markdown);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('introduction');
    expect(result[1].id).toBe('introduction-1');
    expect(result[2].id).toBe('introduction-2');
  });

  it('should strip bold markdown from text field', () => {
    const result = createTableOfContents('## Hello **World**');

    expect(result[0].text).toBe('Hello World');
    expect(result[0].id).toBe('hello-world');
  });

  it('should strip italic markdown from text field', () => {
    const result = createTableOfContents('## Hello *World*');

    expect(result[0].text).toBe('Hello World');
    expect(result[0].id).toBe('hello-world');
  });

  it('should strip code span markdown from text field', () => {
    const result = createTableOfContents('## Use `npm install`', {
      asciimathDelimiter: 'asciimath', // backtick code spans conflict with the graveaccent AsciiMath delimiter
    });

    expect(result[0].text).toBe('Use npm install');
    expect(result[0].id).toBe('use-npm-install');
  });

  it('should use link display text and strip URL from text field', () => {
    const result = createTableOfContents(
      '## See [the docs](https://example.com)'
    );

    expect(result[0].text).toBe('See the docs');
    expect(result[0].id).toBe('see-the-docshttpsexamplecom');
  });

  it('should handle mixed heading levels in order', () => {
    const markdown = '## First\n\n### Nested\n\n## Second\n\n### Nested Again';
    const result = createTableOfContents(markdown);

    expect(result).toEqual([
      { level: 2, id: 'first', text: 'First' },
      { level: 3, id: 'nested', text: 'Nested' },
      { level: 2, id: 'second', text: 'Second' },
      { level: 3, id: 'nested-again', text: 'Nested Again' },
    ]);
  });

  it('should ignore non-heading tokens', () => {
    const markdown =
      '## Heading\n\nA paragraph.\n\n- list item\n\n> blockquote\n\n### Another';
    const result = createTableOfContents(markdown);

    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Heading');
    expect(result[1].text).toBe('Another');
  });

  // These tests document the desired behavior for seemark's custom inline syntax
  // inside headings. They fail until createTableOfContents is updated to:
  //   1. Run the lexer with seemark's custom extensions registered, and
  //   2. Teach extractPlainText to read token.display for custom link tokens.
  describe('seemark custom syntax in headings', () => {
    it('should extract display text from an externalLinkTab token', () => {
      // @[display](url) — opens in a new tab; without the extension the @
      // is treated as literal text and [display](url) falls back to a native
      // link, producing "@Read More" instead of "Read More".
      const result = createTableOfContents(
        '## @[Read More](https://example.com)'
      );

      expect(result[0].text).toBe('Read More');
      // id is slugified from the raw heading text regardless of extension,
      // so it matches what the heading renderer produces.
      expect(result[0].id).toBe('read-morehttpsexamplecom');
    });

    it('should extract display text when externalLinkTab is mixed with plain text', () => {
      const result = createTableOfContents(
        '## See @[our docs](https://example.com) for details'
      );

      expect(result[0].text).toBe('See our docs for details');
      expect(result[0].id).toBe('see-our-docshttpsexamplecom-for-details');
    });

    it('should extract display text from an internalLink token', () => {
      // [display]<target> — seemark internal link syntax; without the
      // extension the brackets are treated as text and the angle-bracket
      // portion may be mis-parsed as an HTML tag.
      const result = createTableOfContents('## [Home Page]<home>');

      expect(result[0].text).toBe('Home Page');
      expect(result[0].id).toBe('home-pagehome');
    });
  });
});
