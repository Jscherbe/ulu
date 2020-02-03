// =============================================================================
// Documentation Script
// =============================================================================
// 
// Reference:       https://github.com/documentationjs/documentation/blob/master/docs/NODE_API.md

const cwd = process.cwd();
const documentation = require('documentation');
const toc = require('markdown-toc');
const streamArray = require('stream-array');
const vfs = require('vinyl-fs');
const fs = require('fs');
const debug = require('./src/debug.js');
const urlize = require('./src/urlize.js');
const { join } = require('path');
const templateMarkdown = require('./src/markdown-template.js');
const updateGlobalIndex = require('./src/update-global-index.js');
const parseOptions = {
  shallow: false
};
let options = {
  "title" : "Docs",
  "description" : "Automatically generated documentation",
  "includes" :  null,
  "html" : true,
  "htmlDir" : false,
  "markdown" : true,
  "markdownFilename" : "readme.docs.md"
};

// Get the current package.json and see if there is settings
// if not default to main entry point in package.
const package = require(join(cwd, 'package.json'));

if (package) {
  // Check for includes
  if (package.ulu && package.ulu.docs) {
    const docOps = package.ulu.docs;
    options = Object.assign({}, options, docOps);
    // If they didn't pass a title or description 
    // we will grab it from package.json
    if (!docOps.title) options.title = package.name;
    if (!docOps.description) options.description = package.description;
  // Default to the main script
  } else if (package.main) {
    options.includes = [package.main];
  }
} else {
  debug.error('Unable to find package.json for project ', cwd);
  return; // Exit
}

// Map the paths to the current directory
const includes = options.includes.map(p => join(cwd, p));

if (!includes.length) {
  debug.error(
    'No javascript files to include', 
    'Package.json is missing "main" or "ulu.docs.includes"'
  );
  return; // Exit
}

const markdownPath = join(cwd, options.markdownFilename);

if (options.markdown) {
  documentation.build(includes, parseOptions)
    .then(documentation.formats.md)
    .then(docs => {
      fs.writeFileSync(
        markdownPath, 
        templateMarkdown(options.title, options.description, toc(docs).content, docs)
      );
      debug.message('Built Markdown for ' + options.title);
    });
}

// If it had a value the user is choosing to place documents 
// somewhere other than the global documentation area. If thats
// not the case we are going to make the path to the global folder

const globalPath = join("../../", "docs");
const htmlPath = join(globalPath, urlize(options.title));

if (options.html) {
  documentation.build(includes, parseOptions)
    .then(documentation.formats.html)
    .then(docs => {
      if (!fs.existsSync(htmlPath)) {
        fs.mkdirSync(htmlPath);
      }
      streamArray(docs).pipe(vfs.dest(htmlPath));
      debug.message('Built HTML for ' + options.title);
      debug.message('Creating global docs index');
      updateGlobalIndex(globalPath);
    });
}

