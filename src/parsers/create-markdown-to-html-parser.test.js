import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

import createMarkdownToHtmlParser, {
  renderToHtml,
} from './create-markdown-to-html-parser';
import convertMarkup from '../markup-converters/html/converter';
import { escapeHtml, escapeAttr } from '../markup-converters/html/escape';

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

    it('escapeAttr encodes single quote', () => {
      expect(escapeAttr("I'm sure")).toBe('I&#39;m sure');
    });
  });

  describe('raw HTML passthrough — escaped, not sanitized', () => {
    // The HTML adapter is not a sanitizer (see README threat model). Raw HTML in
    // the markdown source is re-serialized verbatim and attribute values are
    // escaped for correctness, but URLs are not scheme-filtered and no tags or
    // attributes are dropped. Untrusted input belongs in the `sanitize` hook.

    it('passes a javascript: image source through unchanged', () => {
      const html = renderToHtml('![bad](evil)', {
        options: { imageFiles: { evil: 'javascript:alert(1)' } },
      });
      const container = mount(html);
      expect(container.querySelector('img').getAttribute('src')).toBe(
        'javascript:alert(1)'
      );
    });

    it('passes a javascript: link href through unchanged', () => {
      const html = renderToHtml('<a href="javascript:alert(1)">x</a>');
      expect(html).toContain('href="javascript:alert(1)"');
    });

    it('keeps on* event-handler attributes (not stripped)', () => {
      const html = renderToHtml('<img src=x onerror=alert(2)>');
      expect(html).toMatch(/onerror/i);
      expect(html).toContain('<img');
    });

    it('keeps raw <script>/<iframe>/<object> passthrough tags', () => {
      const html = renderToHtml(
        'a <script>alert(1)</script> <iframe></iframe> <object></object> c'
      );
      expect(html).toContain('<script');
      expect(html).toContain('<iframe');
      expect(html).toContain('<object');
      expect(html).toContain('a ');
      expect(html).toContain(' c');
    });

    it('escapes attribute values so a value cannot break out into a new attribute', () => {
      // Correctness, not sanitization: an embedded quote must stay inside the
      // attribute value rather than open a sibling (event-handler) attribute.
      const html = renderToHtml(
        '<a href="/x&quot; onmouseover=&quot;alert(1)">x</a>'
      );
      const container = mount(html);
      expect(container.querySelector('a').hasAttribute('onmouseover')).toBe(
        false
      );
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

  describe('trusted output & contract integrity (still enforced)', () => {
    it('emits math mathMl/svg unescaped (trusted MathJax output)', () => {
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

    it('renders the youtube component iframe from SeeMark syntax', () => {
      const html = renderToHtml(
        '@![Vid](https://www.youtube.com/embed/abc123)'
      );
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
