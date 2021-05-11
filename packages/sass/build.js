const fs = require('fs');
const sass = require('sass');
const result = sass.renderSync({
  file: "./scss/packages/all.scss",
  sourceMap: true,
  outFile: "styles.css" // For source maps
});
// console.log(result.map);
if (result) {
  fs.writeFileSync("./dist/styles.css", result.css.toString());
  fs.writeFileSync("./dist/styles.css.map", result.map.toString());
  console.error("Sass files built")
} else {
  console.error("Error parsing sass files")
}
