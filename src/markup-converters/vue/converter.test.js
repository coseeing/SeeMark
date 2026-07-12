/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions": ["node", "node-addons"]}
 */
import { h, defineComponent } from 'vue';
import { mount } from '@vue/test-utils';

import convertMarkup from './converter';

const mountMarkup = (markup, components) =>
  mount({ render: () => h('div', convertMarkup(markup, components)) });

describe('vue converter', () => {
  it('re-creates raw passthrough elements with text and attributes', () => {
    const wrapper = mountMarkup(
      '<p class="lead" style="color: red;">hello <strong>world</strong></p>'
    );
    const p = wrapper.get('p');
    expect(p.classes()).toContain('lead');
    expect(p.attributes('style')).toBe('color: red;');
    expect(p.get('strong').text()).toBe('world');
    expect(p.text()).toBe('hello world');
  });

  it('drops string on* attributes from raw passthrough (case-insensitive)', () => {
    // Vue sets string-valued native on* props via setAttribute, which creates
    // LIVE inline handlers — unlike React, which ignores string handlers.
    const wrapper = mountMarkup(
      '<button onclick="window.__seemarkPwned = true" onMouseOver="window.__seemarkPwned = true">hi</button>'
    );
    const button = wrapper.get('button');
    expect(button.attributes('onclick')).toBeUndefined();
    expect(button.attributes('onmouseover')).toBeUndefined();
    button.element.click();
    expect(window.__seemarkPwned).toBeUndefined();
  });

  it('keeps non-handler attributes verbatim, including data-* on unknown types', () => {
    const wrapper = mountMarkup(
      '<span data-seemark-element-type="not-a-real-type" data-foo="bar">x</span>'
    );
    // Unknown seemark type falls back to passthrough, same as React/HTML.
    const span = wrapper.get('span');
    expect(span.attributes('data-seemark-element-type')).toBe(
      'not-a-real-type'
    );
    expect(span.attributes('data-foo')).toBe('bar');
    expect(span.text()).toBe('x');
  });

  it('dispatches component placeholders to default components', () => {
    const wrapper = mountMarkup(
      `<div data-seemark-element-type="alert" data-seemark-payload='{"variant":"note","title":"T","internalLinkId":""}'>body</div>`
    );
    const region = wrapper.get('[role="region"]');
    expect(region.get('p').text()).toBe('NOTE');
    expect(region.text()).toContain('body');
    // The placeholder's data-seemark-* attributes must NOT leak into the DOM.
    expect(wrapper.find('[data-seemark-element-type]').exists()).toBe(false);
  });

  it('lets consumer components override defaults and receive props + default slot', () => {
    const CustomAlert = defineComponent({
      name: 'CustomAlert',
      props: {
        variant: { type: String, default: '' },
        title: { type: String, default: '' },
        internalLinkId: { type: String, default: '' },
        position: { type: Object, default: undefined },
      },
      setup(props, { slots }) {
        return () =>
          h('section', { class: `custom-${props.variant}` }, slots.default?.());
      },
    });
    const wrapper = mountMarkup(
      `<div data-seemark-element-type="alert" data-seemark-payload='{"variant":"warning","title":"W","internalLinkId":""}'>inner</div>`,
      { alert: CustomAlert }
    );
    const section = wrapper.get('section.custom-warning');
    expect(section.text()).toBe('inner');
  });

  it('supports plain functional components as overrides', () => {
    const FnAlert = ({ variant = '' }, { slots }) =>
      h('aside', { 'data-variant': variant }, slots.default?.());
    FnAlert.inheritAttrs = false;
    const wrapper = mountMarkup(
      `<div data-seemark-element-type="alert" data-seemark-payload='{"variant":"tip"}'>fn body</div>`,
      { alert: FnAlert }
    );
    expect(wrapper.get('aside').attributes('data-variant')).toBe('tip');
    expect(wrapper.get('aside').text()).toBe('fn body');
  });

  it('returns fresh VNodes on every slot invocation', () => {
    // A component may render its default slot more than once (e.g. a visual
    // copy plus an sr-only copy). Each invocation must get a fresh VNode
    // tree — sharing one cached array would violate VNode uniqueness.
    const TwiceAlert = (props, { slots }) =>
      h('div', [
        h('section', { class: 'visual' }, slots.default?.()),
        h('section', { class: 'copy' }, slots.default?.()),
      ]);
    TwiceAlert.inheritAttrs = false;
    const wrapper = mountMarkup(
      `<div data-seemark-element-type="alert" data-seemark-payload='{"variant":"note"}'><strong>bold</strong> text</div>`,
      { alert: TwiceAlert }
    );
    const sections = wrapper.findAll('section');
    expect(sections).toHaveLength(2);
    expect(sections[0].element.innerHTML).toContain('<strong>bold</strong>');
    expect(sections[1].element.innerHTML).toContain('<strong>bold</strong>');
    // Both copies must be backed by distinct DOM nodes.
    expect(sections[0].element.querySelector('strong')).not.toBe(
      sections[1].element.querySelector('strong')
    );
  });

  it('throws loudly on an unparseable payload (Stage 1 contract violation)', () => {
    expect(() =>
      convertMarkup(
        '<div data-seemark-element-type="alert" data-seemark-payload="not-json"></div>'
      )
    ).toThrow(/contract violation/);
  });

  it('drops HTML comments (VNodes have no string round-trip for them)', () => {
    const wrapper = mountMarkup('<p>a</p><!-- secret --><p>b</p>');
    expect(wrapper.element.innerHTML).not.toContain('secret');
    expect(wrapper.findAll('p')).toHaveLength(2);
  });
});
