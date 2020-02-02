// =============================================================================
// Documentation Script
// =============================================================================
// 
// Reference:       https://github.com/documentationjs/documentation/blob/master/docs/NODE_API.md

const cwd = process.cwd();
const documentation = require('documentation');
var toc = require('markdown-toc');
var streamArray = require('stream-array');
var vfs = require('vinyl-fs');
const fs = require('fs');
const { join } = require('path');

let options = {
  "title" : "Docs",
  "description" : "Automatically generated documentation",
  "includes" : ["index.js"],
  "html" : true,
  "htmlDir" : "/docs",
  "markdown" : true,
  "markdownFilename" : "readme.docs.md"
};
const debugFragment = "the main script or from prop ulu.docs (.includes <array>, .html <bool>, .md <bool>)"

// Get the current package.json and see if there is settings
// if not default to main entry point in package.
const userPackage = require(join(cwd, 'package.json'));

if (userPackage) {
  // Check for includes
  if (userPackage.ulu && userPackage.ulu.docs) {
    options = Object.assign({}, options, userPackage.ulu.docs);
    // If they didn't pass a title or description 
    // we will grab it from package.json
    if (!userPackage.ulu.docs.title) options.title = userPackage.name;
    if (!userPackage.ulu.docs.description) options.description = userPackage.description;
  // Default to the main script
  } else if (userPackage.main) {
    options.includes = [userPackage.main];
  }
} else {
  console.log('Create Docs: Unable to find package.json to get ' + debugFragment);
  return; // Exit
}

// Map the paths to the current directory
const includes = options.includes.map(p => join(cwd, p));

if (!includes.length) {
  console.log('Create Docs: No javascript files to include specified from ' + debugFragment);
  return; // Exit
}

let markdownPath = join(cwd, options.markdownFilename);
let htmlPath = join(cwd, options.htmlDir);

if (options.markdown) {
  documentation.build(includes, { shallow: false })
    .then(documentation.formats.md)
    .then(output => {
      fs.writeFileSync(markdownPath, templateMarkdown(output));
    });
}

function templateMarkdown(docs) {
return `
# ${ options.title }

${ options.description }

## Table of Contents

${ toc(docs).content }

---

${ docs }


`;
}

// if (options.html) {
//   documentation.build(includes)
//     .then(documentation.formats.html)
//     .then(output => {
//       if (!fs.existsSync(htmlPath)) {
//         fs.mkdirSync(htmlPath);
//       }
//       streamArray(output).pipe(vfs.dest(htmlPath));
//     });
// }