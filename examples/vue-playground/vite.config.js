import { defineConfig } from 'vite';

// `@coseeing/see-mark` is consumed via a `file:` dependency, which npm
// installs as a symlink. Vite's dependency crawler treats symlinked
// ("linked") packages as local source and skips its default CJS->ESM
// interop, so the browser receives the raw CommonJS build
// (`require(...)` / `exports.SeeMark = ...`) as an ES module and fails
// with "does not provide an export named 'SeeMark'".
//
// Explicitly listing it in optimizeDeps.include forces esbuild to
// pre-bundle it (with CJS interop) like a normal dependency.
export default defineConfig({
  optimizeDeps: {
    include: ['@coseeing/see-mark/vue'],
  },
  // mathjax-full (a SeeMark dependency) references the Node.js `global`
  // global at module scope, which doesn't exist in the browser. Standard
  // Vite workaround: alias it to `globalThis`.
  define: {
    global: 'globalThis',
  },
});
