'use strict'

var RequestServiceDiscovery = require('../');

var fooClient = new RequestServiceDiscovery({
  connectionString: '127.0.0.1:2181',
  basePath: 'services',
  serviceName: 'foo/service/v1'
});

var barClient = new RequestServiceDiscovery({
  connectionString: '127.0.0.1:2181',
  basePath: 'services',
  serviceName: 'bar/service/v1'
});

client1.on('connected', function() {
  client1.get('actuator/health', null, function(err, res) {
    console.log(err, res.body);
  });
});

client2.on('connected', function() {
  client2.get('actuator/health', null, function(err, res) {
    console.log(err, res.body);
  });
});
