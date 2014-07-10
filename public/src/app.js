var Vue = require('vue');
var reqwest = require('./lib/reqwest');
var UndoStore = require('./stores/undoStore');
var Emitter = require('./lib/emitter');
Emitter(Vue);

//define some variables
var mouseEvents;

var App = module.exports = window.App || (window.App = {});
Emitter(App);

var config = App.config = require('./config');

//create state store
var PathStore = App.PathStore = new UndoStore({path: config.initialPath});

var components = App.components = require('./components/');
var directives = App.directives = require('./directives/');
var filters = App.filters = require('./filters/');

App.vue = new Vue({
  el: document.querySelector(App.config.ViewSelector),
  components: {
    header: components.header,
    list: components.list,
    footer: components.footer
  },
  partials: {
    fileActions: document.querySelector('#fileActions-template').innerText
  },
  created: function(){
    //map events to methods
    this.$on('doAction', function(event){
      if(event in this){ 
        this[event].apply(this, Array.prototype.slice.call(arguments, 1)); 
      }
    }.bind(this));
        
    //submit default path
    this.$emit('doAction', 'submit');    
    this.$broadcast('doAction', 'submit');    
    
    PathStore.on('change', function(){
      this.path = PathStore.get('path');
    }.bind(this));
  },
  data: {
    path: PathStore.get('path'),
    inputType: 'path',
    showHiddenFiles: config.showHiddenFiles,
    files: [],
    selectedFiles: [],
    shownFiles: [],
    lastExists: false,
    nextExists: false,
    sortOrder: config.sortOrder,
    sortBy: config.sortBy,
    mobile: 'ontouchstart' in window,
    modifierKey: false,
    fetchingNewDir: false
  },
  methods: {
    window: function(){return window},
    doFileAction: function(e, action){
      var context = this.$.list;
      context.batchProcess(action);
    },
    submit: function(e){
      if(e) e.preventDefault();
      var match = this.files.filter(function(a){
        if(this.path.toLowerCase() + '/' === a.data.path.toLowerCase() + '/'){
          PathStore.set('path', this.path + '/')
        }
        return a.data.path.toLowerCase() === this.path.toLowerCase();
      }.bind(this))[0];
      
      this.request();
    },
    request: function(){
      var xhr = reqwest(App.config.READ_URL + this.path);
      this.fetchingNewDir = true;
      xhr.then(function(res){
        this.fetchingNewDir = false;
        if(!res || !res.files){
          this.folderLoadError = true;
          App.once('changeFiles', function(){this.folderLoadError = false}.bind(this))
          return false;
        } else {
          var tmp = this.files;
          this.files = res.files;
          App.emit('changeFiles', [this.files, tmp]);
        }
        
      }.bind(this));
    },
    newFolder: function(data){
      data.files = data.files.map(function(file){ return file.data.path });
      this.doPostOperation(App.config.NEWFOLDER_URL, data);
    },
    newFile: function(path){
      this.doPostOperation(App.config.NEWFILE_URL, { path: path });
    },
    move: function(files, path, options){
      this.doPostOperation(App.config.MOVE_URL, {
        from: files.map(function(file){ return file.data.path }),
        to: path,
        options: options
      });
    },
    delete: function(files){
      paths = files.map(function(file){ return file.data.path });
      this.doPostOperation(App.config.DELETE_URL, { files: paths });
    },
    rename: function(from, to){
      this.doPostOperation(App.config.RENAME_URL, { from: from, to: to });
    },
    doPostOperation: function(url, data, cb){
      var xhr = reqwest({
        url: url,
        method: 'post',
        data: data
      });
      xhr.then(function(res){
        // console.log(url, data, res.success && "success");
        if(res.success){
          if(cb){
            cb(res);
          } else {
            this.request();  
          }
        } else {
          this.files = [];
          this.customError = res.error;
          App.once('changeFiles', function(){this.customError = false}.bind(this))
          return false;
        }
      }.bind(this));
    },
    openLast: function(){
      if(PathStore.canUndo()) PathStore.undo();
      this.request();
    },
    openNext: function(){
      if(PathStore.canRedo()) PathStore.redo();
      this.request();
    }
  }
});