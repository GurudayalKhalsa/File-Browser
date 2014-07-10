var Vue = require('vue');

module.exports = Vue.filter('formatJSON', function(data, a){
  
  if(typeof data === 'object'){
    data = JSON.parse(JSON.stringify(data));
  } else {
    data = JSON.parse(data);
  }
  
  var options = {
    capitalize: false
  };
  
  var args = Array.prototype.slice.call(arguments, 1);
  for(var i in args){ if(args[i] in options) options[args[i]] = !options[args[i]] }
  
  var el = function(type, inner, attrs){
    if(!type) type = 'div';
    if(!inner) inner = '';
    if(!attrs) attrs = {};
    var el = document.createElement(type);
    for(var i in attrs) el.setAttribute(i, attrs[i]);
    if(typeof inner === 'string' || typeof inner === 'number') el.innerHTML = ''+inner;
    else if(typeof inner === 'object'){
      if(inner instanceof Array){
        inner.forEach(function(subEl){ if('tagName' in subEl) el.appendChild(subEl); })
      } 
      else if('tagName' in inner) el.appendChild(inner);
    } 
    return el;
  }
  
  var $container = el();
  var $root = $container.appendChild(el('ul'));
  
  //2 levels
  for(var i in data){
    if(typeof data[i] === 'object'){
      var li = $root.appendChild(
        el('li', [
          el('b', (options.capitalize ? capitalize(i) : i) + ': ')
        ])
      );
      var $newRoot = li.appendChild(el('ul'));
      for(var j in data[i]){
        if(typeof data[j] !== 'object') {
          $newRoot.appendChild(
            el('li', [
              el('b', (options.capitalize ? capitalize(j) : j) + ': '),
              el('span', data[i][j])
            ])
          )
        }
      }
    } else {
      $root.appendChild(
        el('li', [
          el('b', (options.capitalize ? capitalize(i) : i) + ': '),
          el('span', data[i])
        ])
      )
    }
  }
  
  function capitalize(str){
    var str = '' + str;
    var words = str.split(' ');
    words = words.map(function(word){ return word[0].toUpperCase() + word.substr(1) });
    return words.join(' ');
  }
  
  return $container.innerHTML;
})