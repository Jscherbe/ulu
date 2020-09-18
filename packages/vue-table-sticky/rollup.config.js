import commonjs from '@rollup/plugin-commonjs'; // Convert CommonJS modules to ES6
import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import buble from '@rollup/plugin-buble'; // Transpile/polyfill with reasonable browser support
import sass from 'rollup-plugin-sass';
import css from 'rollup-plugin-css-only';
export default {
  input: 'src/wrapper.js', // Path relative to package.json
  output: {
    name: 'TableSticky',
    exports: 'named',
  },
  plugins: [
    css(),
    sass(),
    commonjs(),
    vue({
      css: false, // Dynamically inject css as a <style> tag
      compileTemplate: true, // Explicitly convert template to render function
    }),
    buble({
      objectAssign: 'Object.assign'
    }), // Transpile to ES5
  ],
};