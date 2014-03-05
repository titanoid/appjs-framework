function App() {
    this.views = [];
    this.currentView = null;

    this.sidepanels = { left: null, right: null};
    this.currentSidepanel = null;

    this.location = {path:'', params:null};
}

App.prototype.init = function() {
    var objref = this;
    window.addEventListener('resize', function() {
        objref.currentView.adjust();
    });

    document.body.addEventListener('touchstart', function(event){ event.preventDefault(); })
    document.body.addEventListener('touchmove', function(event){ event.preventDefault(); })

    // init sidepanels 
    var sidepanels = document.getElementsByClassName('app-sidepanel');
    for(var i=0; i<sidepanels.length; i++) {
        if (sidepanels[i].dataset.position == 'left')
            this.sidepanels.left = new AppSidePanel(sidepanels[i], this);
        else if (sidepanels[i].dataset.position == 'right')
            this.sidepanels.right = new AppSidePanel(sidepanels[i], this);
    }

    // init views
    var views = document.getElementsByClassName('app-view');
    for(var i=0; i<views.length; i++) {
        this.addView(views[i]);
    }

    // console.log(this);

    var storedHash = window.location.hash;
    window.setInterval(function () {
        if (window.location.hash != storedHash) {
            storedHash = window.location.hash;
            objref.doRoute(storedHash);
        }
    }, 100);


    this.doRoute(window.location.hash);
}

App.prototype.navigate = function(url) {
    window.location.href = url;
}

App.prototype.goBack = function() {
    window.history.back();
}

App.prototype.doRoute = function(url) {
    var urldata = this.parseUrl(url);
    this.location.path = urldata.path;
    this.location.params = urldata.params;
    // alert(this.location.path);

    view = this.getViewByURL(this.location.path);

    if (view != null) {
        this.showView(view.id);
    }
    else {
        alert('invalid url : '+url);
        this.navigate('');
    }

    return false;
}

App.prototype.parseUrl = function(url) {
    url = url.replace('#', '');
    var urldata = { path:null, params:null };

    if (url.search("\\?") != -1) {
        var arr = url.split("?");
        urldata.path = arr[0];
        urldata.params = {};

        var param_arr = arr[1].split("&");
        for(var i=0; i < param_arr.length; i++) {
            var item_arr = param_arr[i].split("=");
            urldata.params[item_arr[0]] = item_arr[1];
        }
    }
    else {
        urldata.path = url;
        urldata.params = null;
    }

    return urldata;
}

App.prototype.addView  = function(view) {
    var appview = new AppView(view, this);
    this.views.push(appview);
}

App.prototype.currentSidepanel = function() {
    // if (this.sidepanels)
}

App.prototype.showView = function(id) {
    var objref = this;

    if (this.currentSidepanel != null) {
        var on_sp_hide = function() {
            this.removeEvent('onSidepanelAfterHide', on_sp_hide);
            setTimeout(function(){
                var view = objref.getView(id);

                if (view.show(objref.currentView) !== false)
                    objref.currentView = view;
            },1);
        }
        this.currentSidepanel.wrapper.addEvent('onSidepanelAfterHide', on_sp_hide);
        this.currentSidepanel.hide();
        return;
      }

    setTimeout
    var view = this.getView(id);

    if (view.show(this.currentView) !== false)
        this.currentView = view;
} 

App.prototype.getView = function(id) {
    for(var i=0; i<this.views.length; i++) {
        if (this.views[i].id == id)
            return this.views[i];
    }
    return null;
}

App.prototype.getViewByURL = function(url) {
    if (url == '')
        return this.views[0];

    for(var i=0; i<this.views.length; i++) {
        if (this.views[i].url == url)
            return this.views[i];
    }
    return null;
}


////////////////////////////////////////////////////////////
////////////////// Compatibility Snippets //////////////////
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

