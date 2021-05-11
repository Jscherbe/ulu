/**
 *   Turns a string into a safe and pretty URL
 *   @param  {string} string
 *   @return {string}
 */
module.exports = function(string) {
  var newString;

  // Do the regex
  string = string.replace(/^[^-_a-zA-Z]+/, '').replace(/^-(?:[-0-9]+)/, '-');
  newString = string && string.replace(/[^-_a-zA-Z0-9]+/g, '-');
  return newString.toLowerCase();
};