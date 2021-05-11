// Have chokidar watch scss for changes and rebuild docs site
const chokidar = require('chokidar');
const { join } = require("path");
const sassDir = join(__dirname, "/scss");
const watcher = chokidar.watch(`${ sassDir }/**/*.scss`);
// Note this runs it for the first time before returning the interface
const docs = require('@ulu/create-docs');
// then Run again if there are changes
watcher.on('change', docs.parse);