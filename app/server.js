var fs = require('fs');
var Path = require('path');
var find = require('findit');
var rm = require('rimraf');
var ncp = require('ncp');
var async = require('async');
var mime = require('mime');
var metadata = require('./lib/metadata/');
var folderSize = require('./lib/size');
var express = require('express');
var bodyParser = require('body-parser');

var config = require('./config');
var requests = require('./requests/');

var server = express();

server.use(bodyParser());

//static asset server for main view
server.use("/",express.static(Path.resolve('../public')));

//listen to all requests
for(var key in requests){
  var request = requests[key];
  server[request.type || 'post'](key, request.fn || function(){});
}

server.listen(process.argv[2] || 4000);
