import { defineConfig } from 'vite';

// `@coseeing/see-mark` is consumed via a `file:` dependency, which npm
// installs as a symlink into the SeeMark repo — where a second copy of vue
// lives (SeeMark's devDependency). Without dedupe, SeeMark's `import 'vue'`
// resolves to that copy and the page ends up with two Vue reactivity
// instances, silently breaking cross-boundary reactivity (e.g. the custom
// `components` prop). Registry consumers never hit this — npm does not
// install a dependency's devDependencies — it is purely a linked-package
// development artifact. `dedupe` forces every `vue` import to resolve to
// this app's copy.
export default defineConfig({
  resolve: {
    dedupe: ['vue'],
  },
  // `global`: mathjax-full (a SeeMark dependency) references the Node.js
  // `global` at module scope, which doesn't exist in the browser — alias it
  // to `globalThis`. The __VUE_* feature flags are normally injected by
  // @vitejs/plugin-vue; this playground has no SFCs and skips the plugin, so
  // define them here to silence Vue's esm-bundler warning.
  define: {
    global: 'globalThis',
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
});
