const fs = require('fs');
const { join } = require('path');
const debug = require('./debug.js');
const template = require('./global-index-template.js');
/**
 *   function updates the global docs index file by
 *   parsing the folder post doc generation and creating
 *   a new index file with links to each.
 *   @param  {string}   globalDir   Path to the global docs
 */
module.exports = function(globalDir) {
  const dirs = fs.readdirSync(globalDir).filter(d => fs.lstatSync(join(globalDir, d)).isDirectory());
  fs.writeFileSync(join(globalDir, "index.md"), template(dirs));
}