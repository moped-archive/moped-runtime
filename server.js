'use strict';

var express = require('express');

var validOptions = [
  'serializeUser',
  'deserializeUser'
];
function createServer(options) {
  if (!options) {
    options = {};
  }
  Object.keys(options).forEach(function (key) {
    if (validOptions.indexOf(key) === -1) {
      throw new Error('Invalid option "' + key + '", perhaps you meant to use one of: ' + validOptions.join(', '));
    }
  });
  var app = express.Router();
  app._serializeUser = options.serializeUser || user => user;
  app._deserializeUser = options.deserializeUser || user => user;
}

module.exports = createServer;
