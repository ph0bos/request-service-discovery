# Request Service Discovery

Utility module for making HTTP requests against discoverable services registered with ZooKeeper.

[![NPM](https://nodei.co/npm/request-service-discovery.png)](https://npmjs.org/package/request-service-discovery)

## Basic Usage

The following is the most basic usage of the client;

```javascript
'use strict';

var RequestServiceDiscovery = require('request-service-discovery');

// Instantiate a client
var client = new RequestServiceDiscovery({
  connectionString: '127.0.0.1:2181',
  basePath: 'services',
  serviceName: 'my/service/v1'
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

// Invoke a GET request against the service
client.get('item/search', { query: query, headers: headers }, function(err, items) {
  callback(err, items);
});

// Invoke a PUT request against the service
client.put('item', { query: query, headers: headers }, body, function(err, items) {
  callback(err, items);
});

// Invoke a POST request against the service
client.post('item', { query: query, headers: headers }, body, function(err, items) {
  callback(err, items);
});

// Invoke a PUT request against the service
client.delete('item', { query: query, headers: headers }, function(err, items) {
  callback(err, items);
});

```
