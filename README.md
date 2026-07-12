# SeeMark

## React

### Usage

```js
import { createMarkdownToReactParser } from '@coseeing/see-mark';

const Alert = ({ children, internalLinkId, variant, title }) => {
  return (
    <div className={`alert alert-${variant}`}>
      {title && <strong>{title}</strong>}
      {children}
    </div>
  );
};

const markdown = `# Hello World

const seeMarkReactParse = useCallback(
  (markdown) => {
    return createMarkdownToReactParser({
      options: {
        latexDelimiter,
        documentFormat,
        imageFiles,
        shouldBuildImageObjectURL,
      },
      components: { alert: Alert },
    })(markdown);
  },
  [imageFiles, latexDelimiter, documentFormat]
);

const content = seeMarkReactParse(markdown);
```

### options

| Option Name               | Type    | Default Value  | Description                                                        |
| ------------------------- | ------- | -------------- | ------------------------------------------------------------------ |
| enableLatex               | boolean | true           | When false, LaTeX expressions are not parsed as math.              |
| enableAsciimath           | boolean | true           | When false, AsciiMath expressions are not parsed as math.          |
| enableNemeth              | boolean | true           | When false, the Nemeth braille math extension is disabled.         |
| latexDelimiter            | string  | 'bracket'      | The delimiter for LaTeX expressions. Options: 'bracket' (`\(...\)`), 'dollar' (`$...$`), 'latex' (`\l...\l`). |
| asciimathDelimiter        | string  | 'graveaccent'  | The delimiter for AsciiMath expressions. Options: 'graveaccent' (`` `...` ``), 'asciimath' (`\a...\a`). |
| nemethDelimiter           | string  | 'at'           | The delimiter for Nemeth braille expressions. Options: 'at' (`@...@`), 'nemeth' (`\n...\n`). |
| documentFormat            | string  | 'inline'       | The format of the document. Options: 'inline', 'block'.            |
| imageFiles                | object  | { [ID]: File } | A map of image IDs to File objects for image rendering.            |
| shouldBuildImageObjectURL | boolean | false          | should build image object URL.                                     |

### Supported Custom Components

#### alert

```markdown
> [!NOTE]
> Highlights information that users should take into account, even when skimming.
```

| Prop Name      | Type      | Default Value | Description                                         |
| -------------- | --------- | ------------- | --------------------------------------------------- |
| children       | ReactNode | -             | The content of the alert.                           |
| internalLinkId | string    | ''            | The ID for internal linking.                        |
| variant        | string    | ''            | The variant of the alert (e.g., 'info', 'warning'). |
| title          | string    | ''            | The title of the alert.                             |
| position       | object    | -             | Position info: `{ start: number, end: number }`     |

#### internalLink

```markdown
[some text]<sample-id>
```

| Prop Name | Type   | Default Value | Description                                |
| --------- | ------ | ------------- | ------------------------------------------ |
| text      | string | ''            | The text to display for the link.          |
| id        | string | ''            | The ID of the target element for the link. |
| position  | object | -             | Position info: `{ start: number, end: number }` |

#### image

```markdown
![pikachu](pikachu-path)
```

| Prop Name | Type   | Default Value | Description                         |
| --------- | ------ | ------------- | ----------------------------------- |
| src       | string | ''            | The source path of the image.       |
| alt       | string | ''            | The alternative text for the image. |
| imageId   | string | ''            | image ID                            |
| position  | object | -             | Position info: `{ start: number, end: number }` |

### Position Information

All custom components receive a `position` prop that indicates the location of the component in the original markdown source:

```typescript
interface Position {
  start: number;  // Character offset where the component starts
  end: number;    // Character offset where the component ends
}
```

## Vue

The `@coseeing/see-mark/vue` entry renders the same markdown pipeline to Vue 3
VNodes. Vue 3.2+ is required (declared as an optional peer dependency — React
users are unaffected).

### Usage

```js
import { createApp, defineComponent, h, ref } from 'vue';
import { SeeMark, createMarkdownToVueParser } from '@coseeing/see-mark/vue';

// Option 1: the <SeeMark> component (idiomatic for most apps)
const App = defineComponent({
  setup() {
    const source = ref('# Hello \\(a^2 + b^2 = c^2\\)');
    return () => h(SeeMark, { source: source.value, options: OPTIONS });
  },
});

// Option 2: the parser factory (mirrors createMarkdownToReactParser)
const parse = createMarkdownToVueParser({ options: OPTIONS });
const MyDoc = defineComponent({
  props: { markdown: String },
  setup(props) {
    return () => h('article', parse(props.markdown));
  },
});
```

`options` accepts the same table as the React parser (see above).
`createMarkdownToVueParser` returns a function producing a fresh VNode array —
call it inside a render function. `<SeeMark>` re-parses when `source` changes
and rebuilds its parser when `options`/`components` change; pass stable object
references for `options`/`components` (an inline literal re-creates the parser
on every parent render).

### Custom components

A custom component is an ordinary Vue 3 component (functional, `defineComponent`
or SFC). Payload arrives as props; children arrive through the **default slot**.
Declare the payload props you use (plus `position`) — undeclared payload keys
would otherwise fall through onto the root element as DOM attributes.

```js
const Alert = defineComponent({
  props: {
    variant: { type: String, default: '' },
    title: { type: String, default: '' },
    internalLinkId: { type: String, default: '' },
    position: { type: Object, default: undefined },
  },
  setup(props, { slots }) {
    return () =>
      h('div', { class: `alert alert-${props.variant}` }, [
        props.title ? h('strong', null, props.title) : null,
        slots.default?.(),
      ]);
  },
});

