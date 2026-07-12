import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';

const sharedPlugins = [
  commonjs({
    requireReturnsDefault: (id) => {
      return id === 'html-react-parser';
    },
    extensions: ['.js', '.cjs'],
    // Keep load-asciimath.cjs's requires as literal, call-time requires
    // instead of hoisting them to top-level imports: MathJax's AsciiMath
    // legacy shim throws under strict mode, so it must not be evaluated
    // when the bundle itself is merely imported (see load-asciimath.cjs).
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
