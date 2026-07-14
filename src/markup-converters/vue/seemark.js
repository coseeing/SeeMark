import { computed, defineComponent } from 'vue';

import createMarkdownToVueParser from '../../parsers/create-markdown-to-vue-parser';

// Cache the parser, never the VNodes: a VNode tree must be unique per render.
// Consumers should pass stable `options`/`components` references — an inline
// literal re-creates the parser on every parent render.
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