////////////////////////////////////////////////////////
/////////////// HELPER FUNCTIONS //////////////////////
Element.prototype.animate = function(properties, time, callbacks) {
    
    this.easing  = {
        linear: function(currentIteration, totalIterations, changeInValue, startValue) {
            return changeInValue * currentIteration / totalIterations + startValue;
        },
        easeInQuad: function(currentIteration, totalIterations, changeInValue, startValue) {
            return changeInValue * (currentIteration /= totalIterations) * currentIteration + startValue;
        },
        easeOutQuad: function(currentIteration, totalIterations, changeInValue, startValue) {
            return -changeInValue * (currentIteration /= totalIterations) * (currentIteration - 2) + startValue;
        },
        easeInOutQuad: function(currentIteration, totalIterations, changeInValue, startValue) {
            if ((currentIteration /= totalIterations / 2) < 1) {
                return changeInValue / 2 * currentIteration * currentIteration + startValue;
            }
            return -changeInValue / 2 * ((--currentIteration) * (currentIteration - 2) - 1) + startValue;
        },
        easeInCubic: function(currentIteration, totalIterations, changeInValue, startValue) {
            return changeInValue * Math.pow(currentIteration / totalIterations, 3) + startValue;
        },
        easeOutCubic: function(currentIteration, totalIterations, changeInValue, startValue) {
            return changeInValue * (Math.pow(currentIteration / totalIterations - 1, 3) + 1) + startValue;
        },
        easeInOutCubic: function(currentIteration, totalIterations, changeInValue, startValue) {
            if ((currentIteration /= totalIterations / 2) < 1) {
                return changeInValue / 2 * Math.pow(currentIteration, 3) + startValue;
            }
            return changeInValue / 2 * (Math.pow(currentIteration - 2, 3) + 2) + startValue;
        },
        easeInQuart: function(currentIteration, totalIterations, changeInValue, startValue) {
            return changeInValue * Math.pow (currentIteration / totalIterations, 4) + startValue;
        },
        easeOutQuart: function(currentIteration, totalIterations, changeInValue, startValue) {
            return -changeInValue * (Math.pow(currentIteration / totalIterations - 1, 4) - 1) + startValue;
        },
        easeInOutQuart: function(currentIteration, totalIterations, changeInValue, startValue) {
            if ((currentIteration /= totalIterations / 2) < 1) {
                return changeInValue / 2 * Math.pow(currentIteration, 4) + startValue;
            }
            return -changeInValue / 2 * (Math.pow(currentIteration - 2, 4) - 2) + startValue;
        },
        easeInQuint: function(currentIteration, totalIterations, changeInValue, startValue) {
            return changeInValue * Math.pow (currentIteration / totalIterations, 5) + startValue;
        },
        easeOutQuint: function(currentIteration, totalIterations, changeInValue, startValue) {
            return changeInValue * (Math.pow(currentIteration / totalIterations - 1, 5) + 1) + startValue;
        },
        easeInOutQuint: function(currentIteration, totalIterations, changeInValue, startValue) {
            if ((currentIteration /= totalIterations / 2) < 1) {
                return changeInValue / 2 * Math.pow(currentIteration, 5) + startValue;
            }
            return changeInValue / 2 * (Math.pow(currentIteration - 2, 5) + 2) + startValue;
        },
        easeInSine: function(currentIteration, totalIterations, changeInValue, startValue) {
            return changeInValue * (1 - Math.cos(currentIteration / totalIterations * (Math.PI / 2))) + startValue;
        },
        easeOutSine: function(currentIteration, totalIterations, changeInValue, startValue) {
            return changeInValue * Math.sin(currentIteration / totalIterations * (Math.PI / 2)) + startValue;
        },
        easeInOutSine: function(currentIteration, totalIterations, changeInValue, startValue) {
            return changeInValue / 2 * (1 - Math.cos(Math.PI * currentIteration / totalIterations)) + startValue;
        },
        easeInExpo: function(currentIteration, totalIterations, changeInValue, startValue) {
            return changeInValue * Math.pow(2, 10 * (currentIteration / totalIterations - 1)) + startValue;
        },
        easeOutExpo: function(currentIteration, totalIterations, changeInValue, startValue) {
            return changeInValue * (-Math.pow(2, -10 * currentIteration / totalIterations) + 1) + startValue;
        },
        easeInOutExpo: function(currentIteration, totalIterations, changeInValue, startValue) {
            if ((currentIteration /= totalIterations / 2) < 1) {
                return changeInValue / 2 * Math.pow(2, 10 * (currentIteration - 1)) + startValue;
            }
            return changeInValue / 2 * (-Math.pow(2, -10 * --currentIteration) + 2) + startValue;
        },
        easeInCirc: function(currentIteration, totalIterations, changeInValue, startValue) {
            return changeInValue * (1 - Math.sqrt(1 - (currentIteration /= totalIterations) * currentIteration)) + startValue;
        },
        easeOutCirc: function(currentIteration, totalIterations, changeInValue, startValue) {
            return changeInValue * Math.sqrt(1 - (currentIteration = currentIteration / totalIterations - 1) * currentIteration) + startValue;
        },
        easeInOutCirc: function(currentIteration, totalIterations, changeInValue, startValue) {
            if ((currentIteration /= totalIterations / 2) < 1) {
                return changeInValue / 2 * (1 - Math.sqrt(1 - currentIteration * currentIteration)) + startValue;
            }
            return changeInValue / 2 * (Math.sqrt(1 - (currentIteration -= 2) * currentIteration) + 1) + startValue;
        }
    }

    this.getEasing = function(func, currentIteration, totalIterations, changeInValue, startValue) {
        if (typeof this.easing[func] == 'function')
            return this.easing[func].call(this, currentIteration, totalIterations, changeInValue, startValue);
        else
            return this.easing.linear.call(this, currentIteration, totalIterations, changeInValue, startValue);
    }

    this.animate_properties = properties || {};
    this.callbacks = callbacks || {};

    var props = Object.keys(this.animate_properties);
    for(var i = 0; i < props.length; i++) {
        var key = props[i];
        this.animate_properties[key].start = this.animate_properties[key].start || 0;
        this.animate_properties[key].end = this.animate_properties[key].end || 0;
        this.animate_properties[key].pattern = this.animate_properties[key].pattern || null;
        this.animate_properties[key].easing = this.animate_properties[key].easing || 'linear';
        this.animate_properties[key].unit = this.animate_properties[key].unit || 'px';
    }


    this.animate_time = time;
    this.delay = 10;
    this.progress = 0;

    this.stepCount = Math.round(this.animate_time / this.delay);
    this.currentStep = 0;

    var objref = this;

    this.timer = setInterval(function(){

        objref.currentStep++;
        objref.progress = objref.currentStep / objref.stepCount;
        for(var key in objref.animate_properties) {
            
            var changeInValue = (objref.animate_properties[key].end - objref.animate_properties[key].start);

            var cval = objref.getEasing(objref.animate_properties[key].easing, objref.currentStep, objref.stepCount, changeInValue, objref.animate_properties[key].start);
            // console.log(cval);
            if (objref.animate_properties[key].pattern == null)
                 objref.style[key] = cval + objref.animate_properties[key].unit;
            else
                 objref.style[key] = objref.animate_properties[key].pattern.replace('%val%', cval);
        }
        
        if (typeof objref.callbacks.onProgress == 'function')
                objref.callbacks.onProgress.call(objref,objref.progress);

        if (objref.currentStep >= objref.stepCount) {
            clearInterval(objref.timer);
            if (typeof objref.callbacks.onFinish == 'function')
                objref.callbacks.onFinish.call();
        }

    }, this.delay);
}


