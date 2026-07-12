/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions": ["node", "node-addons"]}
 */

import { h } from 'vue';
import { mount } from '@vue/test-utils';

import createMarkdownToVueParser from './create-markdown-to-vue-parser';

const OPTIONS = {
  latexDelimiter: 'bracket',
  asciimathDelimiter: 'graveaccent',
  documentFormat: 'inline',
  imageFiles: { 'pic-id': 'https://example.com/p.png' },
};

const mountMarkdown = (markdown, config = {}) => {
  const parse = createMarkdownToVueParser({ options: OPTIONS, ...config });
  return mount({ render: () => h('div', parse(markdown)) });
};

describe('createMarkdownToVueParser', () => {
  it('renders a heading through the full pipeline', () => {
    const wrapper = mountMarkdown('# Hello');
    expect(wrapper.get('h1').text()).toBe('Hello');
  });

  it('renders math with MathML in sr-only and svg aria-hidden', () => {
    const wrapper = mountMarkdown('eq \\(a^2 + b^2 = c^2\\) done');
    expect(wrapper.get('span.sr-only').element.innerHTML).toContain('<math');
    expect(
      wrapper.get('span[aria-hidden="true"]').element.querySelector('svg')
    ).not.toBeNull();
  });

  it('resolves image ids through options.imageFiles', () => {
    const wrapper = mountMarkdown('![cat](pic-id)');
    expect(wrapper.get('img').attributes('src')).toBe(
      'https://example.com/p.png'
    );
  });

  it('applies consumer component overrides', () => {
    const FnHeading = ({ id = null }, { slots }) =>
      h('h1', { id: id || null, class: 'custom-heading' }, slots.default?.());
    FnHeading.inheritAttrs = false;
    const wrapper = mountMarkdown('# Custom', {
      components: { heading: FnHeading },
    });
    expect(wrapper.get('h1.custom-heading').text()).toBe('Custom');
  });

  // Trust-boundary documentation tests — these pin the DELIBERATE posture
  // from the design spec (docs/superpowers/specs/2026-07-12-vue-adapter-design.md):
  // the adapter is not a sanitizer; URL schemes pass through verbatim, same
  // as the React adapter. Changing this behavior must be a conscious decision.
  it('passes javascript: URLs through verbatim (documented trust boundary)', () => {
    const wrapper = mountMarkdown('<a href="javascript:alert(1)">x</a>');
    expect(wrapper.get('a').attributes('href')).toBe('javascript:alert(1)');
  });

  it('passes data: URLs through verbatim (documented trust boundary)', () => {
    const wrapper = mountMarkdown(
      '<img src="data:image/png;base64,AAAA" alt="d">'
    );
    expect(wrapper.get('img').attributes('src')).toBe(
      'data:image/png;base64,AAAA'
    );
  });
});
