var Vue = require('vue');
var App = require('../app');
var PathStore = require('../app').PathStore;
var jwerty = require('jwerty').jwerty;

/*
  Example file json from server:
  {
    data: {
      name: 'Applications',
      path: '/Applications/',
      type: 'folder', // folder of file
      'mime type': 'application/octet-stream',
      size: 1234532 // bytes
    }
  };

*/

var fileTypes = App.config.file.fileTypes;
var iconTypes = App.config.file.iconTypes;

module.exports = Vue.extend({
  template: '#file-template',
  replace: true,
  data: {
    selected: false
  },
  created: function(){
    //set icon
    if(this.data.type === 'folder'){
      this.iconType = iconTypes['folder'];
    } else {
      var ext = this.data.name.match(/\./) !== null ? this.data.name.split('.').pop().toLowerCase() : '';
      
      for(var type in fileTypes){
        if(fileTypes[type].indexOf(ext) !== -1){
          this.data['file type'] = type;
          this.iconType = iconTypes[type];
          break;
        }
      }
      if(!this.iconType){
        if(this.data.type in iconTypes){
          this.data['file type'] = this.data.type;
          this.iconType = iconTypes[this.data.type];
        } else {
          this.iconType = iconTypes.file;
        }
      }
    }
  },
  attached: function(){
        
    //shortcut keys
    jwerty.key('enter', function(e){ 
      console.log('enter');
    }.bind(this), this.$el);
  },
  methods: {
    open: function(e){
      var file = this;
      if(file.data.type === "folder"){
        PathStore.set('path', file.data.path + "/");
        this.$dispatch('doAction', 'request');
      } else {
        location.href = App.config.SERVE_URL+file.data.path;
      }
    }
  }
});