'use strict'

var retry     = require('retry');
var unirest   = require('unirest');
var zoologist = require('./zoologist');
var customErr = require('custom-error-generator');
var log       = require('./logger');

var REQUEST_DEFAULTS = { timeout: 5000 };
var RETRY_DEFAULTS   = { retries: 3, minTimeout: 75, maxTimeout: 750 };

/**
 * Custom Errors
 */
var ArgumentError = customErr('ArgumentError', Error);
var ZookeeperError = customErr('ZookeeperError', Error);

/**
 *
 */
function RequestServiceDiscovery(options) {
  this.options = options || {};

  if (!this.options.basePath) {
    throw new ArgumentError('argument \'basePath\' is required');
  }

  if (!this.options.serviceName) {
    throw new ArgumentError('argument \'serviceName\' is required');
  }

  zoologist.init(this.options);
};

var req = exports = module.exports = RequestServiceDiscovery;

/**
 * Perform a GET request
 *
 * @param uri The URI with which to make the request
 * @param headers The headers object to pass with the request
 * @param callback The callback to call upon completion
 */
RequestServiceDiscovery.prototype.get = function(uri, headers, callback) {
  this._request('GET', uri, headers, null, callback);
};

/**
 * Perform a PUT request
 *
 * @param uri The URI with which to make the request
 * @param headers The headers object to pass with the request
 * @param body The body of the request
 * @param callback The callback to call upon completion
 */
RequestServiceDiscovery.prototype.put = function(uri, headers, body, callback) {
  this._request('PUT', uri, headers, body, callback);
};

/**
 * Perform a POST request
 *
 * @param uri The URI with which to make the request
 * @param headers The headers object to pass with the request
 * @param body The body of the request
 * @param callback The callback to call upon completion
 */
 RequestServiceDiscovery.prototype.post = function(uri, headers, body, callback) {
  this._request('POST', uri, headers, body, callback);
};

/**
 * Perform a DELETE request
 *
 * @param uri The URI with which to make the request
 * @param headers The headers object to pass with the request
 * @param callback The callback to call upon completion
 */
RequestServiceDiscovery.prototype.delete = function(uri, headers, callback) {
  this._request('DELETE', uri, headers, null, callback);
};

/**
 * Perform a PATCH request
 *
 * @param uri The URI with which to make the request
 * @param headers The headers object to pass with the request
 * @param body The body of the request
 * @param callback The callback to call upon completion
 */
RequestServiceDiscovery.prototype.patch = function(uri, headers, body, callback) {
  this._request('PATCH', uri, headers, body, callback);
};

/**
 * Perform a POST request
 *
 * @param uri The URI with which to make the request
 * @param headers The headers object to pass with the request
 * @param callback The callback to call upon completion
 */
 RequestServiceDiscovery.prototype.head = function(uri, headers, callback) {
  this._request('HEAD', uri, headers, null, callback);
};

/**
 *
 */
RequestServiceDiscovery.prototype._request = function(method, uri, headers, body, callback) {
  var self = this;
  var operation = retry.operation(RETRY_DEFAULTS);

  operation.attempt(function(currentAttempt) {
    // Connection check
    if (!_isZookeeperConnected()) {
      if (operation.retry(new ZookeeperError('client not connected'))) return;
      if (operation.attempts() >= RETRY_DEFAULTS.retries) return callback(new ZookeeperError('client not connected'));
    }

    // Get service instance
    _getServiceInstance(function(err, data) {
      if (err && operation.retry(err)) return;
      if (err) return callback(err);

      // Run request
      var request = _applyDefaults(unirest(method, data.serviceUrl + '/' +uri, headers, body));

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
function _isZookeeperConnected() {
  return zoologist.isConnected();
}

/**
 *
 */
function _getServiceInstance(callback) {
  zoologist.getInstance(callback);
}

/**
 * Decorate the provided request with default values.
 *
 * @param request A request object
 * @returns A decorated reuqest object
 */
function _applyDefaults(request) {
  request.timeout(REQUEST_DEFAULTS.timeout);
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
    callback(res.error, res.body);
  });
}
