var Vue = require('vue');
var App = require('../app');
var reqwest = require('reqwest');
var mouse = require('../lib/mouse');
var jwerty = require('jwerty').jwerty;
var util = require('../lib/util');
var fileComponent = require('./file');
var contextMenuComponent = require('./contextmenu');
var modalComponent = require('./modal');
var config = App.config;

module.exports = Vue.extend({
  components: {
    file: fileComponent
  },
  created: function(){
    
    App.components.list = this;
    
    this.$watch('sortOrder', function(){ if(this.files) this.files.reverse() });
    this.$watch('sortBy', this.sortFiles.bind(this));

    //change selected files on main files change
    this.$watch('files', this.computeSelectedFiles.bind(this));
    
    
    App.on('changeFiles', function(n){
      //hack to force list file change immediately after parent file change
      //if not present, sometimes when pening new folder, doesn't switch
      this.files = n;
      //resort on new folder
      this.sortFiles();
      if(this.sortOrder === 'descending') this.files.reverse();
    }.bind(this))

  },
  attached: function(){
        
    //shortcut keys
    jwerty.key(config.keymaps.selectAll, function(e){ 
      e.preventDefault();
      this.selectAll();
    }.bind(this), this.$el);
    
    jwerty.key(config.keymaps.deselectAll, function(e){ 
      e.preventDefault();
      this.deselectAll();
    }.bind(this), this.$el);

    jwerty.key(config.keymaps.info, function(e){
      e.preventDefault();
      this.batchProcess('info');
    }.bind(this), this.$el);
  },
  methods: {
    sortFiles: function(){
      var files = this.files;
      if(!files) return;
      if(files[0].data[this.sortBy] !== undefined){
        files = files.sort(function(file1, file2){
          var a = file1.data[this.sortBy],
              b = file2.data[this.sortBy];
          
          if(typeof a === 'string') a = a.toLowerCase();    
          if(typeof b === 'string') b = b.toLowerCase(); 
          if(this.sortBy.match('time') || this.sortBy.match('date')){
            var tmp = a;
            a = b;
            b = tmp;
          }   
                    
          return natsort(''+a, ''+b);
          
        }.bind(this));
      }
      this.files = files;
      
      function natsort(a, b) {
        function chunkify(t) {
          var tz = [], x = 0, y = -1, n = 0, i, j;

          while (i = (j = t.charAt(x++)).charCodeAt(0)) {
            var m = (i == 46 || (i >=48 && i <= 57));
            if (m !== n) {
              tz[++y] = "";
              n = m;
            }
            tz[y] += j;
          }
          return tz;
        }

        var aa = chunkify(a);
        var bb = chunkify(b);

        for (x = 0; aa[x] && bb[x]; x++) {
          if (aa[x] !== bb[x]) {
            var c = Number(aa[x]), d = Number(bb[x]);
            if (c == aa[x] && d == bb[x]) {
              return c - d;
            } else return (aa[x] > bb[x]) ? 1 : -1;
          }
        }
        return aa.length - bb.length;
      }
    },
    computeSelectedFiles: function(){
      if(!this.$.shownFiles || !this.shownFiles) return;
      this.selectedFiles = this.shownFiles.filter(function(file){ return file.selected });
      this.$.selectedFiles = this.$.shownFiles.filter(function(file){ return file.selected });
      this.$parent.selectedFiles = this.selectedFiles;
    },
    keydown: function(e){
      
      var UP = 38;
      var DOWN = 40;
      var LEFT = 37;
      var RIGHT = 39;
      
      var keys = [UP, LEFT, DOWN, RIGHT];
      
      var key = e.keyCode;
      var last = this.lastActive;
      var lastIndex = this.$.shownFiles.indexOf(last);
      var file;
      
      if(keys.indexOf(key) !== -1){
        e.preventDefault();
        
        if(key === UP || key === LEFT){
          if(lastIndex === 0) return;
          file = this.$.shownFiles[lastIndex-1];
          //scroll next selection into view, prevent from scrolling before selected is selected
          var watch = function(){ 
            if(!isScrolledIntoView(file.$el, file.$parent.$el)) file.$el.scrollIntoView(true); 
            this.$unwatch('selectedFiles', watch);
          }.bind(this);
          this.$watch('selectedFiles', watch);          
        } 
        else if(key === DOWN || key === RIGHT){
          if(lastIndex === this.$.shownFiles.length-1) return;
          file = this.$.shownFiles[lastIndex+1];
          //scroll next selection into view, prevent from scrolling before selected is selected
          var watch = function(){ 
            if(!isScrolledIntoView(file.$el, file.$parent.$el)) file.$el.scrollIntoView(false); 
            this.$unwatch('selectedFiles', watch);
          }.bind(this);
          this.$watch('selectedFiles', watch);          
        }
        
        this.mousedown({targetVM: file, which: 1, shiftKey: e.shiftKey, metaKey: e.metaKey});
      }    
      
      function isScrolledIntoView(el, parentEl){
        if(!parentEl) parentEl = window;
                
        var docViewTop = parentEl.scrollTop;
        var docViewBottom = docViewTop + (parentEl.offsetHeight || parentEl.innerHeight);

        var elemTop = el.offsetTop;
        var elemBottom = elemTop + el.offsetHeight;

        return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
          && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
      }
          
      
    },
    /*
      Handles all mousedown events
      Can be simulated by giving object with {targetVM, which, shiftKey, metaKey}
    */
    mousedown: function(e){
                                                
      var file = e.targetVM;

      var currentIndex = this.$.shownFiles.indexOf(file);
      
      //deselect all if clicked outside of any files
      if(e.target === this.$el){
        this.deselectAll();
      }
      
      //if clicked on general list, not file, exit
      if(e.targetVM === this) return;
      
      //left click or touch
      if(e.which !== 3) {
        if(e.shiftKey || this.modifierKey === 'shift'){
          if(this.selectedFiles.length){
            
            var last = this.lastActive;
            var lastIndex = this.$.shownFiles.indexOf(last);
                                    
            //select all files from last selected index to current index
            if(lastIndex >= 0 && currentIndex >= 0 && lastIndex !== currentIndex){
              if(file.selected){
                if(currentIndex > lastIndex){
                  for(var i = lastIndex; i < currentIndex; i++) this.toggleSelected(this.shownFiles[i]); 
                } else {
                  for(var i = currentIndex+1; i <= lastIndex; i++) this.toggleSelected(this.shownFiles[i]); 
                }
              } else {
                if(currentIndex > lastIndex){
                  for(var i = lastIndex; i < currentIndex+1; i++) this.select(this.shownFiles[i]); 
                } else {
                  for(var i = currentIndex; i < lastIndex; i++) this.select(this.shownFiles[i]); 
                }
              }
            }
          }
          else {
            this.toggleSelected(file);
          }
        }
        else if(e.metaKey || this.modifierKey === 'meta'){
          this.toggleSelected(file);
        }
        else {
          this.deselectAll();
          this.select(file, true);
        }
      }
      
      this.lastActive = file;
    },
    dblclick: function(e){
      var $file = e.targetVM;
      $file.open();
    },
    contextmenu: function(e){
      
      e.preventDefault();
      
      //deselect all if clicked outside of any files
      if(e.target === this.$el){
        this.deselectAll(true);
      }
      
      //if clicked on general list, not file, exit
      if(e.targetVM === this && this.selectedFiles.length) return;
      
      if(this.selectedFiles.length < 2){
        this.deselectAll(true);
        this.select(e.targetVM, true);
      }      
            
      //create contextmenu
      var menu = new Vue({
        replace: true,
        template: '<div class="contextmenu" v-partial="fileActions" style="top: {{y}}px; left: {{x}}px;"></div>',
        el: document.body.appendChild(document.createElement('div')),
        parent: this.$parent,
        data: {
          x: e.clientX, 
          y: e.clientY
        },
        created: function(){ 
          
          //remove on click
          var unbind = function(){
            window.removeEventListener('click', unbind);
            window.removeEventListener('contextmenu', dunbind);
            this.$destroy();
            this.emit('destroy');
          }.bind(this);
          
          var dunbind = function(){
            window.removeEventListener('contextmenu', dunbind);
            window.addEventListener('contextmenu', unbind);
          }.bind(this);
            
          window.addEventListener('click', unbind);
          window.addEventListener('contextmenu', dunbind);
            
        },
        ready: function(){
          var rect = this.$el.getBoundingClientRect();
                    
          //make sure in screen
          var paddingAmt = 5;
          if(rect.bottom > window.innerHeight){
            this.y -= (rect.bottom - window.innerHeight) + paddingAmt;
          }
          if(rect.right > window.innerWidth){
            this.x -= (rect.right - window.innerWidth) + paddingAmt;
          }
        }
      });     
    },
    batchProcess: function(action){
      var $files = this.$.selectedFiles;
      var files = this.selectedFiles;
      
      if(this[action]){
        this[action](files);
      }
      else if($files[0][action]){
        $files.forEach(function(file){
          file[action]();
        });
      }
      else if(this.$parent[action]){
        this.$parent[action](files);
      }
      
    },
    selectAll: function(){ return this.select.apply(this, arguments) },
    deselectAll: function(){ 
      return this.deselect(this.selectedFiles, true);
    },
    select: function(files, force){
      this.selectHelper(arguments, function(file){ file.selected = true });
    },
    deselect: function(files, force){
      this.selectHelper(arguments, function(file){ file.selected = false });
    },
    toggleSelected: function(files, force){
      this.selectHelper(arguments, function(file){ file.selected = !file.selected });
    },
    selectHelper: function(args, cb){
      
      var files = args[0], 
          force = args[1];
      
      if(typeof files === 'object') {
        if(!(files instanceof Array)) files = [files];
      }
      else {
        force = files;
        files = this.shownFiles;        
      }
      files.forEach(function(file){ cb(file) });
      
      //hack to instantly compute selected files
      //if not forced, $watch in this.create() top does not instantly catch up with this
      if(force){
        this.computeSelectedFiles();
      }
    },
    move: function(files){
      var parent = this.$parent;
      var data = {
        title: 'Move', 
        files: files,
        path: parent.path,
        showFiles: false,
        options: {
          copy: false
        }
      };
      this.createModal('move', data, function(){ parent.move(this.files, this.path, this.options) });
    },
    rename: function(file){
      var file = file[0];
      var parent = this.$parent;
      var data = {title: 'Rename', path: file.data.path, origPath: file.data.path};
      this.createModal('rename', data, function(){ parent.rename(this.origPath, this.path) });
    },
    delete: function(files){
      this.$parent.delete(files);
    },
    newFolder: function(files){
      var parent = this.$parent;
      var data = {
        title: 'New Folder', 
        path: parent.path,
        files: files,
        options: {
          move: false,
          copy: false,
          showFiles: false
        }
      };
      this.createModal('newFolder', data, function(){ parent.newFolder(this.$data) });
    },
    newFile: function(){
      var parent = this.$parent;
      var data = {title: 'New File', path: parent.path};
      this.createModal('newFile', data, function(){ console.log(this);parent.newFile(this.path) });
    },
    info: function(files){
      
      var launchModal = function(){
        this.createModal('info', allData, function(){  });
      }.bind(this);
      
      var allData = {
        title: 'File Info',
        disableSubmitButton: true,
        disableCancelButton: true,
        data: {}
      };
      
      if(files.length === 1){
        var file = files[0];
        allData.data = file.data;
        var data = allData.data;
        allData.mode = 'file';
        
        var xhr = reqwest({
          url: App.config.INFO_URL,
          method: 'post',
          data: data
        });
        xhr.then(function(res){
          data.metadata = res.data;
          launchModal();
        }.bind(this));
      } 
      else {
        var data = allData.data;
        data.path = this.$parent.path;
        data.files = !files.length ? this.shownFiles : this.selectedFiles;
        data.filecount = data.files.length;
        data.size = (function(){ var s = 0; data.files.forEach(function(f){ s += f.data.size }); return s})();
        allData.mode = 'files';
        launchModal();
      }
    },
    createModal: function(id, data, submit){
      var parent = this.$parent;
                  
      var el = document.body.appendChild(document.createElement('div'));

      var modal = new modalComponent({
        el: el,
        data: data,
        parent: this,
        methods: {
          submit:function(e){
            e.preventDefault();
            this.remove();
            if(typeof submit === "function"){
              submit.call(this);
            } else if(parent[id]) {
              parent[id].apply(parent, [data]);
            }
          }
        },
        partials: {
          body: document.querySelector('#'+id+'-body-template').innerText,
        }
      })
    }
  },
  filters: {
    filterFilesToDisplay: function(files){
      
      if(!files) return;
                
      var shownFiles = files;

      if(!this.showHiddenFiles) shownFiles = files.filter(function(file){
        return file.data.name[0] !== ".";
      });
        
      this.$data.shownFiles = shownFiles;
      return shownFiles;
    }    
  },
});