'use strict';

// Compile latest version of sass
const fs = require('fs');
const sass = require('sass');
const { join } = require('path');
const file = join(__dirname, "/assets/scss/main.scss");
const result = sass.renderSync({
  file,
  sourceMap: true,
  outFile: "main.css" // For source maps
});
// console.log(result.map);
if (result) {
  fs.writeFileSync(join(__dirname, "/assets/css/main.css"), result.css.toString());
  fs.writeFileSync(join(__dirname, "/assets/css/main.css.map"), result.map.toString());
  console.error("Sass files built");
} else {
  console.error("Error parsing sass files");
}


module.exports = require('./dist').default;
