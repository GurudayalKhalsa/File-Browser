var Backbone = require('backbone');
var _ = require('_');

var file = require('./file');

var Files = Backbone.Collection.extend({
  model: file,
  initialize: function(){
    
  }
});

module.exports = Files;