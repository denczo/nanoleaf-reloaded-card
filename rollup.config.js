import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/nanoleaf-card.js',
  output: {
    file: 'dist/nanoleaf-card.js',
    format: 'iife',
    name: 'NanoleafCard',
  },
  plugins: [resolve(), terser()],
};
