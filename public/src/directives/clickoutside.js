var Vue = require('vue');

Vue.directive('clickoutside',{

  isFn: true,

  bind: function () {    
    
    this.context = this.binding.isExp ? this.vm : this.binding.compiler.vm;
  },

  update: function (fn) {
    if (typeof fn !== 'function') {
      console.warn('Directive "v-mousetouch:' + this.expression + '" expects a method.')
      return
    }
    var handler = this.handler = function(e){
      var x = e.clientX, y = e.clientY;
      var bounds = this.el.getBoundingClientRect();
      //clicked outside
      if(x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom){
        console.log(fn)
        fn.call(this.vm);
        this.unbind();
      }
    }.bind(this)
    
    window.addEventListener('click', nextClick);
    function nextClick(e){
      window.removeEventListener('click', nextClick);
      window.addEventListener('click', handler);
    }

  },

  unbind: function () {
    window.removeEventListener('click', this.handler);
  }
});
