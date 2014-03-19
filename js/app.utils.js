var Utils = {
	
	stopPropagation : function(e) {
		e.stopPropagation();
  },
  cancelEvent : function(e) {
    e.preventDefault();
  },

	createEvent : function(event_name) {
	    var event;
	    if (document.createEvent) {
	        event = document.createEvent("HTMLEvents");
	        event.initEvent(event_name, true, true);
	    } else {
	        event = document.createEventObject();
	        event.eventType = event_name;
	    }

	    event.eventName = event_name;
	    return event;
	},

  getTouchPosition: function(event) {
      var pos = {x:null, y:null};

      if ('ontouchstart' in window) {
        if (typeof event.touches[0] != 'undefined') {
          pos.x = event.touches[0].clientX;
          pos.y = event.touches[0].clientY;
        }
        else if (typeof event.changedTouches[0] != 'undefined') {
          pos.x = event.changedTouches[0].pageX;
          pos.y = event.changedTouches[0].pageY;  
        }
        else {
          pos.x = null;
          pos.y = null;
        }
      }
      else {
        pos.x = event.clientX;
        pos.y = event.clientY;
      }
      return pos;
  },


  isDomElement: function(obj) {
    try {
      //Using W3 DOM2 (works for FF, Opera and Chrom)
      return obj instanceof HTMLElement;
    }
    catch(e){
      //Browsers not supporting W3 DOM2 don't have HTMLElement and
      //an exception is thrown and we end up here. Testing some
      //properties that all elements have. (works on IE7)
      return (typeof obj==="object") &&
        (obj.nodeType===1) && (typeof obj.style === "object") &&
        (typeof obj.ownerDocument ==="object");
    }
  },

  resetTraansition: function(el) {
      el.style.transition = 'all 1ms';
      el.style.WebkitTransition = 'all 1ms';
  },

}

if (!Object.keys) {
  Object.keys = (function () {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}


function App_BodyTouchStart(event) {
    if (typeof event.target.onclick == 'function' || typeof event.target.tapfunc == 'function') {
      if (event.target.onclick != null) {
        event.target.tapfunc = event.target.onclick;
        event.target.onclick = null;
      }

      event.target.touch_started = true;
      event.target.touch_moved = false;
      event.target.timer = null;
      var el = event.target;
      if (Utils.isDomElement(event.target)) {
          event.target.timer = setTimeout(function() {
          el.addClass('tap-active');
        }, 70);
      }
    }
    Utils.cancelEvent(event);
}

function App_BodyTouchMove(event) {
  if (event.target.touch_started === true) {
    event.target.touch_moved = true;
    if (Utils.isDomElement(event.target)) { 
      clearTimeout(event.target.timer);
      event.target.removeClass('tap-active');
    }
  }
  else {
    Utils.cancelEvent(event);
  }

  Utils.cancelEvent(event);
}

function App_BodyTouchEnd(event) {
    if (! event.target.touch_started) return;

    if (Utils.isDomElement(event.target)) { 
      clearTimeout(event.target.timer);
      event.target.removeClass('tap-active');
    }
    if (event.target.touch_moved !== true){
      // alert('calling click func');
      event.target.tapfunc.call();
    }

    
    event.target.touch_started = false;
    event.target.touch_moved = null;
    delete event.target.touch_started;
    delete event.target.touch_moved;

    Utils.cancelEvent(event);
}