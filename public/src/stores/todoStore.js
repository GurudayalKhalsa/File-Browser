var UndoStore = require('./undoStore');
var util = require('../lib/util');
var App = require('../main');

var TodoStore = UndoStore.extend({

  initialize: function(){
    this._super.apply(this, arguments);

    //retrieve from local storage
    if(localStorage.todos){
      this.set("todos", JSON.parse(localStorage.todos));
    }

    //save to local storage every change
    this.on('change', function(a){
      localStorage.todos = JSON.stringify(this.get("todos"));
    });
  },

  add: function(data){
    var todo = {
      text: data.text || '',
      complete: data.complete || false
    };
    var todos = this.get('todos');
    todos.push(todo);
    this.set('todos', todos);
  },

  remove: function(id){
    var todos = this.get("todos");
    todos.splice(id, 1);
    this.set("todos", todos);
  },

  update: function(key, data){
    return this.set("todos["+key+"]", data);
  }
});


//create immutable store
var store = new TodoStore({todos:[], nowShowing: App.ALL_TODOS}, {copy: true});

module.exports = store;
