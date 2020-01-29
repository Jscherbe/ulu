const { tasks } = require("@ulu/gulp-tasks");

exports.init = function init() {
  console.log('package working');
  console.log(tasks());
};