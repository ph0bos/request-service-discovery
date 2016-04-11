# Request Service Discovery

Utility module for making HTTP requests against discoverable services registered with ZooKeeper.

[![NPM](https://nodei.co/npm/request-service-discovery.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/request-service-discovery/)

## Basic Usage

The following is the most basic usage of the client;

```javascript
'use strict';

var RequestServiceDiscovery = require('request-service-discovery');

// Instantiate a client
var client = new RequestServiceDiscovery({
  connectionString: '127.0.0.1:2181',
  basePath: 'services',
  serviceName: 'my/service/v1',
  providerStrategy: 'RoundRobin',
  verbose: false,
  timeout: 1000,
  retries: 2,
  minTimeout: 5,
  maxTimeout: 50,
  correlationHeaderName: 'My-Correlation-ID'
});

var query = {
  "myParam": "myValue"  
};

var headers = {
  "Content-Type": "application/json"  
};

var body = {
 "prop1": "value1",
 "prop2": "value2"  
};

client.on('connected', function() {

  // Invoke a GET request against the service
  client.get('item/search', { query: query, headers: headers }, function(err, res) {
    callback(err, res.body);
  });

  // Invoke a PUT request against the service
  client.put('item', { query: query, headers: headers }, body, function(err, res) {
    callback(err, res.body);
  });

  // Invoke a POST request against the service
  client.post('item', { query: query, headers: headers }, body, function(err, res) {
    callback(err, res.body);
  });

  // Invoke a PUT request against the service
  client.delete('item', { query: query, headers: headers }, function(err, res) {
    callback(err, res.body);
  });

  // Invoke a GET request against the service
  client.method('item/search', { method: 'GET', query: query, headers: headers }, function(err, res) {
    callback(err, res.body);
  });

});

```
