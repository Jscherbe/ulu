const webpack = require('webpack');

module.exports = function(config) {
  return function webpackParse(done) {
    console.log(typeof config);
    done();
  };
};