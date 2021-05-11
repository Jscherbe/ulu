// =============================================================================
// Create Docs
// =============================================================================
// 
// Description:     Will create standardized documentation for a package in Ulu.
//                  - Generate markdown docs within package folder (for local/GitHub reference)
//                  - Generate HTML documentation site for package in ulu/docs/
//                  - Create a index.md file with links to all directories in ulu/docs/
//                  
// Reference:       https://github.com/documentationjs/documentation/blob/master/docs/NODE_API.md
// 
console.log('CREATING DOCS -----');
const cwd = process.cwd();
const parsers = require('./src/parsers/index');
const debug = require('./src/debug.js');
const urlize = require('./src/urlize.js');
const { join } = require('path');
let defaults = {
  "title" : "Docs",
  "description" : "Automatically generated documentation",
  "includes" :  null,
  "html" : true,
  "markdown" : true,
  "markdownFilename" : "readme.docs.md",
  "syntax" : "js"
};
const options = {};

// Get the current package.json and see if there is settings
// if not default to main entry point in package.
const package = require(join(cwd, 'package.json'));

if (package) {
  // Check for includes
  if (package.ulu && package.ulu.docs) {
    const docOps = package.ulu.docs;
    Object.assign(options, defaults, docOps);
    // If they didn't pass a title or description 
    // we will grab it from package.json
    if (!docOps.title) options.title = package.name;
    if (!docOps.description) options.description = package.description;
  }
} else {
  debug.error('Unable to find package.json for project ', cwd);
  return; // Exit
}


// Route to appropriate documentation generator based on type
const { syntax } = options;
const parser = parsers[syntax];
if (!parser) {
  debug.error('No Matching parser for this syntax', syntax);
  return;
}

const sources = options.includes.map(include => join(cwd, include));

if (!sources.length) {
  debug.error(
    'No files to include', 
    'Package.json is missing "ulu.docs.includes" array (relative paths)'
  );
  return; // Exit
}

// Output Path
const docsDirectory = join("../../", "docs");
const paths = {
  cwd, 
  sources, 
  docs: docsDirectory, 
  output: {
    html: join(docsDirectory, urlize(options.title)),
    markdown: options.markdownFilename ? join(cwd, options.markdownFilename) : null
  } 
};

// Initialization of documentation script runs once
// user can use the parse function outside of initialization to re-parse
parse();

/**
 * Wrapped so it can be used multiple times
 * - Example sass development the docs are regenerated on styles changes
 */
function parse() {
  parser(paths, options);
}

exports.parse = parse;


