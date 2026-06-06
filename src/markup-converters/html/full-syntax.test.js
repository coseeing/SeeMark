import '@testing-library/jest-dom';

import { renderToHtml } from '../../parsers/create-markdown-to-html-parser';

import { fullSyntaxMarkdown } from './full-syntax-fixture';

// Automated version of the manual end-to-end smoke test: render the full-syntax
// document through the HTML adapter and assert the structure of every supported
// component. renderToHtml's output is deterministic (MathJax runs in Node at
// Stage 1), so no real browser is needed — jsdom is enough.

// Parse the adapter's HTML string into a queryable DOM without raw innerHTML.
const parse = (html) => {
  const doc = new DOMParser().parseFromString(
    `<!DOCTYPE html><body>${html}</body>`,
    'text/html'
  );
  return doc.body;
};

describe('HTML adapter — full-syntax document', () => {
  const html = renderToHtml(fullSyntaxMarkdown, {
    options: {
      latexDelimiter: 'bracket',
      documentFormat: 'block',
      imageFiles: {},
      shouldBuildImageObjectURL: false,
    },
  });
  const root = parse(html);
  const q = (selector) => root.querySelectorAll(selector);

  it('renders every heading level, with slugified ids', () => {
    expect(q('h1')).toHaveLength(1);
    expect(q('h2')).toHaveLength(9);
    expect(q('h3')).toHaveLength(1);
    expect(q('h4')).toHaveLength(1);
    expect(q('h5')).toHaveLength(1);
    expect(q('h6')).toHaveLength(1);
    expect(root.querySelector('h1').id).toBeTruthy();
  });

  it('renders inline formatting (bold / italic / strikethrough)', () => {
    expect(q('strong').length).toBeGreaterThan(0);
    expect(q('em').length).toBeGreaterThan(0);
    expect(q('del, s').length).toBeGreaterThan(0);
  });

  it('renders nested unordered and ordered lists', () => {
    expect(q('ul').length).toBeGreaterThanOrEqual(3);
    expect(q('ol').length).toBeGreaterThanOrEqual(2);
    expect(q('li')).toHaveLength(11);
  });

  it('renders a table with a 3-column header', () => {
    expect(q('table')).toHaveLength(1);
    expect(q('th')).toHaveLength(3);
  });

  it('renders the four link variants with correct target/rel/title', () => {
    const byText = (text) =>
      [...q('a')].find((a) => a.textContent.trim() === text);

    const standard = byText('標準連結');
    expect(standard.getAttribute('href')).toBe('https://example.com');
    expect(standard.getAttribute('target')).toBeNull();

    const newTab = byText('Coseeing');
    expect(newTab.getAttribute('target')).toBe('_blank');
    expect(newTab.getAttribute('rel')).toBe('noopener noreferrer');

    const titled = byText('Coseeing 首頁');
    expect(titled.getAttribute('title')).toBe('官方網站');
    expect(titled.getAttribute('target')).toBeNull();

    const newTabTitled = byText('Coseeing 文件');
    expect(newTabTitled.getAttribute('target')).toBe('_blank');
    expect(newTabTitled.getAttribute('rel')).toBe('noopener noreferrer');
    expect(newTabTitled.getAttribute('title')).toBe('Read the docs');

    // Every @[...] external link opens a new tab safely (noopener noreferrer).
    expect(q('a[target="_blank"][rel="noopener noreferrer"]')).toHaveLength(7);
  });

  it('renders the four image variants with external https src (#37)', () => {
    const imgs = [...q('img')];
    expect(imgs).toHaveLength(4);
    for (const img of imgs) {
      expect(img.getAttribute('src')).toBe(
        'https://s.yimg.com/cv/apiv2/ysun01/cat.jpg'
      );
      expect(img.getAttribute('alt')).toBeTruthy();
      expect(img.getAttribute('data-seemark-image-id')).toBeTruthy();
    }
    // The two display variants wrap the image in <figure><figcaption>.
    expect(q('figure')).toHaveLength(2);
    expect([...q('figcaption')].map((f) => f.textContent.trim())).toEqual([
      '點圖看完整貓咪',
      '點圖跳轉',
    ]);
  });

  it('renders iframe / youtube / codepen embeds (watch URL → embed)', () => {
    const srcs = [...q('iframe')].map((f) => f.getAttribute('src'));
    expect(srcs).toHaveLength(4);
    // Both the /embed/ URL and the /watch?v= URL resolve to an embed src.
    expect(srcs.filter((s) => s.includes('youtube.com/embed/'))).toHaveLength(
      2
    );
    expect(srcs.some((s) => s.includes('codepen.io'))).toBe(true);
    expect(srcs.some((s) => s === 'https://example.com')).toBe(true);
  });

  it('renders math with the MathML + SVG accessibility dual track', () => {
    // 5 LaTeX expressions → each a screen-reader MathML + an aria-hidden SVG.
    expect(q('.sr-only')).toHaveLength(5);
    expect(html.match(/<math[\s>]/gi) || []).toHaveLength(5);
    expect(q('svg').length).toBeGreaterThanOrEqual(5);
    expect(q('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(5);
  });

  it('consumes every placeholder (no leftover data-seemark-* attributes)', () => {
    expect(html).not.toContain('data-seemark-element-type');
    expect(html).not.toContain('data-seemark-payload');
  });
});
