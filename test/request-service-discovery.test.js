'use strict';

var chai    = require('chai').should();
var mocha   = require('mocha');
var sinon   = require('sinon');
var mockery = require('mockery');

var RequestServiceDiscovery = require('../lib/request-service-discovery');

describe('request-service-discovery', function () {
  before(function(done) {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    });

    done();
  });

  afterEach(function(done) {
    mockery.disable();
    done();
  });

  it('calling get() when the zoologist is not connected it should throw an error', function (done) {
    mockery.registerMock('./zoologist', _createDisconnectedZoologistMock());

    var instance = _createInstance();

    instance.get('resource-name/1234', null, function(err, result) {
      err.should.be.defined;
      done();
    });
  });

  it('calling get() when the zoologist is connected but no services are available should throw an error', function (done) {
    mockery.registerMock('./zoologist', _createConnectedZoologistMock());

    var instance = _createInstanceWithMissingService();

    instance.get('resource-name/1234', null, function(err, result) {
      err.should.be.defined;
      done();
    });
  });

  it('calling get() with a missing uri argument should throw an error', function (done) {
    var instance = _createInstance();

    (function() { instance.get(null, function(err, result) {}) }).should.throw('uri [string] must be provided');
    done();
  });

  it('calling get() with a missing options argument should throw an error', function (done) {
    var instance = _createInstance();

    (function() { instance.get('resource-name/1234', function(err, result) {}) }).should.throw('options [object] must be provided');
    done();
  });

  it('calling get() with a missing options argument should throw an error', function (done) {
    var instance = _createInstance();

    (function() { instance.get('resource-name/1234', null) }).should.throw('callback [function] must be provided');
    done();
  });

  it('calling put() when the zoologist is not connected it should throw an error', function (done) {
    mockery.registerMock('./zoologist', _createDisconnectedZoologistMock());

    var instance = _createInstance();

    instance.put('resource-name/1234', null, null, function(err, result) {
      err.should.be.defined;
      done();
    });
  });

  it('calling put() with a missing uri argument should throw an error', function (done) {
    var instance = _createInstance();

    (function() { instance.put(null, null, function(err, result) {}) }).should.throw('uri [string] must be provided');
    done();
  });

  it('calling put() with a missing callback argument should throw an error', function (done) {
    var instance = _createInstance();

    (function() { instance.put('resource-name/1234', null, null) }).should.throw('callback [function] must be provided');
    done();
  });

  it('calling put() with a missing body argument should throw an error', function (done) {
    var instance = _createInstance();

    (function() { instance.put('resource-name/1234', null, function(err, result) {}) }).should.throw('body [object] must be provided');
    done();
  });

  it('calling post() when the zoologist is not connected it should throw an error', function (done) {
    mockery.registerMock('./zoologist', _createDisconnectedZoologistMock());

    var instance = _createInstance();

    instance.post('resource-name', null, null, function(err, result) {
      err.should.be.defined;
      done();
    });
  });

  it('calling post() with a missing uri argument should throw an error', function (done) {
    var instance = _createInstance();

    (function() { instance.post(null, null, function(err, result) {}) }).should.throw('uri [string] must be provided');
    done();
  });

  it('calling post() with a missing callback argument should throw an error', function (done) {
    var instance = _createInstance();

    (function() { instance.post('resource-name/1234', null, null) }).should.throw('callback [function] must be provided');
    done();
  });

  it('calling post() with a missing body argument should throw an error', function (done) {
    var instance = _createInstance();

    (function() { instance.post('resource-name/1234', null, function(err, result) {}) }).should.throw('body [object] must be provided');
    done();
  });

  it('calling delete() when the zoologist is not connected it should throw an error', function (done) {
    mockery.registerMock('./zoologist', _createDisconnectedZoologistMock());

    var instance = _createInstance();

    instance.delete('resource-name/1234', null, function(err, result) {
      err.should.be.defined;
      done();
    });
  });

  it('calling delete() with a missing uri argument should throw an error', function (done) {
    var instance = _createInstance();

    (function() { instance.delete(null, function(err, result) {}) }).should.throw('uri [string] must be provided');
    done();
  });

  it('calling delete() with a missing options argument should throw an error', function (done) {
    var instance = _createInstance();

    (function() { instance.delete('resource-name/1234', function(err, result) {}) }).should.throw('options [object] must be provided');
    done();
  });

  it('calling delete() with a missing options argument should throw an error', function (done) {
    var instance = _createInstance();

    (function() { instance.delete('resource-name/1234', null) }).should.throw('callback [function] must be provided');
    done();
  });

  it('calling method() when the no object method is passed in should throw an error', function (done) {
    mockery.registerMock('./zoologist', _createDisconnectedZoologistMock());

    var instance = _createInstance();

    instance.method('resource-name/1234', null, function(err, result) {
      err.should.be.defined;
      done();
    });
  });

  it('calling method() when no valid method is passed in should throw an error', function (done) {
    mockery.registerMock('./zoologist', _createDisconnectedZoologistMock());

    var instance = _createInstance();

    instance.method('resource-name/1234', {method: "BURST"}, function(err, result) {
      err.should.be.defined;
      done();
    });
  });

  it('calling method() when the zoologist is not connected it should throw an error', function (done) {
    mockery.registerMock('./zoologist', _createDisconnectedZoologistMock());

    var instance = _createInstance();

    instance.method('resource-name/1234', {method: "GET"}, function(err, result) {
      err.should.be.defined;
      done();
    });
  });

  it('calling method() with a missing uri argument should throw an error', function (done) {
    var instance = _createInstance();

    (function() { instance.method(null, function(err, result) {}) }).should.throw('uri [string] must be provided');
    done();
  });

  it('calling method() with a missing options argument should throw an error', function (done) {
    var instance = _createInstance();

    (function() { instance.method('resource-name/1234', function(err, result) {}) }).should.throw('options [object] must be provided');
    done();
  });

  it('calling method() with a missing options argument should throw an error', function (done) {
    var instance = _createInstance();

    (function() { instance.method('resource-name/1234', null) }).should.throw('callback [function] must be provided');
    done();
  });
});

function _createInstance() {
  return new RequestServiceDiscovery({
    basePath: 'services',
    serviceName: 'test/service/v1',
    connectionString: '127.0.0.1:2181',
    verbose: false
  });
}

function _createInstanceWithMissingService() {
  return new RequestServiceDiscovery({
    basePath: 'services',
    serviceName: 'test/missing-service/v1',
    connectionString: '127.0.0.1:2181',
    verbose: false
  });
}

function _createDisconnectedZoologistMock() {
  return {
    init: function() {
    },
    isConnected: function() {
      return false;
    }
  };
}

function _createConnectedZoologistMock() {
  return {
    init: function() {
    },
    isConnected: function() {
      return true;
    }
  };
}
