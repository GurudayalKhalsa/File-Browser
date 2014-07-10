var Emitter = require('./emitter');
var util = require('./util');

//Class
var initializing = false,
    fnTest = /xyz/.test(function()
    {
        xyz
    }) ? /\b_super\b/ : /.*/;

var Store = function(){}

Store.extend = function(prop){
  var _super = this.prototype;
  initializing = true;
  var prototype = new this;
  initializing = false;
  for (var name in prop)
  {
      prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ? function(name, fn)
      {
          return function()
          {
              var tmp = this._super;
              this._super = _super[name];
              var ret = fn.apply(this, arguments);
              this._super = tmp;
              return ret
          }
      }(name, prop[name]) : prop[name]
  }

  function Store()
  {
      if (!initializing && this.initialize) this.initialize.apply(this, arguments)
  }
  Store.prototype = prototype;
  Store.prototype.constructor = Store;
  Store.extend = arguments.callee;
  return Store
};

//Store
var Store = Store.extend({

  initialize: function(data, config){
    (data || (data = {})), (config || (config = {}));

    var defaultData = {

    };

    var defaultConfig = {
      events: true,
      copy: true,
      rootKey: "data"
    };

    var args = {};

    //remove unnecesarry non-constructor config
    util.each([], function(option, key){
      delete defaultConfig[key];
      args[key] = option;
    });

    this.config = util.extend({}, util.extend(defaultConfig, config));
    this.data = util.extend({}, util.extend(defaultData, data, this.config.copy ? true : false));
  },

  //sets all key-value pairs argv[n], argv[n+1]

  //or sets all values of passed in object argv[0] with optional overwrite mode argv[1]
  // if overwrite is true, entire store will be passed in obj, if false, only props inside of obj will be set, defaults to false,
  set: function(key, val){

    var root = util.getVal(this.config.rootKey, this).val;
    if(!root) root = this.data;
    var copy = this.config.copy;

    //handle of object passed in, set all keys in that object
    if(typeof key === "object")
    {
      if(arguments[1] && arguments[1] === true){
        val = key;
        key = this.config.rootKey;
      } else {
        util.each(key, function(val, key){ this.set(key, val) }, this);
        return this;
      }
    }

    //handle if multiple key,val arguments passed in sequentially
    else if(arguments.length > 3)
    {
      for(var i = 0; i < arguments.length; i += 2)
      {
        key = arguments[i],
        val = arguments[i+1];

        this.set(key, val);
      }

      return this;
    }

    //get deep key
    var info = util.getVal(key, root);

    //if no deep parent, return
    if(!info.parent){
      console.trace("Invalid Key", key, "in parent obj", this.data);
      return this;
    }

    //set new val, copy if specified
    if(copy) info.parent[info.key] = util.clone(val);
    else info.parent[info.key] = val;

    if(this.config.events) {
      //emits change event with args [newVal, oldVal, key, info]
      this.emit('change', [val, info.val, key === this.config.rootKey ? "" : key, info]);
      //emits change event on specific key with args [newVal, oldVal, key, info]
      this.emit('change:'+key, [val, info.val, key === this.config.rootKey ? "" : key, info]);
    }

    return this;
  },

  get: function(key){

    var root = util.getVal(this.config.rootKey, this).val;
    if(!root) root = this.data;
    var copy = this.config.copy;

    //if no key passed in, return all data
    if(!key) return (!copy ? root : util.clone(root));

    //get deep key
    var info = util.getVal(key, root);

    //if no deep parent, return
    if(!info.parent){
      console.trace("Invalid Key", key, "in parent Store", root);
      return this;
    }

    return (!copy ? info.val : util.clone(info.val));
  },

  configure: function(conf){
    this.config = util.extend(this.config, conf);
  }

});

new Emitter(Store);

module.exports = Store;
