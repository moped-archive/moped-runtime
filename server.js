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
  if (options.serializeUser) {
    createServer._serializeUser = options.serializeUser;
  }
  if (options.deserializeUser) {
    createServer._deserializeUser = options.deserializeUser;
  }
  Object.keys(options).forEach(function (key) {
    if (validOptions.indexOf(key) === -1) {
      throw new Error('Invalid option "' + key + '", perhaps you meant to use one of: ' + validOptions.join(', '));
    }
  });
  return express.Router();
}
createServer._serializeUser = user => user;
createServer._deserializeUser = user => user;

module.exports = createServer;
