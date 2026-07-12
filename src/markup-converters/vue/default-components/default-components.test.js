/**
 * Vue 3 ships its default "." export condition pointing at the
 * bundler-targeted ESM build, which assumes further processing by a bundler
 * and cannot be executed directly by Node/Jest. jsdom's default Jest
 * environment also requests the "browser" export condition instead of
 * "node", so without this override Jest resolves `import ... from 'vue'` to
 * that non-executable bundler build. This per-file docblock (a native Jest
 * feature) asks Jest to prefer the real Node entry points instead — it does
 * not touch the shared jest.config.js.
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions": ["node", "node-addons"]}
 */
import { h } from 'vue';
import { mount } from '@vue/test-utils';

import { SUPPORTED_COMPONENT_TYPES } from '../../../shared/supported-components';

import defaultComponents from './default-components';
import alert from './alert';
import heading from './heading';
import math from './math';
import imageDisplayLink from './image-display-link';

const mountComponent = (Component, props, childText) =>
  mount({
    render: () =>
      h(
        'div',
        h(
          Component,
          props,
          childText ? { default: () => [childText] } : undefined
        )
      ),
  });

describe('vue default components', () => {
  it('registry covers every SUPPORTED_COMPONENT_TYPES key', () => {
    for (const type of Object.values(SUPPORTED_COMPONENT_TYPES)) {
      expect(typeof defaultComponents[type]).toBe('function');
    }
    expect(Object.keys(defaultComponents)).toHaveLength(
      Object.values(SUPPORTED_COMPONENT_TYPES).length
    );
  });

  it('every component disables attribute fallthrough', () => {
    // Payload keys (position, math, typed, ...) would otherwise be applied
    // to the root element as DOM attributes and break cross-adapter parity.
    for (const Component of Object.values(defaultComponents)) {
      expect(Component.inheritAttrs).toBe(false);
    }
  });

  it('alert renders region, uppercased variant, slot children and backlink', () => {
    const wrapper = mountComponent(
      alert,
      { internalLinkId: 'a1', variant: 'warning', title: 'Careful' },
      'body text'
    );
    const region = wrapper.get('[role="region"]');
    expect(region.attributes('aria-label')).toBe('Careful');
    expect(region.attributes('id')).toBe('a1');
    expect(region.get('p').text()).toBe('WARNING');
    expect(region.text()).toContain('body text');
    expect(region.get('a').attributes('href')).toBe('#a1-source');
  });

  it('alert omits id and backlink without internalLinkId', () => {
    const wrapper = mountComponent(
      alert,
      { internalLinkId: '', variant: 'note', title: '' },
      'x'
    );
    expect(wrapper.get('[role="region"]').attributes('id')).toBeUndefined();
    expect(wrapper.find('a').exists()).toBe(false);
  });

  it('heading renders the level and clamps invalid levels to h1', () => {
    expect(
      mountComponent(heading, { id: 'sec', level: 3 }, 'Title').get('h3').text()
    ).toBe('Title');
    expect(
      mountComponent(heading, { id: null, level: 9 }, 'T').find('h1').exists()
    ).toBe(true);
  });

  it('math renders mathMl/svg via innerHTML into sr-only + aria-hidden spans', () => {
    const wrapper = mountComponent(math, {
      mathMl: '<math><mi>x</mi></math>',
      svg: '<svg><g></g></svg>',
    });
    expect(wrapper.get('span.sr-only').element.innerHTML).toBe(
      '<math><mi>x</mi></math>'
    );
    expect(wrapper.get('span[aria-hidden="true"]').element.innerHTML).toBe(
      '<svg><g></g></svg>'
    );
  });

  it('imageDisplayLink composes anchor > figure > img + figcaption', () => {
    const wrapper = mountComponent(imageDisplayLink, {
      display: 'A cat',
      target: 'https://example.com',
      alt: 'cat',
      imageId: 'pic-id',
      source: 'https://example.com/p.png',
    });
    const anchor = wrapper.get('a');
    expect(anchor.attributes('href')).toBe('https://example.com');
    const img = anchor.get('figure img');
    expect(img.attributes('src')).toBe('https://example.com/p.png');
    expect(img.attributes('alt')).toBe('cat');
    expect(img.attributes('data-seemark-image-id')).toBe('pic-id');
    expect(anchor.get('figcaption').text()).toBe('A cat');
  });
});
