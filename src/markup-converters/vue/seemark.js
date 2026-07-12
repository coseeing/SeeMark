import { computed, defineComponent } from 'vue';

import createMarkdownToVueParser from '../../parsers/create-markdown-to-vue-parser';

// Caches only the parser (a pure function of options/components). Parsed
// VNodes are deliberately NOT cached: a VNode tree must be unique per render,
// and cloneVNode is shallow — it cannot safely clone a nested tree. Vue only
// re-runs this component's render when its own props change, so an unchanged
// `source` costs nothing. Consumers should pass stable references for
// `options`/`components` (an inline object literal in the parent re-creates
// the parser on every parent render).
const SeeMark = defineComponent({
  name: 'SeeMark',
  props: {
    source: { type: String, default: '' },
    options: { type: Object, default: undefined },
    components: { type: Object, default: undefined },
  },
  setup(props) {
    const parse = computed(() =>
      createMarkdownToVueParser({
        options: props.options,
        components: props.components,
      })
    );
    return () => parse.value(props.source);
  },
});

export default SeeMark;
