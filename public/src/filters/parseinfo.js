var Vue = require('vue');
var App = require('../app');
var util = require('../lib/util');

var displayedInfo = App.config.file.displayedInfo;
var propertyFilter = require('./fileProperty');

module.exports = Vue.filter('parseInfo', function(data){
  data = util.clone(data);
  var nData = {};
  if(data.filecount){
    for(var i in data){
      displayedInfo.multiple.forEach(function(prop){
        var val = data[prop];
        if(propertyFilter){
          var n = propertyFilter(prop, val);
          prop = n.key;
          val = n.val;
        }
        if(typeof data[prop] !== 'undefined') nData[prop] = val;
      });
    }
  } else {
    for(var type in displayedInfo.single){
      var props = displayedInfo.single[type];
      if(type === 'default' || data['file type'] === type || data['type'] === type) {
        var dropdown = (type !== 'single' && type !== 'file' && type !== 'default' && type !== 'folder') ? true : false;
        if(dropdown){
          var tmp = nData;
          nData = nData[type] = {};
        }
        props.forEach(function(prop){
          var val;
          if(data.metadata && typeof data.metadata[prop] !== 'undefined') val = data.metadata[prop];
          else if(typeof data[prop] !== 'undefined') val = data[prop];
          
          if(propertyFilter){
            var n = propertyFilter(prop, val);
            prop = n.key;
            val = n.val;
          }
          nData[prop] = val;
        });
        if(dropdown){
          for(var i in tmp[type]){ if(tmp[type][i] === undefined) delete tmp[type][i] }
          if(!Object.keys(tmp[type]).length) delete tmp[type];
          nData = tmp;
        }
      }
    }
  }  
  console.log(data, nData);
  
  return nData;
})