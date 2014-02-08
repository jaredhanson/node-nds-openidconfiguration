/* global describe, it, expect */

var path = require('path')
  , fs = require('fs')
  , resolve = require('../lib/resolve')
  , MODULE_PATH = path.resolve(__dirname, '../lib/resolve');


describe('resolve', function() {
  
  it('should export a setup function', function() {
    expect(resolve).to.be.a('function');
  });
  
});