h(SeeMark, { source, options: OPTIONS, components: { alert: Alert } });
```

Errors thrown by a custom component surface at mount/render time and follow
Vue's normal error path (`app.config.errorHandler`), not at parse time.

### SSR

The Vue adapter is SSR-safe (`@vue/server-renderer` / Nuxt): MathJax runs in
the parsing stage, not in components. One caveat: MathJax assigns
globally-incrementing element IDs, so a server parse and a client parse of the
same document can disagree on `MJX-*` attribute values, which may surface as
attribute-level hydration warnings in dev builds. Structure and content
hydrate correctly.

### Bundler compatibility

The `/vue` entry ships two builds: bundlers get an ESM build
(`import` condition) so their single `vue` copy is shared with your app, while
Node — CommonJS and ESM alike — gets the CommonJS build (`node` condition).
Two practical notes:

- **AsciiMath under ESM-strict bundlers (Vite, esbuild) is unavailable.**
  MathJax implements AsciiMath through a MathJax-v2 legacy shim that cannot
  run under strict mode. SeeMark loads it lazily, so importing SeeMark and
  rendering LaTeX/Nemeth work everywhere; converting AsciiMath in an
  ESM-strict bundle throws a descriptive error. Set `enableAsciimath: false`
  in that environment (backticks then render as ordinary code spans).
  Server-side (Node/webpack) AsciiMath is unaffected.
- **Linked-package development**: if you consume SeeMark via `npm link` /
  `file:` during development, add `resolve.dedupe: ['vue']` to your Vite
  config — the linked repo carries its own `node_modules/vue`, and two Vue
  runtimes on one page silently break reactivity across the component
  boundary. Registry installs are unaffected. See
  `examples/vue-playground/vite.config.js` for a working setup (including the
  `global` → `globalThis` define that mathjax-full needs in browsers).

## Security / trust model

SeeMark adapters are **not sanitizers**. Raw HTML in the markdown source
passes through to the output — including `javascript:` URLs — matching the
React adapter's behavior. If you render untrusted markdown, sanitize it at the
source, or sanitize the HTML adapter's string output with DOMPurify via its
`sanitize` hook.

To keep the Vue adapter no more dangerous than the React one, raw passthrough
neutralizes three Vue-specific execution vectors — none of which affect your
own custom components (`@click`/`v-on`, `ref`, `key` on components all work
normally):

- **string `on*` attributes** (e.g. `onclick="..."`) are dropped. Vue would
  otherwise attach them as live inline handlers; React ignores string
  handlers.
- **raw `<script>` elements are dropped.** A `<script>` built as a VNode is
  not parser-inserted and executes on mount; React's script elements are
  inert and the HTML adapter's string output is inert under `innerHTML`.
- **the Vue-reserved props `ref`, `key`, `ref_for`, `ref_key`** are stripped,
  so untrusted markup cannot register on the host component's `$refs` or
  corrupt keyed diffing.

Everything else — including `javascript:` URLs and `<style>` — still passes
through verbatim; sanitize untrusted input at the source.

## Table of Contents

### Usage

```js
import { createTableOfContents } from '@coseeing/see-mark';

const markdown = `
## Introduction
### Getting Started
## Advanced Usage
### Configuration
`;

const toc = createTableOfContents(markdown);
// [
//   { level: 2, id: 'introduction',   text: 'Introduction' },
//   { level: 3, id: 'getting-started', text: 'Getting Started' },
//   { level: 2, id: 'advanced-usage',  text: 'Advanced Usage' },
//   { level: 3, id: 'configuration',   text: 'Configuration' },
// ]
```

`createTableOfContents` parses a markdown string and returns a flat array of all h1–h6 headings in document order. The `id` of each entry is generated with the same slugify logic used by the seemark's markdown parser, so IDs are guaranteed to match the `id` prop on rendered heading components.

### Options

| Option Name    | Type    | Default Value | Description                                                                                 |
| -------------- | ------- | ------------- | ------------------------------------------------------------------------------------------- |
| enableLatex    | boolean | true          | When false, LaTeX expressions are not parsed as math.                                       |
| enableAsciimath | boolean | true         | When false, AsciiMath expressions are not parsed as math.                                   |
| enableNemeth   | boolean | true          | When false, the Nemeth braille math extension is disabled.                                  |
| latexDelimiter | string  | 'bracket'     | The delimiter for LaTeX expressions. Options: 'bracket' (`\(...\)`), 'dollar' (`$...$`), 'latex' (`\l...\l`). Must match the renderer. |
| asciimathDelimiter | string  | 'graveaccent' | The delimiter for AsciiMath expressions. Options: 'graveaccent' (`` `...` ``), 'asciimath' (`\a...\a`). Must match the renderer. |
| nemethDelimiter | string  | 'at'          | The delimiter for Nemeth braille expressions. Options: 'at' (`@...@`), 'nemeth' (`\n...\n`). Must match the renderer. |

### Return value

Each entry in the returned array has the following shape:

| Field | Type   | Description                                                  |
| ----- | ------ | ------------------------------------------------------------ |
| level | number | Heading level (1–6)                                          |
| id    | string | URL-friendly slug, unique within the document               |
| text  | string | Plain heading text with inline markdown syntax stripped      |
