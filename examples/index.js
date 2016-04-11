'use strict'

var RequestServiceDiscovery = require('../');

var fooClient = new RequestServiceDiscovery({
  connectionString: '127.0.0.1:2181',
  basePath: 'services',
  serviceName: 'foo/service/v1',
  providerStrategy: 'RoundRobin',
  verbose: true,
  correlationHeaderName: 'X-My-Correlation-ID'
});

var barClient = new RequestServiceDiscovery({
  connectionString: '127.0.0.1:2181',
  basePath: 'services',
  serviceName: 'bar/service/v1',
  providerStrategy: 'Random',
  verbose: true
});

fooClient.on('connected', function() {
  fooClient.get('actuator/health', null, function(err, res) {
    console.log(err, res);
  });
});

barClient.on('connected', function() {
  barClient.get('actuator/health', null, function(err, res) {
    console.log(err, res);
  });
});
