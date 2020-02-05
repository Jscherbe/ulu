const debug = require('../src/debug.js');
const { expect, assert } = require('chai');
const webpackTask = require('../src/task-webpack.js');


describe('Testing Gulp Init', function() {
  describe('Test Example', function() {
    it('should be a function', function(done) {
      assert.typeOf(webpackTask, 'function', 'webpack task is a function');
      done();
    });
  });
});