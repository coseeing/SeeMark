import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

import createMarkdownToHtmlParser, {
  renderToHtml,
} from './create-markdown-to-html-parser';
import convertMarkup from '../markup-converters/html/converter';
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

    it('escapeAttr encodes single quote', () => {
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
      // A single quote in the content must not terminate the single-quoted
      // Stage 1 payload attribute (regression guard for the payload escaping).
      const html = renderToHtml(`> [!NOTE]\n> I'm sure this works.`);
      const container = mount(html);
      const region = container.querySelector('[role="region"]');
      expect(region).toBeInTheDocument();
      expect(region.textContent).toContain("I'm sure this works.");
    });
  });

  describe('XSS — control-character scheme bypass (safeUrl)', () => {
    it('rejects javascript: with embedded tab/newline/CR', () => {
      expect(safeUrl('java\tscript:alert(1)')).toBe('#');
      expect(safeUrl('java\nscript:alert(1)')).toBe('#');
      expect(safeUrl('java\rscript:alert(1)')).toBe('#');
      expect(safeUrl('javascript:alert(1)')).toBe('#');
    });

    it('still accepts legitimate URLs', () => {
      expect(safeUrl('https://example.com')).toBe('https://example.com');
      expect(safeUrl('/rel/path')).toBe('/rel/path');
    });
  });

  describe('XSS — dangerous passthrough tags & attributes', () => {
    it('drops user raw <iframe> (and its srcdoc) entirely', () => {
      const html = renderToHtml(
        '<iframe srcdoc="<script>alert(1)</script>"></iframe>'
      );
      expect(html).not.toMatch(/<iframe/i);
      expect(html).not.toMatch(/srcdoc/i);
    });

    it('drops object/embed/form/meta/base/link passthrough tags', () => {
      for (const tag of ['object', 'embed', 'form', 'meta', 'base', 'link']) {
        const html = renderToHtml(`<${tag}></${tag}>`);
        expect(html).not.toContain(`<${tag}`);
      }
    });

    it('strips srcdoc/formaction/http-equiv/ping/background attributes', () => {
      const html = renderToHtml(
        '<a href="/x" ping="https://evil" formaction="javascript:alert(1)">x</a>'
      );
      expect(html).not.toMatch(/ping=/i);
      expect(html).not.toMatch(/formaction=/i);
    });

    it('keeps the youtube component iframe (component output is not dropped)', () => {
      const html = renderToHtml(
        '@![Vid](https://www.youtube.com/embed/abc123)'
      );
      // DROPPED_TAGS only affects walked passthrough nodes, not component output.
      expect(html).toMatch(/<iframe/i);
      expect(html).toContain('youtube.com/embed');
    });
  });

  describe('XSS — forged data-seemark payload via raw HTML (math)', () => {
    it('neutralizes a forged math placeholder smuggled through raw HTML', () => {
      const forged =
        '<span data-seemark-element-type="math" data-seemark-payload=\'{"svg":"<img src=x onerror=alert(1)>"}\'></span>';
      const html = renderToHtml(forged);
      // Stage 1 strips the data-seemark-* attrs → no component dispatch →
      // the malicious svg never reaches the (raw-HTML-emitting) math component.
      expect(html).not.toMatch(/onerror/i);
      expect(html).not.toMatch(/<img/i);
      expect(html).not.toContain('data-seemark-element-type');
      expect(html).not.toContain('data-seemark-payload');
    });

    it('still renders a genuine math expression', () => {
      const html = renderToHtml('\\(a^2\\)', {
        options: {
          latexDelimiter: 'bracket',
          documentFormat: 'inline',
          imageFiles: {},
        },
      });
      expect(html).toMatch(/<math[\s\S]*<\/math>/);
      expect(html).toMatch(/<svg[\s\S]*<\/svg>/);
    });
  });
});

describe('createMarkdownToHtmlParser (factory)', () => {
  it('fixes the config once and renders many times, matching renderToHtml', () => {
    const config = {
      options: {
        latexDelimiter: 'bracket',
        documentFormat: 'inline',
        imageFiles: {},
      },
    };
    const parse = createMarkdownToHtmlParser(config);
    expect(parse('# One')).toBe(renderToHtml('# One', config));
    expect(parse('**two**')).toBe(renderToHtml('**two**', config));
  });

  it('works without a config, like renderToHtml', () => {
    const parse = createMarkdownToHtmlParser();
    expect(parse('# Hi')).toBe(renderToHtml('# Hi'));
  });
});

describe('Stage 1/Stage 2 contract — broken placeholders fail loudly', () => {
  it('throws a descriptive error on an unparseable payload', () => {
    // Unreachable from real markdown (Stage 1 escapes payloads and strips
    // forged data-seemark-* attrs) — an unparseable payload means a SeeMark
    // bug, so it must throw rather than fall back to a plain element that
    // leaks data-seemark-* attributes into the output.
    const broken =
      '<span data-seemark-element-type="alert" data-seemark-payload="{not json}"></span>';
    expect(() => convertMarkup(broken)).toThrow(
      /unparseable data-seemark-payload for component "alert"/
    );
  });

  it('propagates exceptions thrown by custom components', () => {
    const markup =
      '<span data-seemark-element-type="alert" data-seemark-payload=\'{"title":"x"}\'></span>';
    const boom = () => {
      throw new Error('component bug');
    };
    expect(() => convertMarkup(markup, { alert: boom })).toThrow(
      'component bug'
    );
  });
});
