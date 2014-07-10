var Vue = require('vue');

module.exports = Vue.filter('bytes', function(bytes){
  if(bytes < 1024) return bytes + " B";
  if(bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  if(bytes < 1024*1024*1024) return (bytes/1024/1024).toFixed(1) + ' MB';
  if(bytes < 1024*1024*1024*1024) return (bytes/1024/1024/1024).toFixed(1) + ' GB';
});