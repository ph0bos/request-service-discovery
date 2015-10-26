'use strict';

var chai   = require('chai').should();
var mocha  = require('mocha');
var sinon  = require('sinon');

var RequestServiceDiscovery = require('../lib/request-service-discovery');
var instance = null;

describe('request-service-discovery', function () {
  before(function(done) {
    instance = new RequestServiceDiscovery({
      basePath: 'services',
      serviceName: 'test/service/v1',
      connectionString: '127.0.0.1:2181'
    });

    done();
  });

  after(function(done) {
    done();
  });

  it('calling get() should throw an error', function (done) {
    instance.get('resource-name/1234', null, function(err, result) {
      err.should.be.defined;
      done();
    });
  });
});
