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

  it('calling get() when the zoologist is connected but no servvices are available should throw an error', function (done) {
    mockery.registerMock('./zoologist', _createConnectedZoologistMock());

    var instance = _createInstanceWithMissingService();

    instance.get('resource-name/1234', null, function(err, result) {
      err.should.be.defined;
      done();
    });
  });

  it('calling put() when the zoologist is not connected it should throw an error', function (done) {
    mockery.registerMock('./zoologist', _createDisconnectedZoologistMock());

    var instance = _createInstance();

    instance.put('resource-name/1234', null, null, function(err, result) {
      err.should.be.defined;
      done();
    });
  });

  it('calling post() when the zoologist is not connected it should throw an error', function (done) {
    mockery.registerMock('./zoologist', _createDisconnectedZoologistMock());

    var instance = _createInstance();

    instance.post('resource-name', null, null, function(err, result) {
      err.should.be.defined;
      done();
    });
  });

  it('calling delete() when the zoologist is not connected it should throw an error', function (done) {
    mockery.registerMock('./zoologist', _createDisconnectedZoologistMock());

    var instance = _createInstance();

    instance.delete('resource-name/1234', null, function(err, result) {
      err.should.be.defined;
      done();
    });
  });
});

function _createInstance() {
  return new RequestServiceDiscovery({
    basePath: 'services',
    serviceName: 'test/service/v1',
    connectionString: '127.0.0.1:2181'
  });
}

function _createInstanceWithMissingService() {
  return new RequestServiceDiscovery({
    basePath: 'services',
    serviceName: 'test/missing-service/v1',
    connectionString: '127.0.0.1:2181'
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
