var Store = require('../lib/store');
var util = require('../lib/util');

var UndoStore = Store.extend({

  initialize: function(data, config){
    this._super({ state: data, states: [data], stateIndex: 0 });
    this.configure(util.extend({rootKey: "data.state", maxStates: Infinity}, config));

    var d = this.data;

    //save to local storage every change
    this.on('change', function(){

      var state = this.get();

      if(this._undoing || this._redoing || util.isEqual(state, d.states[d.stateIndex])) return;

      //remove redo functionality of changed
      if(d.stateIndex !== d.states.length-1) {
        d.states = d.states.slice(0, d.stateIndex+1);
      }

      //add state
      d.states.push(state);
      d.stateIndex++;

      //cap amount of states to config.maxStates
      if(this.config.maxStates < d.states.length) {
        d.states = d.states.slice(d.states.length - this.config.maxStates);
        d.stateIndex = d.states.length-1;
      }

    }.bind(this));
  },

  undo: function(){
    if(!this.canUndo()) return false;
    this._undoing = true;
    this.data.stateIndex--;
    this.setStateToIndex();
    this.emit('undo', [this.data.state, this.data.states[this.data.stateIndex+1]]);
    this._undoing = false;
    return true;
  },

  redo: function(){
    if(!this.canRedo()) return false;
    this._redoing = true;
    this.data.stateIndex++;
    this.setStateToIndex();
    this.emit('redo', [this.data.state, this.data.states[this.data.stateIndex-1]]);
  this._redoing = false;
    return true;
  },

  setStateToIndex: function(i){
    this.data.stateIndex = typeof i !== "number" ? this.data.stateIndex : i;
    this.set(this.data.states[this.data.stateIndex]);
  },

  canUndo: function(){
    return this.data.stateIndex > 0;
  },

  canRedo: function(){
    return this.data.stateIndex < this.data.states.length-1;
  }
});

module.exports = UndoStore;
