// =============================================================================
// Gulp Initialization Script
// =============================================================================

const path = require('path');
const _ = require('lodash');
const chalk = require('chalk');
const gulp = require('gulp');

const debug = require('./debug');
const defaults = require('./defaults.js');
const noEnv = !process.env.NODE_ENV;
const env = process.env.NODE_ENV || "production";

debug.message(noEnv, 'The environment variable "NODE_ENV" is not setup on this server/computer. Defaulting to "production"...');

/**
 *   Gulp Initialization function, used in gulpfile
 *   @param  {string}   cwd       Current Working Directory (from gulpfile.js)
 *   @param  {object}   config    The users configuration
 *   @return {object}             Object that gulpfile exports (for task definitions)
 */
function init(config = defaults) {

  debug.warning(!config.settings, 'You are missing the required "config.settings" property in your config');

  const defaultTasks = [
    require('./task-webpack.js')(config)
  ];
  // Merge Settings
  const settings = _.merge({}, defaults, config, config.env ?config.env[env]);

  debug.message(true, "Merged configuration settings: ", settings);



  return {
    // default: gulp.series(require('./task-webpack.js'))
    default() {
      console.log('success');
    }
  };
}

module.exports = init;