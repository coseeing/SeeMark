import markdownProcessor from './';

describe('markdownProcessor', () => {
  it('should process markdown content as desired', () => {
    const markdownContent = '# Hello World\nThis is a test.';
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);

    expect(result).toBeDefined();
    expect(result).toContain('<h1>Hello World</h1>');
    expect(result).toContain('<p>This is a test.</p>');
  });
});
