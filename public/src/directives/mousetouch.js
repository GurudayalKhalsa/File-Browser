var Vue = require('vue');

Vue.directive('mousetouch',{

  isFn: true,

  bind: function () {
    this._ismobile = 'ontouchstart' in window;
    
    this._eventTypes = {};
    if(this._ismobile){
      this._eventTypes.down = 'touchstart';
      this._eventTypes.move = 'touchmove';
      this._eventTypes.up = 'touchend';
      doubleTap(this.el);
    } else {
      this._eventTypes.down = 'mousedown';
      this._eventTypes.move = 'mousemove';
      this._eventTypes.up = 'mouseup';
    }
    this._eventTypes.dblclick = 'dblclick';
    
    this.context = this.binding.isExp
    ? this.vm
    : this.binding.compiler.vm
  },

  update: function (handler) {
    if (typeof handler !== 'function') {
      console.warn('Directive "v-mousetouch:' + this.expression + '" expects a method.')
      return
    }
    this.unbind()
    var vm = this.vm,
        s,
        context = this.context;
          
    this.handler = function (e) {
      e.targetVM = vm
      context.$event = e
      var res = handler.call(context, e)
      context.$event = null
      return res
    }
  

    if(this.arg in this._eventTypes){
      // console.log('adding', this._eventTypes[this.arg], 'event listener to', this.el);
      this.el.addEventListener(this._eventTypes[this.arg], this.handler);
    }
  },

  unbind: function () {
    this.el.removeEventListener(this._eventTypes[this.arg], this.handler);
  }
});

/*
    Polyfill for touch dblclick
    http://mckamey.mit-license.org
*/
function doubleTap(elem, speed, distance) {
    if (!('ontouchstart' in elem)) {
        // non-touch has native dblclick and no need for polyfill
        return;
    }
 
    // default dblclick speed to half sec
    speed = Math.abs(+speed) || 500;//ms
    // default dblclick distance to within 40x40 area
    distance = Math.abs(+distance) || 40;//px
 
    var taps, x, y,
        reset = function() {
            // reset state
            taps = 0;
            x = NaN;
            y = NaN;
        };
 
    reset();
 
    elem.addEventListener('touchstart', function(e) {
        var touch = e.changedTouches[0] || {},
            oldX = x,
            oldY = y;
 
        taps++;
        x = +touch.pageX || +touch.clientX || +touch.screenX;
        y = +touch.pageY || +touch.clientY || +touch.screenY;
 
        // NaN will always be false
        if (Math.abs(oldX-x) < distance &&
            Math.abs(oldY-y) < distance) {
 
            // fire dblclick event
            var e2 = document.createEvent('MouseEvents');
            if (e2.initMouseEvent) {
                e2.initMouseEvent(
                    'dblclick',
                    true,                   // dblclick bubbles
                    true,                   // dblclick cancelable
                    e.view,                 // copy view
                    taps,                   // click count
                    touch.screenX,          // copy coordinates
                    touch.screenY,
                    touch.clientX,
                    touch.clientY,
                    e.ctrlKey,              // copy key modifiers
                    e.altKey,
                    e.shiftKey,
                    e.metaKey,
                    e.button,               // copy button 0: left, 1: middle, 2: right
                    touch.target);          // copy target
            }
            elem.dispatchEvent(e2);
        }
 
        setTimeout(reset, speed);
 
    }, false);
 
    elem.addEventListener('touchmove', function(e) {
        reset();
    }, false);
}