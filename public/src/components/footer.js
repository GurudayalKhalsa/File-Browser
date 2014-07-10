var Vue = require('vue');
var App = require('../app');

module.exports = Vue.extend({
  created: function(){
    App.components.footer = this;
    
    App.PathStore.on('change', function(){
      this.lastExists = App.PathStore.canUndo();
      this.nextExists = App.PathStore.canRedo();
    }.bind(this));
  },
  data: {
    showOptions: false,
    showModifierKeys: false
  },
  methods: {
    switchType: function(){
      this.inputType = this.inputType === 'path' ? 'search' : 'path';
    }
  }
});