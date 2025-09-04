import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';

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

  it('should parse markdown content with null-lish options', () => {
    const components = {};

    const parseMarkdown = createMarkdownToReactParser({ components });

    const markdownContent = '# Hello World\nThis is a test.';
    const reactComponents = parseMarkdown(markdownContent);

    render(reactComponents);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Hello World' })
    ).toBeInTheDocument();
  });

  it('should parse markdown content with empty options', () => {
    const components = {};

    const parseMarkdown = createMarkdownToReactParser({
      optinos: {},
      components,
    });

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

    const markdownContent = `> [!WARNING]\n> This is a warning message.`;
    const reactComponents = parseMarkdown(markdownContent);

    render(reactComponents);

    const alertElement = screen.getByRole('region');

    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveAttribute('aria-label', 'Warning');

    expect(screen.getByText('WARNING')).toBeInTheDocument();
    expect(screen.getByText('This is a warning message.')).toBeInTheDocument();
  });
});

describe('createMarkdownToReactParser - image', () => {
  beforeEach(() => {
    window.URL.createObjectURL = jest.fn(() => 'mocked-blob-url');
  });

  // Reset the mock after each test to ensure isolation
  afterEach(() => {
    window.URL.createObjectURL.mockReset();
  });

  it('should process image', () => {
    const markdownContent = `![pikachu](pikachu-key)`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {
        'pikachu-key': 'path/to/pikachu.png',
      },
    };

    const components = {};

    const parseMarkdown = createMarkdownToReactParser({ options, components });

    const reactComponents = parseMarkdown(markdownContent);

    render(reactComponents);

    const image = screen.getByAltText('pikachu');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'mocked-blob-url');

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(
      'path/to/pikachu.png'
    );
  });

  it('should process image without imageFiles', () => {
    const markdownContent = `![pikachu](pikachu-key)`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
    };

    const components = {};

    const parseMarkdown = createMarkdownToReactParser({ options, components });

    const reactComponents = parseMarkdown(markdownContent);

    render(reactComponents);

    const image = screen.getByAltText('pikachu');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'pikachu-key');
  });
});
