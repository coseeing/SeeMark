import { defineConfig } from 'vite';

// SeeMark ships a CommonJS bundle. A normal registry install lets Vite
// auto-optimize it into ESM with no config; this playground needs two tweaks
// only because it consumes SeeMark through a `file:` symlink:
//
// - `optimizeDeps.include`: Vite skips CJS->ESM pre-bundling for symlinked
//   ("linked") packages, so without this the browser receives raw
//   `require(...)` / `exports.SeeMark = ...` and fails. Listing the subpath
//   forces esbuild to pre-bundle it like a real dependency.
// - `resolve.dedupe`: the symlinked SeeMark repo carries its own
//   node_modules/vue (a devDependency), so two Vue reactivity instances would
//   otherwise coexist and cross-boundary reactivity (the custom `components`
//   prop) would silently break. Registry consumers never hit either issue —
//   npm does not install a dependency's devDependencies.
export default defineConfig({
  optimizeDeps: {
    include: ['@coseeing/see-mark/vue'],
  },
  resolve: {
    dedupe: ['vue'],
  },
  // `global`: mathjax-full references the Node.js `global` at module scope,
  // which doesn't exist in the browser. The __VUE_* feature flags are
  // normally injected by @vitejs/plugin-vue; this playground has no SFCs and
  // skips the plugin, so define them here to silence Vue's esm-bundler warning.
  define: {
    global: 'globalThis',
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
});
