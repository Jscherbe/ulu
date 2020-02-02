// Expose the main init function,
// responsible for accepting user configuration and
// setting up gulp task. Users will have the ability
// to configure the canned tasks or remove or override 
// them. They will also have the ability to add their 
// own custom tasks to initialize.
exports.init = requie('./src/init.js');

// Expose all tasks so user can use them on their own
exports.tasks = {
  webpack: requie('./src/task-webpack.js')
};