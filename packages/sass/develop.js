// Have chokidar watch scss for changes and rebuild docs site
const chokidar = require('chokidar');
const browserSync = require("browser-sync");
const { join } = require("path");
const sassDir = join(__dirname, "/scss", "/**/*.scss");
const watcher = chokidar.watch(sassDir);
const browser = browserSync.create();
// Note this runs it for the first time before returning the interface
const docs = require('@ulu/create-docs');
// Once the documentation has finished generating
docs.firstParse.then(() => {
  // Start browser and watch for changes
  browser.init({
    server: docs.paths.output.html
  });
  watcher.on('change', () => {
    docs.parse().then(() => {
      browser.reload();
    });
  });
})



