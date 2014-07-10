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

module.exports = Emitter;
