// Lazy loader for MathJax's AsciiMath input jax.
//
// MathJax's AsciiMath is a legacy shim that crashes under strict mode.
// ESM-strict bundlers (Vite, esbuild) would hit that crash AT IMPORT TIME if
// these modules were required at the top level — enough to break `import
// '@coseeing/see-mark'` on startup. Requiring them lazily, on the first
// conversion, means merely importing SeeMark (and rendering LaTeX/Nemeth)
// never touches the shim. Converting AsciiMath under such a bundler still
// throws; see the README (`enableAsciimath: false` avoids it).
//
// CommonJS on purpose: an ESM `import` cannot be deferred like this. Rollup's
// commonjs plugin is told (`ignore` in rollup.config.mjs) to leave these
// requires in place.

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
