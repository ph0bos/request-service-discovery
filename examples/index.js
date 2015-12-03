'use strict'

var RequestServiceDiscovery = require('../');

var client = new RequestServiceDiscovery({
  connectionString: '127.0.0.1:2181',
  basePath: 'services',
  serviceName: 'content/sport/repository/v1'
});

client.get('sport', null, function(err, res) {
  console.log(err, res.body);
  process.exit(1);
});
