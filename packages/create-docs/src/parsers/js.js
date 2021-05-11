const debug = require('../debug.js');
const templateMarkdown = require('../markdown-template.js');
const updateGlobalIndex = require('../update-global-index.js');
const documentation = require('documentation');
const toc = require('markdown-toc');
const streamArray = require('stream-array');
const vfs = require('vinyl-fs');
const fs = require('fs');
const parseOptions = {
  shallow: false
};

module.exports = function parser(paths, options) {
  if (options.markdown) {
    documentation.build(paths.sources, parseOptions)
      .then(documentation.formats.md)
      .then(docs => {
        fs.writeFileSync(
          paths.output.markdown, 
          templateMarkdown(options.title, options.description, toc(docs).content, docs)
        );
        debug.message('Built Markdown for ' + options.title);
      });
  }

  // If it had a value the user is choosing to place documents 
  // somewhere other than the global documentation area. If thats
  // not the case we are going to make the path to the global folder
  if (options.html) {
    documentation.build(paths.sources, parseOptions)
      .then(resp => {
        return documentation.formats.html(resp, { 
          theme: "node_modules/@ulu/create-docs/node_modules/documentation-theme-light"
        });
      })
      .then(docs => {
        if (!fs.existsSync(paths.output.html)) {
          fs.mkdirSync(paths.output.html);
        }
        streamArray(docs).pipe(vfs.dest(paths.output.html));
        debug.message('Built HTML for ' + options.title);
        debug.message('Creating global docs index');
        updateGlobalIndex(paths.docs);
      });
  }
}