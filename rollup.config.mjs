import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';

const sharedPlugins = [
  commonjs({
    requireReturnsDefault: (id) => {
      return id === 'html-react-parser';
    },
    extensions: ['.js', '.cjs'],
    // Leave load-asciimath.cjs's requires call-time instead of hoisting them
    // to top-level imports — MathJax's AsciiMath shim must not be evaluated
    // when the bundle is merely imported (see load-asciimath.cjs).
    ignore: (id) => id.startsWith('mathjax-full/'),
  }),
  nodeResolve(),
  babel({
    babelHelpers: 'bundled',
    extensions: ['.js', '.jsx'],
    exclude: 'node_modules/**',
  }),
];

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'lib/see-mark.cjs',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: sharedPlugins,
    jsx: 'react',
    external: [/node_modules/],
  },
  {
    input: 'src/entries/html.js',
    output: [
      {
        file: 'lib/see-mark-html.cjs',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: sharedPlugins,
    external: [/node_modules/],
  },
  {
    input: 'src/entries/vue.js',
    output: [
      {
        file: 'lib/see-mark-vue.cjs',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: sharedPlugins,
    external: [/node_modules/],
  },
];
