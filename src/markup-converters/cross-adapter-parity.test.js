import '@testing-library/jest-dom';
import { render, cleanup } from '@testing-library/react';

import createMarkdownToReactParser from '../parsers/create-markdown-to-react-parser';
import { renderToHtml } from '../parsers/create-markdown-to-html-parser';
import { SUPPORTED_COMPONENT_TYPES } from '../shared/supported-components';

import { fullSyntaxMarkdown } from './html/full-syntax-fixture';

// CONTRACT TEST — the formal drift guard between the React and HTML adapters.
//
// The HTML default components are hand-written mirrors of the React ones (a
// deliberate trade-off: it keeps /html framework-free instead of depending on
// react-dom/server). The cost is long-term drift risk, and this suite is the
// enforcement: for the same markdown, both adapters must produce the same
// *semantic* DOM (tag names, semantic attributes, text). Formatting
// differences (self-closing tags, attribute order, className vs class, style
// spacing, empty-string vs omitted attributes) are normalized away — both
// outputs are parsed by the SAME DOM parser first.
//
// Every type in SUPPORTED_COMPONENT_TYPES must be exercised by at least one
// case (each case declares which types it `covers`; a coverage test below
// enforces the union). Adding component #16 without a parity case fails CI.

const OPTIONS = {
  latexDelimiter: 'bracket',
  asciimathDelimiter: 'graveaccent',
  documentFormat: 'inline',
  imageFiles: { 'pic-id': 'https://example.com/p.png' },
};

const renderReactToDom = (markdown) => {
  const parse = createMarkdownToReactParser({
    options: OPTIONS,
    components: {},
  });
  const { container } = render(parse(markdown));
  return container;
};

const toDom = (htmlString) => {
  const el = document.createElement('div');
  el.innerHTML = htmlString;
  return el;
};

// Canonical, format-agnostic signature of a DOM subtree.
const signature = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.replace(/\s+/g, ' ').trim();
    return text ? `#text:${text}` : '';
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const attrs = [...node.attributes]
    .map((a) => {
      if (a.name === 'style') return `style=${node.style.cssText}`;
      // Treat empty-string attributes as absent (React renders id="",
      // the HTML adapter omits it — semantically identical).
      if (a.value === '') return '';
      // MathJax assigns globally-incrementing element IDs (MJX-1-, MJX-2-, ...)
      // that differ per render order, not per adapter. Normalize them away.
      const value = a.value.replace(/MJX-\d+-/g, 'MJX-N-');
      return `${a.name}=${value}`;
    })
    .filter(Boolean)
    .sort();

  const children = [...node.childNodes].map(signature).filter(Boolean);
  return `<${node.tagName.toLowerCase()} ${attrs.join(' ')}>[${children.join(',')}]`;
};

const parity = (markdown) => {
  const reactSig = signature(renderReactToDom(markdown));
  const htmlSig = signature(
    toDom(renderToHtml(markdown, { options: OPTIONS }))
  );
  return { reactSig, htmlSig };
};

describe('cross-adapter parity (React vs HTML)', () => {
  afterEach(() => cleanup());

  // [name, markdown, covers] — `covers` declares which component types the
  // case exercises; the coverage test below enforces the full set.
  const cases = [
    ['heading', '# Hello World', ['heading']],
    ['alert', '> [!WARNING]\n> A warning message.', ['alert']],
    ['alert with backlink', '> [!NOTE]#anchor1\n> noted.', ['alert']],
    ['internal link', '[Go]<sec-1>', ['internalLink']],
    ['internal link title', '[Go][[a tooltip]]<sec-1>', ['internalLinkTitle']],
    ['image', '![cat](pic-id)', ['image']],
    ['image link', '![cat](pic-id)((https://example.com))', ['imageLink']],
    ['image display', '![cat][[A cat]](pic-id)', ['imageDisplay']],
    [
      'image display link',
      '![cat][[A cat]](pic-id)((https://example.com))',
      ['imageDisplayLink'],
    ],
    ['external link tab', '@[Vercel](https://vercel.com)', ['externalLinkTab']],
    [
      'external link title',
      '[Vercel][[Homepage]](https://vercel.com)',
      ['externalLinkTitle'],
    ],
    [
      'external link tab title',
      '@[Vercel][[Homepage]](https://vercel.com)',
      ['externalLinkTabTitle'],
    ],
    ['iframe', '@![Demo](https://example.com/embed)', ['iframe']],
    ['youtube', '@![Vid](https://www.youtube.com/embed/abc123)', ['youtube']],
    ['codepen', '@![Pen](https://codepen.io/user/embed/xyz)', ['codepen']],
    ['latex math', 'eq \\(a^2 + b^2 = c^2\\) done', ['math']],
    ['asciimath', 'frac `a/b` done', ['math']],
    [
      'mixed paragraph',
      '# Title\n\nSee [ref]<r1> and ![img](pic-id).',
      ['heading', 'internalLink', 'image'],
    ],
    [
      'full syntax document',
      fullSyntaxMarkdown,
      [
        'heading',
        'image',
        'imageLink',
        'imageDisplay',
        'imageDisplayLink',
        'externalLinkTab',
        'externalLinkTitle',
        'externalLinkTabTitle',
        'youtube',
        'codepen',
        'iframe',
        'math',
      ],
    ],
  ];

  it.each(cases)(
    'produces matching semantic DOM for: %s',
    (_name, markdown) => {
      const { reactSig, htmlSig } = parity(markdown);
      expect(htmlSig).toBe(reactSig);
    }
  );

  it('covers every type in SUPPORTED_COMPONENT_TYPES with at least one case', () => {
    const covered = new Set(cases.flatMap(([, , covers = []]) => covers));
    for (const type of Object.values(SUPPORTED_COMPONENT_TYPES)) {
      expect([...covered]).toContain(type);
    }
  });
});
