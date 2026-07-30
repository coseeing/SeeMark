/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions": ["node", "node-addons"]}
 */
import { jest } from '@jest/globals';
import { createSSRApp, defineComponent, h, ref, nextTick } from 'vue';
import { renderToString } from '@vue/server-renderer';

import createMarkdownToVueParser from '../../parsers/create-markdown-to-vue-parser';

import { fullSyntaxMarkdown } from '../html/full-syntax-fixture';

const OPTIONS = {
  latexDelimiter: 'bracket',
  documentFormat: 'inline',
  imageFiles: { 'pic-id': 'https://example.com/p.png' },
};

const makeApp = (markdown, components) =>
  createSSRApp(
    defineComponent({
      setup() {
        const parse = createMarkdownToVueParser({
          options: OPTIONS,
          components,
        });
        return () => h('div', parse(markdown));
      },
    })
  );

const hydrateInJsdom = async (markdown, components) => {
  const html = await renderToString(makeApp(markdown, components));
  const container = document.createElement('div');
  document.body.appendChild(container);
  container.innerHTML = html;
  makeApp(markdown, components).mount(container);
  await nextTick();
  return { html, container };
};

describe('SSR + hydration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('hydrates a math-free document with zero mismatch warnings and reuses server DOM', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const markdown = [
      '# Title',
      '',
      '> [!NOTE]',
      '> body',
      '',
      'See [ref]<r1> and ![cat](pic-id).',
    ].join('\n');

    const html = await renderToString(makeApp(markdown));
    expect(html.length).toBeGreaterThan(0);

    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = html;
    const serverH1 = container.querySelector('h1');

    makeApp(markdown).mount(container);
    await nextTick();

    // Hydration must adopt the server-rendered node, not replace it.
    expect(container.querySelector('h1')).toBe(serverH1);
    const logged = [...warn.mock.calls, ...error.mock.calls]
      .flat()
      .map(String)
      .join('\n');
    expect(logged).not.toMatch(/hydrat/i);
  });

  it('SSR-renders and hydrates the full syntax document without structural replacement', async () => {
    // MathJax assigns globally-incrementing element IDs (MJX-1-, MJX-2-, ...),
    // so the server parse and the client parse can disagree on MJX-*
    // attributes. Attribute-level hydration warnings are tolerated HERE ONLY;
    // structural replacement is not. This caveat is documented in the README
    // SSR section.
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Inlined (not via hydrateInJsdom) so we can capture a server node BEFORE
    // hydration and prove it was ADOPTED, not replaced. The h1 carries no
    // MJX-* id, so — unlike the math subtree — it is a clean structural-reuse
    // signal unaffected by MathJax's per-parse id drift.
    const html = await renderToString(makeApp(fullSyntaxMarkdown));
    expect(html).toContain('<h1');
    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = html;
    const serverH1 = container.querySelector('h1');

    makeApp(fullSyntaxMarkdown).mount(container);
    await nextTick();

    // Reference identity: a full client re-render would have discarded serverH1.
    expect(container.querySelector('h1')).toBe(serverH1);
    expect(
      container.querySelector('span[aria-hidden="true"] svg')
    ).not.toBeNull();
  });

  it('custom components are interactive after hydration', async () => {
    const ClickAlert = defineComponent({
      name: 'ClickAlert',
      props: {
        variant: { type: String, default: '' },
        title: { type: String, default: '' },
        internalLinkId: { type: String, default: '' },
        position: { type: Object, default: undefined },
      },
      setup(props, { slots }) {
        const clicks = ref(0);
        return () =>
          h('div', { role: 'note' }, [
            h(
              'button',
              { onClick: () => clicks.value++ },
              `clicks:${clicks.value}`
            ),
            slots.default?.(),
          ]);
      },
    });

    const { container } = await hydrateInJsdom('> [!NOTE]\n> body', {
      alert: ClickAlert,
    });
    const button = container.querySelector('button');
    expect(button.textContent).toBe('clicks:0');
    button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    await nextTick();
    expect(button.textContent).toBe('clicks:1');
  });
});
