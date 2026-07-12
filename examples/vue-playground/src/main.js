import { createApp, defineComponent, h, ref } from 'vue';
import { SeeMark } from '@coseeing/see-mark/vue';

import { sampleMarkdown } from './sample-markdown';

const OPTIONS = {
  latexDelimiter: 'bracket',
  asciimathDelimiter: 'graveaccent',
  documentFormat: 'inline',
  imageFiles: { 'pic-id': 'https://picsum.photos/240/160' },
};

// Custom component override demo: a Vue component receiving payload props and
// the default slot. Declare the payload props you use (plus `position`) so
// they do not fall through as DOM attributes.
const DemoAlert = defineComponent({
  name: 'DemoAlert',
  props: {
    variant: { type: String, default: '' },
    title: { type: String, default: '' },
    internalLinkId: { type: String, default: '' },
    position: { type: Object, default: undefined },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        {
          style: 'border: 2px solid tomato; border-radius: 8px; padding: 8px;',
          id: props.internalLinkId || undefined,
        },
        [
          h('strong', null, `[custom ${props.variant}] ${props.title || ''}`),
          slots.default?.(),
        ]
      );
  },
});

const App = defineComponent({
  setup() {
    const source = ref(sampleMarkdown);
    const useCustomAlert = ref(false);
    return () =>
      h('main', { style: 'display: flex; gap: 16px; padding: 16px;' }, [
        h('section', { style: 'width: 40%;' }, [
          h('label', null, [
            h('input', {
              type: 'checkbox',
              checked: useCustomAlert.value,
              onChange: (e) => (useCustomAlert.value = e.target.checked),
            }),
            ' use custom alert component',
          ]),
          h('textarea', {
            value: source.value,
            onInput: (e) => (source.value = e.target.value),
            style: 'width: 100%; min-height: 80vh; margin-top: 8px;',
          }),
        ]),
        h('article', { style: 'width: 60%;' }, [
          h(SeeMark, {
            source: source.value,
            options: OPTIONS,
            components: useCustomAlert.value
              ? { alert: DemoAlert }
              : undefined,
          }),
        ]),
      ]);
  },
});

createApp(App).mount('#app');
