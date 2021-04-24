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
    // Typescript decorator transpiled code checks `this` in case there are
    // global decorator. Rollup warns `this` is undefined.
    // This is safe to ignore.
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return;
    }
    warn(warning);
  }
};
