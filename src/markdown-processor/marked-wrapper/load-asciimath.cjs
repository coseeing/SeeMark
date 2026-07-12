// Lazy loader for MathJax's AsciiMath input jax.
//
// mathjax-full implements AsciiMath through a MathJax-v2 legacy shim that
// calls `arguments.callee` while bootstrapping its object system — code that
// throws under strict mode. CommonJS consumers (Node, webpack) evaluate it in
// sloppy mode and work, but ESM-strict bundlers (Vite, esbuild) throw AT
// IMPORT TIME if these modules are required at the top level, which used to
// make `import '@coseeing/see-mark/*'` crash any Vite app on startup.
//
// SeeMark ships a CommonJS bundle, but bundlers (Vite, esbuild) pre-bundle
// even CJS deps by converting them to always-strict ESM, so the crash still
// applies to bundler consumers. Keeping the requires inside the function
// defers that evaluation to the first actual AsciiMath conversion: merely
// importing SeeMark (and rendering LaTeX/Nemeth) never touches the shim.
// Converting AsciiMath under such a bundler still throws — an upstream
// mathjax-full limitation, documented in the README; `enableAsciimath: false`
// avoids it entirely.
//
// This file is CommonJS on purpose: ESM `import` cannot be deferred, and
// rollup's commonjs plugin is configured (`ignore` in rollup.config.mjs) to
// leave these requires in place instead of hoisting them into top-level
// imports.

let cached = null;

const loadAsciimathRuntime = () => {
  if (!cached) {
    // The legacy shim's strict-mode crash under a bundler gets one actionable
    // message instead of a cryptic internal error.
    try {
      const { AsciiMath } = require('mathjax-full/js/input/asciimath.js');
      const {
        HTMLDocument,
      } = require('mathjax-full/js/handlers/html/HTMLDocument.js');
      const {
        liteAdaptor,
      } = require('mathjax-full/js/adaptors/liteAdaptor.js');
      const { STATE } = require('mathjax-full/js/core/MathItem.js');
      const {
        SerializedMmlVisitor,
      } = require('mathjax-full/js/core/MmlTree/SerializedMmlVisitor.js');

      const asciimath = new AsciiMath();
      const html = new HTMLDocument('', liteAdaptor(), { InputJax: asciimath });
      const visitor = new SerializedMmlVisitor();

      cached = {
        html,
        STATE,
        toMathML: (node) => visitor.visitTree(node, html),
      };
    } catch (error) {
      throw new Error(
        'SeeMark: AsciiMath is unavailable in this environment (MathJax legacy shim limitation — ' +
          `${error.message}). Set enableAsciimath: false; see the README bundler notes.`
      );
    }
  }
  return cached;
};

module.exports = loadAsciimathRuntime;
