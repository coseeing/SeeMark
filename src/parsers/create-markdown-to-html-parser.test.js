import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

import renderToHtml from './create-markdown-to-html-parser';
import {
  escapeHtml,
  escapeAttr,
  safeUrl,
} from '../markup-converters/html/escape';

const mount = (html) => {
  const container = document.createElement('div');
  container.append(...parseFragment(html));
  document.body.appendChild(container);
  return container;
};

// Use DOMParser to avoid the "raw innerHTML assignment" pattern in tests.
const parseFragment = (html) => {
  const doc = new DOMParser().parseFromString(
    `<!DOCTYPE html><body>${html}</body>`,
    'text/html'
  );
  return Array.from(doc.body.childNodes);
};

describe('renderToHtml', () => {
  afterEach(() => {
    document.body.textContent = '';
  });

  it('parses heading markdown', () => {
    const html = renderToHtml('# Hello World', {
      options: {
        latexDelimiter: 'bracket',
        documentFormat: 'inline',
        imageFiles: {},
      },
    });
    const container = mount(html);
    const h = container.querySelector('h1');
    expect(h).toBeInTheDocument();
    expect(h.textContent).toBe('Hello World');
  });

  it('works with null-ish options', () => {
    const html = renderToHtml('# Hello World');
    const container = mount(html);
    expect(container.querySelector('h1').textContent).toBe('Hello World');
  });

  it('renders alert with role=region and aria-label', () => {
    const html = renderToHtml('> [!WARNING]\n> Watch out.', {
      options: {
        latexDelimiter: 'bracket',
        documentFormat: 'inline',
        imageFiles: {},
      },
    });
    const container = mount(html);
    const region = container.querySelector('[role="region"]');
    expect(region).toBeInTheDocument();
    expect(region.getAttribute('aria-label')).toBe('Warning');
    expect(region.textContent).toContain('WARNING');
    expect(region.textContent).toContain('Watch out.');
  });

  it('renders internal link', () => {
    const html = renderToHtml('See [section]<sec-1>', {
      options: {
        latexDelimiter: 'bracket',
        documentFormat: 'inline',
        imageFiles: {},
      },
    });
    const container = mount(html);
    const a = container.querySelector('a[href="#sec-1"]');
    expect(a).toBeInTheDocument();
    expect(a.id).toBe('sec-1-source');
    expect(a.textContent).toBe('section');
  });

  it('renders math (mathMl + svg) as multi-sibling span replacement', () => {
    const html = renderToHtml('\\(a+b=c\\)', {
      options: {
        latexDelimiter: 'bracket',
        documentFormat: 'inline',
        imageFiles: {},
      },
    });
    const container = mount(html);
    const srOnly = container.querySelector('.sr-only');
    const ariaHidden = container.querySelector('[aria-hidden="true"]');
    expect(srOnly).toBeInTheDocument();
    expect(ariaHidden).toBeInTheDocument();
    expect(srOnly.textContent).toContain('a');
    expect(ariaHidden.querySelector('svg')).toBeInTheDocument();
  });

  it('renders image with provided imageFiles URL', () => {
    const html = renderToHtml('![pikachu](pikachu-path)', {
      options: {
        latexDelimiter: 'bracket',
        documentFormat: 'inline',
        imageFiles: { 'pikachu-path': 'path/to/pikachu.png' },
      },
    });
    const container = mount(html);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('alt')).toBe('pikachu');
    expect(img.getAttribute('src')).toBe('path/to/pikachu.png');
  });

  it('uses blob URL when shouldBuildImageObjectURL=true', () => {
    window.URL.createObjectURL = jest.fn(() => 'mocked-blob-url');
    const html = renderToHtml('![p](pp)', {
      options: {
        imageFiles: { pp: 'fake-file-content' },
        shouldBuildImageObjectURL: true,
      },
    });
    const container = mount(html);
    expect(container.querySelector('img').getAttribute('src')).toBe(
      'mocked-blob-url'
    );
    window.URL.createObjectURL.mockReset();
  });

  it('allows overriding default components', () => {
    const html = renderToHtml('# Hi', {
      components: {
        heading: (props, children) =>
          `<section data-custom="1">${children}</section>`,
      },
    });
    const container = mount(html);
    expect(
      container.querySelector('section[data-custom="1"]')
    ).toBeInTheDocument();
    expect(container.querySelector('h1')).toBeNull();
  });

  it('runs the sanitize hook over the final HTML', () => {
    const sanitize = jest.fn((s) => `<!--sanitized-->${s}`);
    const html = renderToHtml('# Hi', { sanitize });
    expect(sanitize).toHaveBeenCalled();
    expect(html.startsWith('<!--sanitized-->')).toBe(true);
  });

  describe('escape utilities', () => {
    it('escapeHtml encodes &, <, >, quotes', () => {
      expect(escapeHtml('<script>alert(1)</script>')).toBe(
        '&lt;script&gt;alert(1)&lt;/script&gt;'
      );
      expect(escapeHtml('a & b')).toBe('a &amp; b');
      expect(escapeHtml(`"x'y"`)).toBe('&quot;x&#39;y&quot;');
    });

    it('safeUrl whitelists http/https/mailto/tel/relative; rejects javascript:', () => {
      expect(safeUrl('javascript:alert(1)')).toBe('#');
      expect(safeUrl('vbscript:foo')).toBe('#');
      expect(safeUrl('data:text/html,<x>')).toBe('#');
      expect(safeUrl('https://example.com')).toBe('https://example.com');
      expect(safeUrl('http://example.com')).toBe('http://example.com');
      expect(safeUrl('/relative/path')).toBe('/relative/path');
      expect(safeUrl('mailto:x@y.com')).toBe('mailto:x@y.com');
      expect(safeUrl('tel:+1234')).toBe('tel:+1234');
      expect(safeUrl('#anchor')).toBe('#anchor');
    });

    it('escapeAttr encodes single quote (the Stage 1 attribute-escape concern)', () => {
      expect(escapeAttr("I'm sure")).toBe('I&#39;m sure');
    });
  });

  describe('XSS protection', () => {
    it('rejects javascript: URLs in image source via default Image', () => {
      const html = renderToHtml('![bad](evil)', {
        options: { imageFiles: { evil: 'javascript:alert(1)' } },
      });
      const container = mount(html);
      expect(container.querySelector('img').getAttribute('src')).toBe('#');
    });

    it('passes through math mathMl/svg without escaping (trusted MathJax output)', () => {
      const html = renderToHtml('\\(x\\)', {
        options: {
          latexDelimiter: 'bracket',
          documentFormat: 'inline',
          imageFiles: {},
        },
      });
      expect(html).toMatch(/<math[\s\S]*<\/math>/);
      expect(html).toMatch(/<svg[\s\S]*<\/svg>/);
    });

    it('strips on* event-handler attributes from raw passthrough HTML', () => {
      // <img onerror> inserted via innerHTML would FIRE — must be stripped.
      const html = renderToHtml('<img src=x onerror=alert(2)>');
      expect(html).not.toMatch(/onerror/i);
      expect(html).toContain('<img');
    });

    it('runs safeUrl over href/src on raw passthrough HTML', () => {
      const html = renderToHtml('<a href="javascript:alert(1)">x</a>');
      expect(html).not.toContain('javascript:');
      expect(html).toContain('href="#"');
    });

    it('drops raw <script> and <style> passthrough tags entirely', () => {
      const html = renderToHtml(
        'a <script>alert(1)</script> b <style>*{}</style> c'
      );
      expect(html).not.toContain('<script');
      expect(html).not.toContain('<style');
      // surrounding text preserved
      expect(html).toContain('a ');
      expect(html).toContain(' c');
    });

    it('preserves safe raw inline HTML (strong, br)', () => {
      const html = renderToHtml('正常 <strong>粗體</strong> 與 <br> 換行');
      expect(html).toContain('<strong>粗體</strong>');
      expect(html).toMatch(/<br\s*\/?>/);
    });
  });

  describe('Stage 1 attribute escape robustness', () => {
    it('handles single-quote in content without breaking the Stage 1 attribute', () => {
      // Before the helpers.js escape fix, the single quote in alert content
      // would terminate the payload attribute prematurely, causing the
      // alert region to lose its content (or the parse to fail entirely).
      const html = renderToHtml(`> [!NOTE]\n> I'm sure this works.`);
      const container = mount(html);
      const region = container.querySelector('[role="region"]');
      expect(region).toBeInTheDocument();
      expect(region.textContent).toContain("I'm sure this works.");
    });
  });
});
