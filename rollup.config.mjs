import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'lib/see-mark.cjs',
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [commonjs()],
};
