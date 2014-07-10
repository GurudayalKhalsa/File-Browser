document.querySelector('#view').onselectstart = function(){ return false; };
var base = require('./lib/base');
module.exports = require('./app');
