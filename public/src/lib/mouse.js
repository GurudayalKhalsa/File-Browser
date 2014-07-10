/**
 * Mouse.js 0.1.0, 2014-06-10
 * Easy touch and mouse events engine
 *
 * Copyright (c) 2014 Gurudayal Khalsa, gurudayalkhalsa@gmail.com
 * Licensed MIT
 */
(function(){
    
    ////////// DEPENDENCIES
    
    var _allEvent = '*';

    var Emitter = function(destObj){
        var props = ['on', 'once', 'off', 'emit'];

        for (var i = 0; i < props.length; i++){
            if (typeof destObj === 'function'){
                destObj.prototype[props[i]] = Emitter.prototype[props[i]];
            }
            else if(typeof destObj === 'object'){
                destObj[props[i]] = Emitter.prototype[props[i]];
            }
        }
    }

    Emitter.prototype = {

        on: function(event, fn){
            this._events = this._events || {};
            this._events[event] = this._events[event] || [];
            this._events[event].push(fn);
            return {
                context:this,
                event:event,
                type:"on",
                callback: fn,
                makeOnce: function()
                {
                    this.disable();
                    var res = this.context.once(this.event, this.callback);
                    for(var i in res)
                    {
                        this[i] = res[i];
                    }
                },
                disable: function()
                {
                    this._enabled = false;
                    this.context.off(this.event, this.callback);
                },
                enable: function()
                {
                    if(this._enabled !== false) return;
                    this._enabled = true;
                    this.context.on(this.event, this.callback);
                }
            };
        },

        once: function(event, fn){
            this._events = this._events || {};
            this._events[event] = this._events[event] || [];
            this._events[event].push(["once", fn]);
            return {
                context:this,
                event:event,
                type:"off",
                callback: fn,
                makeOn: function()
                {
                    this.disable();
                    var res = this.context.on(this.event, this.callback);
                    for(var i in res)
                    {
                        this[i] = res[i];
                    }
                },
                disable: function()
                {
                    this._enabled = false;
                    this.context.off(this.event, this.callback);
                },
                enable: function()
                {
                    if(this._enabled !== false) return;
                    this._enabled = true;
                    this.context.once(this.event, this.callback);
                }
            };
        },

        off: function(event, fn){
            this._events = this._events || {};
            if (event in this._events === false) return;
            //return if successfully spliced on event
            if(this._events[event].splice(this._events[event].indexOf(fn), 1).length > 0) return;
            //handle once events
            for (var i = 0; i < this._events[event].length; i++)
            {
                //if once, remove
                if(typeof this._events[event][i] === "object" && this._events[event][0] === "once" && this._events[event][i][1] === fn)
                {
                    this._events[event].splice(this._events[event][i], 1);
                }
            }
            return this;
        },

        emit: function(event, data){
            data = data || {};
            this._events = this._events || {};
            if (!this._events[event] && !this._events[_allEvent]) return;
            var responses = [];
            if(this._events[event]){
                for (var i = 0; i < this._events[event].length; i++)
                {
                    var res;
                    //if once, remove
                    if(this._events[event][i][0] === "once")
                    {
                        var fn = this._events[event][i][1];
                        this._events[event].splice(i, 1);
                        res = fn.apply(this, data);
                    }
                    else res = this._events[event][i].apply(this, data);
                    responses.push(res);
                }
            }
            if(this._events[_allEvent]){
                for (var i = 0; i < this._events[_allEvent].length; i++){
                    var res, fn;
                    //if once, remove
                    if(this._events[_allEvent][0] === "once")
                    {
                        fn = this._events[_allEvent][i][1];
                        this._events[_allEvent].splice(i, 1);
                    }
                    else {
                        fn = this._events[_allEvent][i];
                    }

                    res = fn.apply(this, [event].concat(data));             
                    responses.push(res);
                }
            }
            return responses;
        }
    };
    
    //////////
    
    var Mouse = {},
    emitter = new Emitter();

    Mouse.root = Mouse.lastRoot = window;

    Mouse.setRoot = function(r)
    {
        Mouse.lastRoot = Mouse.root;
        if(typeof r === "string") r = document.querySelector(r);
        if(typeof r === "undefined" || typeof r.addEventListener !== "function") console.warn("Invalid root, setting to window.");
        //Get Mouse.root element to add event listeners to
        Mouse.root = (typeof r !== "undefined" && typeof r.addEventListener === "function") ? r : (typeof window.addEventListener === "function" ? window : "nosupport");
        //handle if browser doesn't support event listeners(old ie), or if no window (not in browser)
        if(typeof Mouse.root === "undefined") throw new Error("Mouse must be run in a browser");
        if(Mouse.root === "nosupport") throw new Error("Mouse must be run in a browser with support for addEventListener. IE8 and below, and similar old browsers are not supported.");
        Mouse.run();
        return Mouse;
    };

    var state = Mouse.state = {
       moving: false,
       down: false,
       up: true,
       left:false,
       right:false,
       x:0,
       y:0,
       pos:{
          x:0,
          y:0,
          window:{
              x:0,
              y:0
          },
          screen:{
              x:0,
              y:0
          },
          last:{
              x:0,
              y:0,
              window:{
                  x:0,
                  y:0
              },
              screen:{
                  x:0,
                  y:0
              },
              down:{
                  x:0,
                  y:0,
                  window:{
                      x:0,
                      y:0
                  }
              },
              up:{
                  x:0,
                  y:0,
                  window:{
                      x:0,
                      y:0
                  },
              }
          },
          
       },
    };

    Mouse.events = {
       move:['mousemove', 'touchmove'],
       down:['mousedown', 'touchstart'],
       up:['mouseup', 'touchend']        
   };

    var initialMouseEvents = {
        move:['mousemove', 'touchmove'],
        down:['mousedown', 'touchstart'],
        up:['mouseup', 'touchend']        
    };
    
    Mouse.customEvents = {
        swipe:{
            config:{
                minPx: 10
            },
            initialize: function()
            {
                Mouse.on("up", this.trigger.bind(this));
            },
            trigger: function(e)
            {
                var sx = state.pos.last.down.x,
                    sy = state.pos.last.down.y,
                    ex = state.x,
                    ey = state.y;
                    
                var dx = ex - sx,
                    dy = ey - sy;
                                        
                if(Math.abs(dx) > Math.abs(dy) && dx > this.config.minPx) 
                {
                    emitter.emit("swipe", ["right", [dx, dy]])
                    emitter.emit("swiperight", [[dx, dy]]);
                }
                if(Math.abs(dx) > Math.abs(dy) && dx < -this.config.minPx) 
                {
                    emitter.emit("swipe", ["left", [dx, dy]])
                    emitter.emit("swipeleft", [[dx, dy]]);
                }
                if(Math.abs(dx) < Math.abs(dy) && dy > this.config.minPx) 
                {
                    emitter.emit("swipe", ["down", [dx, dy]])
                    emitter.emit("swipedown", [[dx, dy]]);
                }
                if(Math.abs(dx) < Math.abs(dy) && dy < -this.config.minPx) 
                {
                    emitter.emit("swipe", ["up", [dx, dy]])
                    emitter.emit("swipeup", [[dx, dy]]);
                }

            }
        }
        
    };

    Mouse.onlyTouch = function()
    {
        initialMouseEvents.move = ['touchmove'];
        initialMouseEvents.down = ['touchstart'];
        initialMouseEvents.up = ['touchend'];
        return Mouse;
    };

    Mouse.onlyMouse = function()
    {
        initialMouseEvents.move = ['mousemove'];
        initialMouseEvents.down = ['mousedown'];
        initialMouseEvents.up = ['mouseup'];
        return Mouse;
    };
    
    Mouse.rejections = [];

    function getOffset(obj) 
    {
        try { var box = obj.getBoundingClientRect() }
        catch(e) { throw new Error("Invalid DOM Element") };

        var left = box.left;
        var top = box.top;

        return [left, top];
    }
    
    //run listeners
    var state = Mouse.state,
    rejections = Mouse.rejections;
    var listeners = {
        init:function(e)
        {
            //if Mouse.root was changed
            if(rejections.indexOf(e.type) !== -1) return false;

            //right click / mousedown
            if (e.which === 3 || e.button === 2) state.right = true;
            else state.left = true;

            //mobile pos
            if(e.changedTouches && e.changedTouches[0])
            {
                var x = e.changedTouches[0].clientX;
                var y = e.changedTouches[0].clientY;
            }
            
            //desktop pos
            else
            {
                var x = e.clientX;
                var y = e.clientY;
            }

            //last pos in window
            state.pos.last.window.x = state.pos.window.x;
            state.pos.last.window.y = state.pos.window.y;

            //cur pos in window
            state.pos.window.x = x;
            state.pos.window.y = y;

            //calc cur pos in Mouse.root
            if(Mouse.root !== window)
            {
               var offset = getOffset(Mouse.root);
                x = x - offset[0];
                y = y - offset[1];                        
            }

            //prevent duplicate events from messing up last values
            if(state.x === x && state.y === y) return false;

            //last pos in Mouse.root
            state.pos.last.x = state.x;
            state.pos.last.y = state.y;

            //cur pos in Mouse.root
            state.x = state.pos.x = x;
            state.y = state.pos.y = y;
            
            //last pos in screen
            state.pos.last.screen.x = state.pos.screen.x;
            state.pos.last.screen.y = state.pos.screen.y;

            //cur pos in screen
            state.pos.screen.x = e.screenX;
            state.pos.screen.y = e.screenY;

            return true;
        },
        move: function(e)
        {
            //call init method. if Mouse.root has changed, remove old Mouse.root's event listener
            if(!listeners.init(e)) Mouse.root.removeEventListener(e.type, listeners.move);
            
            state.moving = true;

            var time = 20;

            //set moving to false after specified time in ms
            setTimeout(function() { if(state.moving)state.moving = false; }, time);
        },
        down:function(e)
        {
            state.right = false;
            state.left = false;
            
            //call init method. if Mouse.root has changed, remove old Mouse.root's event listener
            if(!listeners.init(e)) Mouse.root.removeEventListener(e.type, listeners.down);
            
            state.down = true;
            state.up = false;
            state.pos.last.down.x = state.x;
            state.pos.last.down.y = state.y;
            state.pos.last.down.window.x = state.pos.window.x;
            state.pos.last.down.window.y = state.pos.window.y;
        },
        up:function(e)
        {
            //call init method. if Mouse.root has changed, remove old Mouse.root's event listener
            if(!listeners.init(e)) Mouse.root.removeEventListener(e.type, listeners.up);
            
            state.down = false;
            state.up = true;
            state.pos.last.up.x = state.x;
            state.pos.last.up.y = state.y;
            state.pos.last.down.window.x = state.pos.window.x;
            state.pos.last.down.window.y = state.pos.window.y;
        }
    };
    
    //user-defined listeners
    _listeners = [];

    /**
     * @method run - Starts the engine to record the state to Mouse.state
     * @param rejections - an array of event types to not listen to. Can be mousemove, touchmove, mousedown, touchstart, mouseup, touchend
     */
    Mouse.run = function()
    {
        if(typeof rejections === "string") rejections = rejections.split(",");
        var rejections = typeof rejections === "object" ? rejections : [];

        for(var name in initialMouseEvents)
        {
            for(var j in initialMouseEvents[name])
            {
                //remove previous events if defined
                Mouse.lastRoot.removeEventListener(initialMouseEvents[name][j], listeners[name]);
                //add new events
                Mouse.root.addEventListener(initialMouseEvents[name][j], listeners[name], true);
            }
        }
        
        _listeners.forEach(function(listener, i)
        {    
            listener.off();
            listener.el = Mouse.root;
            delete _listeners[i];
            Mouse[listener.amt](listener.event, listener.el, listener.callback, listener.useCapture); 
        });
        
        _listeners = removeUndefined(_listeners);

        return Mouse;
    };
    
    function inObjRecursive(obj, needle)
    {
        if(needle instanceof Array) 
        {
            for(var i = 0; i < needle.length; i++)
            {
                if(!inObjRecursive(obj, needle[i])) return false;
            }
            return true;
        }
        for(var i in obj)
        {
            if(obj[i] === needle || i === needle || (obj[i].indexOf && obj[i].indexOf(needle) !== -1)) return true;
        }
        return false;
    }
    
    function removeUndefined(arr)
    {
        var n = [];
        for(var i in arr) if(arr[i] !== undefined) n.push(arr[i]);
        return n;
    }
    
    //sets Mouse.root element as DOM element to listen to events from
    function getArgs(args)
    {
        Array.prototype.splice.call(args,1,0,Mouse.root);
        return args;
    }

    function get(event)
    {
        //if arguments < 3
        //args are (event, callback)
        //if arguments > 2
        //args are (event, el, callback, useCapture)
        //get element/s to listen to, callback function and useCapture
        var el = (arguments.length > 2 && typeof arguments[1] === "object") ? arguments[1] : window;
        var callback = arguments.length === 2 ? arguments[1] : (typeof arguments[1] === "function" ? arguments[1] : (typeof arguments[2] === "function" ? arguments[2] : arguments[3]));    
        var useCapture = false;
        for(var i = 0; i < arguments.length; i++) if(arguments[i] === true) useCapture = true;

        //handle errors
        if(typeof arguments[0] === "undefined") return false;
        if(typeof callback === "undefined") 
        {
            console.trace("No callback specified. Not listening for event.");   
            return false;
        }     
        if(typeof el.addEventListener === "undefined") 
        {
            console.warn("Invalid DOM object. Not listening for event.", arguments[1]);
            return false;
        }

        //sets to object that called this function, e.g. mouse, if undefined defaults to events declared at top
        var events = this.events || events;

        //handle if event/s in custom event map
        if(Array.isArray(event) || (typeof event === "string" && event.split(",").length > 1) || event in events)
        {
            if(typeof event === "string") event = event.split(",");
            for(var i = 0; i < event.length; i++)
            {
                if(event[i] in events) 
                {
                    var e = events[event[i]];

                    for(var j = 0; j < e.length; j++)
                    {
                        if(j === 0) event.splice(i, 1, e[j]);
                        else event.splice(i, 0, e[j]);
                    }
                }
            }
        }

        function run(func, type, event, el, callback, useCapture)
        {
            //handle single
            if(!Array.isArray(event) && (typeof event === "object" || (typeof event === "string" && event.split(",").length === 1)))
            {   
                function once(e)
                {
                    callback.apply(this, arguments);
                    el.removeEventListener(event, once);
                }
                if(type === "once") el[func](event, once, useCapture);
                else el[func](event, callback, useCapture);

                
            }

            //handle multiple
            else
            {
                if(typeof event === "string") event = event.split(",");
                for(var i = 0; i < event.length; i++)
                {
                    run(func, type, event[i], el, callback, useCapture);
                }
            }
        }

        return {
            run:run,
            el:el,
            callback:callback,
            event:event,
            useCapture:useCapture
        };
    }
    
    var DOMEvents = Object.getOwnPropertyNames(document).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(document)))).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(window))).filter(function(i)
    {
      return !i.indexOf('on') && (document[i] == null || typeof document[i] == 'function');
    }).filter(function(elem, pos, self)
    {
      return self.indexOf(elem) == pos;
    }).map(function(str)
    {
        return str.substr(2);
    });    

    Mouse.on = function(event)
    {
        var obj = get.apply(this, arguments);
        if(!obj) return false;
        
        //custom events
        if(DOMEvents.indexOf(event) === -1 && !(event in Mouse.events) && !inObjRecursive(Mouse.events, event))
        {
            return emitter.on(event, obj.callback);
        }
        
        //DOM Events
        obj.run("addEventListener", "on", obj.event, obj.el, obj.callback, obj.useCapture);
                
        var ev = obj;
        ev.event = event;
        ev.off = function()
        {
            Mouse.off(this.event, this.el, this.callback);
        };
        ev.amt = "on";
        _listeners.push(ev);
        return ev;
    }

    Mouse.once = function(event)
    {
        var obj = get.apply(this, arguments);
        if(!obj) return false;
        
        //custom events
        if(DOMEvents.indexOf(event) === -1 && !(event in Mouse.events) && !inObjRecursive(Mouse.events, event))
        {
            return emitter.once(event, obj.callback);
        }

        obj.run("addEventListener", "once", obj.event, obj.el, obj.callback, obj.useCapture);
        
        var ev = obj;
        ev.event = event;
        ev.off = function()
        {
            Mouse.off(this.event, this.el, this.callback);
        };
        ev.amt = "once";
        _listeners.push(ev);
        return ev;
    }

    Mouse.off = function(event)
    {
        var obj = get.apply(this, arguments);
        if(!obj) return false;
        
        //custom events
        if(DOMEvents.indexOf(event) === -1 && !(event in Mouse.events))
        {
            return emitter.off(event, obj.callback);
        }
        
        if(event in Mouse.events) event = Mouse.events[event];
        
        if(obj instanceof Array)
        {
            obj.forEach(function(val, key)
            {
                obj.run("removeEventListener", "off", val, obj.el, obj.callback);
            });
        }
        else obj.run("removeEventListener", "off", obj.event, obj.el, obj.callback);
        
        return Mouse.root;
    }
    
    //init custom events if any
    for(var i in Mouse.customEvents)
    {
        var e = Mouse.customEvents[i];
        if(typeof e.initialize === "function") e.initialize();
    }

    Mouse.setRoot(window);
    
    if(typeof module !== 'undefined'){
        module.exports = Mouse;
    } else {
        this.mouse = Mouse;
    }

})(this);
