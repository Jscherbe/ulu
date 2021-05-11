const sassdoc = require('sassdoc');
const debug = require('../debug.js');
// const theme = require('@ulu/sassdoc-theme');

module.exports = function parser(paths, options) {
  if (paths.sources.length > 1) {
    debug.error('Only one scss path can be used for sassdocs, using first')
  }
  const parseOptions = { 
    verbose: true,
    dest: paths.output.html,
    theme: '@ulu/sassdoc-theme'
  };
  sassdoc(paths.sources[0], parseOptions)
    .then(() => {
      debug.message('Built SCSS Documention for ' + options.title);
    });
};