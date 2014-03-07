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

