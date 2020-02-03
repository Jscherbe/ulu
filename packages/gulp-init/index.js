/**
 *   @type {function}
 */
exports.init = require('./src/init.js');

/**
 *   Expose all initialization tasks so user can use them on their own
 *   @type {Object.<function>}
 */
exports.tasks = {
  webpack: requie('./src/task-webpack.js')
};