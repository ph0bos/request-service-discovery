'use strict'

var EventEmitter = require('events').EventEmitter;
var util         = require('util');
var retry        = require('retry');
var unirest      = require('unirest');
var customErr    = require('custom-error-generator');
var Zoologist    = require('./zoologist');
var log          = require('./logger');

var REQUEST_TIMEOUT_MS = 5000;
var RETRY_DEFAULTS     = { retries: 3, minTimeout: 75, maxTimeout: 750 };
var METHODS_ALLOWED    = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"];

/**
 * Custom Errors
 */
var ArgumentError  = customErr('ArgumentError', Error);
var ZookeeperError = customErr('ZookeeperError', Error);

/**
 *
 */
function RequestServiceDiscovery(options) {
  var self = this;

  this.options = options || {};

  this.options.request          = {};
  this.options.request.timeout  = options.timeout || REQUEST_TIMEOUT_MS;

  this.options.retry            = {};
  this.options.retry.retries    = options.retries || RETRY_DEFAULTS.retries;
  this.options.retry.minTimeout = options.minTimeout || RETRY_DEFAULTS.minTimeout;
  this.options.retry.maxTimeout = options.maxTimeout || RETRY_DEFAULTS.maxTimeout;

  if (!this.options.basePath) {
    throw new ArgumentError('argument \'basePath\' is required');
  }

  if (!this.options.serviceName) {
    throw new ArgumentError('argument \'serviceName\' is required');
  }

  this.zoologist = new Zoologist(this.options);

  this.zoologist.on('connected', function(msg) {
    self.emit('connected', msg);
  });

  this.zoologist.on('disconnected', function(msg) {
    self.emit('disconnected', msg);
  });
};

util.inherits(RequestServiceDiscovery, EventEmitter);

module.exports = RequestServiceDiscovery;

/**
 * Perform a GET request
 *
 * @param uri The URI with which to make the request
 * @param options { "headers": {},  }
 * @param callback The callback to call upon completion
 */
RequestServiceDiscovery.prototype.get = function(uri, options, callback) {
  this._request('GET', uri, options, null, callback);
};

/**
 * Perform a PUT request
 *
 * @param uri The URI with which to make the request
 * @param headers The headers object to pass with the request
 * @param body The body of the request
 * @param callback The callback to call upon completion
 */
RequestServiceDiscovery.prototype.put = function(uri, options, body, callback) {
  this._request('PUT', uri, options, body, callback);
};

/**
 * Perform a POST request
 *
 * @param uri The URI with which to make the request
 * @param headers The headers object to pass with the request
 * @param body The body of the request
 * @param callback The callback to call upon completion
 */
 RequestServiceDiscovery.prototype.post = function(uri, options, body, callback) {
  this._request('POST', uri, options, body, callback);
};

/**
 * Perform a DELETE request
 *
 * @param uri The URI with which to make the request
 * @param headers The headers object to pass with the request
 * @param callback The callback to call upon completion
 */
RequestServiceDiscovery.prototype.delete = function(uri, options, callback) {
  this._request('DELETE', uri, options, null, callback);
};

/**
 * Perform a PATCH request
 *
 * @param uri The URI with which to make the request
 * @param headers The headers object to pass with the request
 * @param body The body of the request
 * @param callback The callback to call upon completion
 */
RequestServiceDiscovery.prototype.patch = function(uri, options, body, callback) {
  this._request('PATCH', uri, options, body, callback);
};

/**
 * Perform a POST request
 *
 * @param uri The URI with which to make the request
 * @param headers The headers object to pass with the request
 * @param callback The callback to call upon completion
 */
 RequestServiceDiscovery.prototype.head = function(uri, options, callback) {
  this._request('HEAD', uri, options, null, callback);
};


/**
 * Perform a Method request
 *
 * @param uri The URI with which to make the request
 * @param options { "method": {}, "headers": {},  }
 * @param callback The callback to call upon completion
 */
RequestServiceDiscovery.prototype.method = function(uri, options, callback) {
  if(!options || !options.method){
    return callback(new ArgumentError('A Method must be defined'));
  }

  var method = options.method.toUpperCase();
  if(METHODS_ALLOWED.indexOf(method) == -1){
    return callback(new ArgumentError('Unrecognised method:' + method));
  }

  this._request(method, uri, options, null, callback);
};

/**
 *
 */
RequestServiceDiscovery.prototype._request = function(method, uri, options, body, callback) {
  var self = this;
  var operation = retry.operation(self.options.retry);

  var headers, query = null;

  if (options && options.headers) {
    headers = options.headers;
  }

  if (options && options.query) {
    query = options.query;
  }

  operation.attempt(function(currentAttempt) {
    // Connection check
    if (!self._isZookeeperConnected()) {
      if (operation.retry(new ZookeeperError('client not connected'))) return;
      if (operation.attempts() >= self.options.retry.retries) return callback(new ZookeeperError('client not connected'));
    }

    // Get service instance
    self._getServiceInstance(function(err, data) {
      if (err && operation.retry(err)) return;
      if (err) return callback(err);

      if (self.options.verbose) {
        log.info(data, "service instance retrieved");
      }

      // Run request
      var request = self._applyDefaults(unirest(method, data.serviceUrl + '/' + uri, headers, body));

      if (query) {
        request.query(query);
      }

      if (self.options.verbose) {
        log.info({ method: method, url: data.serviceUrl + '/' + uri }, "performing request");
      }

      _end(request, function (err, res) {
        if (err && operation.retry(err)) return;
        callback(err, res);
      });
    });
  });
}

/**
 *
 */
RequestServiceDiscovery.prototype._isZookeeperConnected = function() {
  return this.zoologist.isConnected();
}

/**
 *
 */
RequestServiceDiscovery.prototype._getServiceInstance = function(callback) {
  this.zoologist.getInstance(callback);
}

/**
 * Decorate the provided request with default values.
 *
 * @param request A request object
 * @returns A decorated reuqest object
 */
RequestServiceDiscovery.prototype._applyDefaults = function(request) {
  request.timeout(this.options.request.timeout);
  return request;
}

/**
 * Callback wrapping function, to be invoked on request end.
 *
 * @param request A request object
 * @param callback the callback to invoke on completion
 */
function _end(request, callback) {
  request.end(function (res) {
    if (res.serverError) {
      log.error(res.body);
      return callback(res.body, null);
    }

    if (res.clientError) {
      return callback({ error: res.body, causedBy: res.error }, res);
    }

    callback(res.error, res);
  });
}
