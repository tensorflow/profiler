const {nodeResolve} = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

module.exports = {
  plugins: [
    nodeResolve({
      mainFields: ['browser', 'es2015', 'module', 'jsnext:main', 'main'],
    }),
    commonjs(),
  ],
  output: {
    strict: false,
    format: 'iife',
    sourcemap: false,
  },
  onwarn: (warning, warn) => {
    // Angular code with rollup checks `this` for globals.
    // rollup warns that it
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return;
    }
    warn(warning);
  }
};
