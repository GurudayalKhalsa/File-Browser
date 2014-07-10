var util = {};
var breaker = {};

//loops the array or obj
util.each = function(obj, iterator, context) {
    if (obj === null) return;
    var i;
    var length;
    if(typeof obj === "number")
    {
      for(i = 0; i < obj; i++) iterator(i);
    }
    if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = Object.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
  };

//clones the array, obj, Node etc
util.clone = function(obj) {

  var copy;

  // Handle the 3 simple types, and null or undefined
  if (null === obj || "object" !== typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
          copy[i] = util.clone(obj[i]);
      }
      return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = util.clone(obj[attr]);
      }
      return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");

};

//copies all vals in source not in dest into dest
util.extend = function(destination, source, deep) {
  for (var property in source) {
    if (source[property] && source[property].constructor &&
     source[property].constructor === Object && deep) {
      destination[property] = destination[property] || {};
      util.extend(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};

util.isEqual = function() {
  var leftChain, rightChain;

  function compare2Objects (x, y) {
    var p;

    // remember that NaN === NaN returns false
    // and isNaN(undefined) returns true
    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
         return true;
    }

    // Compare primitives and functions.
    // Check if both arguments link to the same object.
    // Especially useful on step when comparing prototypes
    if (x === y) {
        return true;
    }

    // Works in case when functions are created in constructor.
    // Comparing dates is a common scenario. Another built-ins?
    // We can even handle functions passed across iframes
    if ((typeof x === 'function' && typeof y === 'function') ||
       (x instanceof Date && y instanceof Date) ||
       (x instanceof RegExp && y instanceof RegExp) ||
       (x instanceof String && y instanceof String) ||
       (x instanceof Number && y instanceof Number)) {
        return x.toString() === y.toString();
    }

    // At last checking prototypes as good a we can
    if (!(x instanceof Object && y instanceof Object)) {
        return false;
    }

    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
        return false;
    }

    if (x.constructor !== y.constructor) {
        return false;
    }

    if (x.prototype !== y.prototype) {
        return false;
    }

    // check for infinitive linking loops
    if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
         return false;
    }

    // Quick checking of one object beeing a subset of another.
    // todo: cache the structure of arguments[0] for performance
    for (p in y) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        }
        else if (typeof y[p] !== typeof x[p]) {
            return false;
        }
    }

    for (p in x) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        }
        else if (typeof y[p] !== typeof x[p]) {
            return false;
        }

        switch (typeof (x[p])) {
            case 'object':
            case 'function':

                leftChain.push(x);
                rightChain.push(y);

                if (!compare2Objects (x[p], y[p])) {
                    return false;
                }

                leftChain.pop();
                rightChain.pop();
                break;

            default:
                if (x[p] !== y[p]) {
                    return false;
                }
                break;
        }
    }

    return true;
  }

  if (arguments.length < 1) {
    return true; //Die silently? Don't know how to handle such case, please help...
    // throw "Need two or more arguments to compare";
  }

  for (var i = 1, l = arguments.length; i < l; i++) {

      leftChain = []; //todo: this can be cached
      rightChain = [];

      if (!compare2Objects(arguments[0], arguments[i])) {
          return false;
      }
  }

  return true;
}

//gets the key from the parent
//handles if key involves '.' and '[]' e.g. if key is 'pizza.slice.pepperoni' or 'pizza['slice'].pepperoni[0]'
//returns obj with parent obj, key title and val
util.getVal = function(key, parent){

  if(!parent) parent = {};
  if(!key) key = "";
  var root = parent;

  //matches (dots) or (parentheses with something in between)
  if(key.match( /(\.|\[(.*?)\])/g )){
    var depth = getDepth(key);
    for(var i = 0; i < depth.length-1; i++)
    {
        if(parent[depth[i]]) parent = parent[depth[i]];
        else parent = false;
    }
    key = depth.pop();
  }

  return {
    parent: parent,
    key: key,
    val: parent[key],
    root: root
  };
};

//used by utilgetVal
function getDepth(key){
  var arr = [key],
      rDot = /\./g,
      rBracket = /\[(.*?)\]/g,
      rEither = /(\.|\[(.*?)\])/g;

  if(key.match(rEither)){
    arr = [];

    if(!key.match(rBracket)) {
      arr = key.split(".");
    } else {
      var newKey = key;
      for(var i = 0; i < key.length; i++){
        if(key[i] === "."){
          newKey = newKey.substr(newKey.indexOf('.') + 1);
        }
        else if(key[i] === "["){
          var beforeCurrent = newKey.substr(0, newKey.indexOf("["));
          if(beforeCurrent) arr.push(beforeCurrent);
          //parse in between "[" and "]"
          var id;
          if(key[i+1] === "'" || key[i+1] === '"'){
            //index of first ' or " after id
            var a = key.substr(i+2), ia = a.indexOf("'"), ib = a.indexOf('"');
            id = key.substr(i+2, ( ia === -1 ? ib : ia));
            newKey = newKey.substr(i + 2 + id.length + 2);
          } else {
            var str = key.substr(i+1, key.substr(i+1).indexOf("]"));
            var int = parseInt(str, 10);
            if(!isNaN(int)){
              id = int;
              newKey = newKey.substr(newKey.indexOf("[") + str.length + 2);
            }
          }
          if(!id && id !== 0){
            throw new Error("Failed to parse key " + key);
          }

          arr.push(id);
        }
      }
      if(newKey) arr.push(newKey);
    }
  }

  return arr;
}


module.exports = util;
