(function() {
  /*	
  EventDriver - Richard Lyon, Feb 24 2011
  
  A simple class to allow jQuery-like trigger+bind events
  
  For example:
  
  	a = new EventDriver; (or an object that extends it, as intended)
  	b = (function(x,y) { console.log(this,x,y) } )
  
  	a.bind( 'yoyo', b )
  	a.trigger( 'yoyo', 3.1412, 42 )
  
  Results in "[Object EventDriver], 3.1412, 42" being logged (or something similar)
  */  var EventDriver;
  var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  EventDriver = (function() {
    function EventDriver() {}
    EventDriver.prototype.events = {};
    EventDriver.prototype.contexts = {};
    EventDriver.prototype.bind = function(event, fn, context) {
      if (!this.bound(event)) {
        this.events[event] = [];
        this.contexts[event] = [];
      }
      this.events[event].push(fn);
      return this.contexts[event].push(context);
    };
    EventDriver.prototype.unbind = function(event) {
      this.events[event] = [];
      return this.contexts[event] = [];
    };
    EventDriver.prototype.trigger = function() {
      var args, event, f, i, _base, _fn, _ref, _ref2, _results;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (this.bound(event)) {
        _ref = this.events[event];
        _fn = __bind(function(i, f) {}, this);
        _results = [];
        for (i in _ref) {
          f = _ref[i];
          _fn(i, f);
                    if ((_ref2 = (_base = this.contexts[event])[i]) != null) {
            _ref2;
          } else {
            _base[i] = this;
          };
          _results.push(f.apply(this.contexts[event][i], args));
        }
        return _results;
      }
    };
    EventDriver.prototype.bound = function(event) {
      return this.events[event] != null;
    };
    return EventDriver;
  })();
  this.EventDriver = EventDriver;
}).call(this);
