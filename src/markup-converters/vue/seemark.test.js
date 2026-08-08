/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions": ["node", "node-addons"]}
 */
import { h, ref, defineComponent } from 'vue';
import { mount } from '@vue/test-utils';

import SeeMark from './seemark';

const OPTIONS = {
  latexDelimiter: 'bracket',
  asciimathDelimiter: 'graveaccent',
  documentFormat: 'inline',
  imageFiles: { 'pic-id': 'https://example.com/p.png' },
};

describe('SeeMark component', () => {
  it('renders markdown from the source prop', () => {
    const wrapper = mount(SeeMark, {
      props: { source: '# One', options: OPTIONS },
    });
    expect(wrapper.get('h1').text()).toBe('One');
  });

  it('re-renders when source changes, including back to a previous value', async () => {
    // A -> B -> A regression: a naive VNode cache keyed on source would hand
    // back already-mounted VNodes on the third render and corrupt the patch.
    // (Design spec: cache the parser only, never the VNodes.)
    const wrapper = mount(SeeMark, {
      props: { source: '# One', options: OPTIONS },
    });
    await wrapper.setProps({ source: '# Two' });
    expect(wrapper.get('h1').text()).toBe('Two');
    await wrapper.setProps({ source: '# One' });
    expect(wrapper.get('h1').text()).toBe('One');
  });

  it('rebuilds the parser when options change', async () => {
    const wrapper = mount(SeeMark, {
      props: { source: 'eq $a^2$ done', options: OPTIONS },
    });
    // Under 'bracket', $...$ is not math.
    expect(wrapper.find('span.sr-only').exists()).toBe(false);
    await wrapper.setProps({
      options: { ...OPTIONS, latexDelimiter: 'dollar' },
    });
    expect(wrapper.find('span.sr-only').exists()).toBe(true);
  });

  it('applies and reacts to the components prop', async () => {
    const FnHeading = ({ id = null }, { slots }) =>
      h('h1', { id: id || null, class: 'custom' }, slots.default?.());
    FnHeading.inheritAttrs = false;
    const wrapper = mount(SeeMark, {
      props: { source: '# T', options: OPTIONS },
    });
    expect(wrapper.find('h1.custom').exists()).toBe(false);
    await wrapper.setProps({ components: { heading: FnHeading } });
    expect(wrapper.find('h1.custom').exists()).toBe(true);
  });

  it('survives unrelated parent re-renders (VNode uniqueness regression)', async () => {
    const Parent = defineComponent({
      setup() {
        const n = ref(0);
        return () =>
          h('div', [
            h('button', { onClick: () => n.value++ }, String(n.value)),
            h(SeeMark, { source: '# Stable', options: OPTIONS }),
          ]);
      },
    });
    const wrapper = mount(Parent);
    await wrapper.get('button').trigger('click');
    await wrapper.get('button').trigger('click');
    expect(wrapper.get('button').text()).toBe('2');
    expect(wrapper.get('h1').text()).toBe('Stable');
  });
});
