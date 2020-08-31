// Grab configuration
const config = require('ulu.config.js');
// Pass it to gulp-init which will add tasks
// The user can add their own tasks and configure 
// how out of the box plugins work. All plugins
// will accept the same global config
module.exports = require("@ulu/gulp-init").init(config);