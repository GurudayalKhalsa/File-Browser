var Vue = require('vue');

module.exports = Vue.extend({
  created: function(){
    App.components.header = this;
  },
  methods: {
    switchType: function(){
      this.inputType = this.inputType === 'path' ? 'search' : 'path';
    }
  }
});