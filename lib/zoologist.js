'use strict';

/**
 * Dependencies
 */
var zoologist = require('zoologist');

function Zoo () {
};

var zoo = module.exports = exports = new Zoo;

Zoo.prototype.init = function (options) {
  // Zoologist Setup
  var Zoologist               = zoologist.Zoologist;
  var ServiceDiscoveryBuilder = zoologist.ServiceDiscoveryBuilder;

  // Init Zoologist Framework Client
  this.client = Zoologist.newClient(options.connectionString, options.retryCount, options.retryWait);
  this.client.start();

  // Init Service Discovery
  this.serviceDiscovery =
      ServiceDiscoveryBuilder
        .builder()
        .client(this.client)
        .basePath(options.basePath)
        .build();

  // Init Service Provider Builder
  this.serviceProviderBuilder =
    this.serviceDiscovery.serviceProviderBuilder()
      .serviceName(options.serviceName)
      .build();
}

Zoo.prototype.getClient = function () {
  return this.client;
};

Zoo.prototype.getInstance = function (callback) {
  return this.serviceProviderBuilder.getInstance(callback);
};
