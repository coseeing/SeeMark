import '@testing-library/jest-dom';
import { render, cleanup } from '@testing-library/react';

import createMarkdownToReactParser from '../parsers/create-markdown-to-react-parser';
import renderToHtml from '../parsers/create-markdown-to-html-parser';

// Parity between the React adapter and the HTML adapter: for the same markdown,
// both must produce the same *semantic* DOM (tag names, semantic attributes,
// text). Formatting differences (self-closing tags, attribute order,
// className vs class, style spacing, empty-string vs omitted attributes) are
// normalized away — both outputs are parsed by the SAME DOM parser first.

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

  const cases = [
    ['heading', '# Hello World'],
    ['alert', '> [!WARNING]\n> A warning message.'],
    ['alert with backlink', '> [!NOTE]#anchor1\n> noted.'],
    ['internal link', '[Go]<sec-1>'],
    ['internal link title', '[Go][[a tooltip]]<sec-1>'],
    ['image', '![cat](pic-id)'],
    ['image link', '![cat](pic-id)((https://example.com))'],
    ['image display', '![cat][[A cat]](pic-id)'],
    ['image display link', '![cat][[A cat]](pic-id)((https://example.com))'],
    ['external link tab', '@[Vercel](https://vercel.com)'],
    ['external link title', '[Vercel][[Homepage]](https://vercel.com)'],
    ['external link tab title', '@[Vercel][[Homepage]](https://vercel.com)'],
    ['iframe', '@![Demo](https://example.com/embed)'],
    ['youtube', '@![Vid](https://www.youtube.com/embed/abc123)'],
    ['codepen', '@![Pen](https://codepen.io/user/embed/xyz)'],
    ['latex math', 'eq \\(a^2 + b^2 = c^2\\) done'],
    ['asciimath', 'frac `a/b` done'],
    ['mixed paragraph', '# Title\n\nSee [ref]<r1> and ![img](pic-id).'],
  ];

  it.each(cases)(
    'produces matching semantic DOM for: %s',
    (_name, markdown) => {
      const { reactSig, htmlSig } = parity(markdown);
      expect(htmlSig).toBe(reactSig);
    }
  );
});
