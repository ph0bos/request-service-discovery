'use strict'

var EventEmitter = require('events').EventEmitter;
var util         = require('util');
var retry        = require('retry');
var unirest      = require('unirest');
var customErr    = require('custom-error-generator');
var uuid         = require('uuid');
var Zoologist    = require('./zoologist');
var log          = require('./logger');
var check        = require('check-types');

var REQUEST_TIMEOUT_MS              = 5000;
var RETRY_DEFAULTS                  = { retries: 3, minTimeout: 75, maxTimeout: 750 };
var METHODS_ALLOWED                 = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"];
var DEFAULT_PROVIDER_STRATEGY       = 'RoundRobin';
var DEFAULT_CORRELATION_HEADER_NAME = 'X-CorrelationID';
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
  this.options.retry.retries    = (options.retries || options.retries >= 0) ? options.retries : RETRY_DEFAULTS.retries;
  this.options.retry.minTimeout = options.minTimeout || RETRY_DEFAULTS.minTimeout;
  this.options.retry.maxTimeout = options.maxTimeout || RETRY_DEFAULTS.maxTimeout;

  this.options.providerStrategy = options.providerStrategy || DEFAULT_PROVIDER_STRATEGY;

  this.options.correlationHeaderName = options.correlationHeaderName || DEFAULT_CORRELATION_HEADER_NAME;

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
  check.assert.string(uri, 'uri [string] must be provided');
  check.assert.maybe.object(options, 'options [object] must be provided');
  check.assert.function(callback, 'callback [function] must be provided');

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
  check.assert.string(uri, 'uri [string] must be provided');
  check.assert.maybe.object(options, 'options [object] must be provided');
  check.assert.maybe.object(body, 'body [object] must be provided');
  check.assert.function(callback, 'callback [function] must be provided');

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
  check.assert.string(uri, 'uri [string] must be provided');
  check.assert.maybe.object(options, 'options [object] must be provided');
  check.assert.maybe.object(body, 'body [object] must be provided');
  check.assert.function(callback, 'callback [function] must be provided');

  this._request('POST', uri, options, body, callback);
};

/**
 * Perform a DELETE request
 *
 * @param uri The URI with which to make the request
 * @param headers The headers object to pass with the request
 * @param callback The callback to call upon completion
 */
RequestServiceDiscovery.prototype.delete = function(uri, options, body, callback) {
  check.assert.string(uri, 'uri [string] must be provided');
  check.assert.maybe.object(options, 'options [object] must be provided');
  check.assert.function(callback, 'callback [function] must be provided');

  this._request('DELETE', uri, options, body, callback);
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
  check.assert.string(uri, 'uri [string] must be provided');
  check.assert.maybe.object(options, 'options [object] must be provided');
  check.assert.maybe.object(body, 'body [object] must be provided');
  check.assert.function(callback, 'callback [function] must be provided');

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
  check.assert.string(uri, 'uri [string] must be provided');
  check.assert.maybe.object(options, 'options [object] must be provided');
  check.assert.function(callback, 'callback [function] must be provided');

  this._request('HEAD', uri, options, null, callback);
};


/**
 * Perform a Method request
 *
 * @param uri The URI with which to make the request
 * @param options { "method": {}, "headers": {},  }
 * @param callback The callback to call upon completion
 */
RequestServiceDiscovery.prototype.method = function(uri, options, body, callback) {
  check.assert.string(uri, 'uri [string] must be provided');
  check.assert.maybe.object(options, 'options [object] must be provided');
  check.assert.function(callback, 'callback [function] must be provided');

  if(!options || !options.method){
    return callback(new ArgumentError('A method must be defined'));
  }

  var method = options.method.toUpperCase();

  if(METHODS_ALLOWED.indexOf(method) == -1){
    return callback(new ArgumentError('Unrecognised method:' + method));
  }

  this._request(method, uri, options, body, callback);
};

/**
* Close this Client Instance
*/
RequestServiceDiscovery.prototype.close = function() {
  if (this.options !== null && this.options.verbose) {
    log.info("client closed");
  }

  this.zoologist.close();
};

/**
 *
 */
RequestServiceDiscovery.prototype.request = function(method, uri, options, body, callback) {
  this._request(method, uri, options, body, callback);
};

/**
 *
 */
RequestServiceDiscovery.prototype._request = function(method, uri, options, body, callback) {
  var self    = this;
  var options = options || {};
  var query   = null;
  var headers = {};

  var operation = retry.operation(self.options.retry);

  if (options && options.headers) {
    headers = options.headers;
  }

  if (options && options.query) {
    query = options.query;
  }

  if (options && !options.correlationId) {
    options.correlationId = uuid.v4();
  }

  headers[self.options.correlationHeaderName] = options.correlationId;

  var requestLog = log.child({ correlationId: options.correlationId }, true);

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
        requestLog.info(data, "service instance retrieved");
      }

      // Run request
      var request = self._applyDefaults(unirest(method, data.serviceUrl + '/' + uri, headers, body));

      if (query) {
        request.query(query);
      }

      if (self.options.verbose) {
        requestLog.info({ method: method, url: data.serviceUrl + '/' + uri }, "performing request");
      }

      _end(request, requestLog, function (err, res) {
        if (err && !err.isClientError && operation.retry(err)) return;
        if (err) {
          err.data = { service: data, method: method, uri: uri, url: data.serviceUrl + '/' + uri };

          if (self.options.verbose) {
            requestLog.error({ error: err }, 'error performing request');
          }
        }

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
function _end(request, requestLog, callback) {
  request.end(function (res) {
    if (res.serverError) {
      return callback(res.body, null);
    }

    if (res.clientError) {
      return callback({ error: res.body, causedBy: res.error, isClientError: true }, res);
    }

    callback(res.error, res);
  });
}
