import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'lib/see-mark.cjs',
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx'],
      exclude: 'node_modules/**',
    }),
  ],
  jsx: 'react',
};