Element.prototype.animateBK = function(properties, time, callbacks) {
    this.getDelta = function(progress, func) {
        switch(func) {
            case 'linear' :
                return progress;
            case 'ease-in' :
                return Math.pow(progress, 2);
            default:
                return progress;
        }
    }

    this.animate_properties = properties || {};
    this.callbacks = callbacks || {};

    var props = Object.keys(this.animate_properties);
    for(var i = 0; i < props.length; i++) {
        var key = props[i];
        this.animate_properties[key].start = this.animate_properties[key].start || 0;
        this.animate_properties[key].end = this.animate_properties[key].end || 0;
        this.animate_properties[key].pattern = this.animate_properties[key].pattern || null;
        this.animate_properties[key].easing = this.animate_properties[key].easing || 'linear';
        this.animate_properties[key].unit = this.animate_properties[key].unit || 'px';
    }

    this.animate_time = time;
    this.delay = 10;
    this.progress = 0;

    this.stepCount = Math.round(this.animate_time / this.delay);
    this.currentStep = 0;

    var objref = this;

    this.timer = setInterval(function(){

        objref.currentStep++;
        objref.progress = objref.currentStep / objref.stepCount;
        for(var key in objref.animate_properties) {
            var delta = objref.getDelta(objref.progress, objref.animate_properties[key].easing)
            var cval = objref.animate_properties[key].start + ( (objref.animate_properties[key].end - objref.animate_properties[key].start) * delta );
            if (objref.animate_properties[key].pattern == null)
                 objref.style[key] = cval + objref.animate_properties[key].unit;
             else
                 objref.style[key] = objref.animate_properties[key].pattern.replace('%val%', cval);
        }


        
        if (typeof objref.callbacks.onProgress == 'function')
                objref.callbacks.onProgress.call(objref,objref.progress);

        if (objref.currentStep >= objref.stepCount) {
            clearInterval(objref.timer);
            if (typeof objref.callbacks.onFinish == 'function')
                objref.callbacks.onFinish.call();
        }

        // alert(objref.progress)

    }, this.delay);
}

Element.prototype.addEvent = function(type, listener, useCapture) {
    var i, evt;

    if (typeof useCapture == 'undefined')
        useCapture = false;

    this.events = this.events || [];

    this.events.push([this, type, listener, useCapture]);

    return this.addEventListener(type, listener, useCapture);
}

Element.prototype.removeEvent = function(type, listener) {
    var i, evt;

    this.events = this.events || [];

    for (i = 0; i < this.events.length; i += 1) {

        evt = this.events[i];

        if (this === evt[0] && type === evt[1]) {
            this.removeEventListener(type, evt[2], evt[3]);
            this.events.splice(i, 1);
        }
    }
}

Element.prototype.addClass = function(classname) {
    if (this.className.search(classname) != -1)
        return;
    else {
        this.className = this.className+' '+classname;
    }
}

Element.prototype.removeClass = function(classname) {
    if (this.className.search(classname) == -1)
        return;
    else {
        this.className = this.className.replace( classname , '' ).replace(/\s{2,}/g, ' ');
    }
}

Element.prototype.enableTap = function() {
    if (typeof this.onclick == 'function') {
        this.clickfunction = this.onclick;
        this.onclick = null;

        this.touchstarted = false;

        var btn = this;
        this.addEventListener('touchstart', function() {
            if (btn.touchstarted) {
                return;
            }
            else {
                btn.touchstarted = true;
                this.touchmoved = false;
                console.log(this);
            }
        });

        this.addEventListener('touchmove', function() {
            if (this.touchstarted) {
                this.touchmoved = true;
                console.log(this);
            }
        });

        this.addEventListener('touchend', function() {
            this.touchstarted = false;
            console.log(this);

            if (! this.touchmoved) {
                this.clickfunction.call();
            }
        });
    }
}

function createEvent(event_name) {
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
}

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
 
