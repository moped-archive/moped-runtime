'use strict';

var express = require('express');

function defaultSerializer(user) { return user; }

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
  app._serializeUser = options.serializeUser || defaultSerializer;
  app._deserializeUser = options.deserializeUser || defaultSerializer;
}

module.exports = createServer;
