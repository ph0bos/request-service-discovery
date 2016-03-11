'use strict';

/**
 * Dependencies
 */
var EventEmitter = require('events').EventEmitter;
var util         = require('util');
var zoologist    = require('zoologist');

function ZoologistConfig(options) {
  this.init(options);
};

util.inherits(ZoologistConfig, EventEmitter);

module.exports = ZoologistConfig;

ZoologistConfig.prototype.init = function (options) {
  var self = this;

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
  this.serviceProvider =
    this.serviceDiscovery.serviceProviderBuilder()
      .serviceName(options.serviceName)
      .providerStrategy(options.providerStrategy)
      .build();

  this.client.on('connected', function(msg) {
    self.emit('connected', msg);
  });

  this.client.on('disconnected', function(msg) {
    self.emit('disconnected', msg);
  });
}

ZoologistConfig.prototype.isConnected = function() {
  return this.client.isConnected();
};

ZoologistConfig.prototype.getInstance = function(callback) {
  return this.serviceProvider.getInstance(callback);
};
