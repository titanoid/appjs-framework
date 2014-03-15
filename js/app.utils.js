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
  }

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
