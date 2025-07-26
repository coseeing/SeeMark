import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import createMarkdownToReactParser from './create-markdown-to-react-parser';

describe('createMarkdownToReactParser', () => {
  it('should parse markdown content to React components', () => {
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };
    const components = {};

    const parseMarkdown = createMarkdownToReactParser({ options, components });

    const markdownContent = '# Hello World\nThis is a test.';
    const reactComponents = parseMarkdown(markdownContent);

    render(reactComponents);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Hello World' })
    ).toBeInTheDocument();
  });

  it('should parse alert to default component', () => {
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };
    const components = {};

    const parseMarkdown = createMarkdownToReactParser({ options, components });

    const markdownContent = `> [!WARNING]\n> Critical content demanding immediate user attention due to potential risks.`;
    const reactComponents = parseMarkdown(markdownContent);

    console.log('reactComponents', reactComponents);

    render(reactComponents);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Hello World' })
    ).toBeInTheDocument();
  });
});
