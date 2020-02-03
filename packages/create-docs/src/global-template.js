const urlize = require('./urlize.js');
/**
 *   Template for the global docs director index.md
 *   @param  {array} directories  
 *   @return {string}
 */
module.exports = function templateMarkdown(directories) {
  const links = directories.map(d => `[${ d }](${ urlize(d) }/index.html)`);
  return `
# Ulu Documentation 

- ${ links.join('\n- ') }

`;
}