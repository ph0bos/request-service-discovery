'use strict';

var bunyan = require('bunyan');

var log = bunyan.createLogger({ name: 'request-service-discovery' });

module.exports = log;
