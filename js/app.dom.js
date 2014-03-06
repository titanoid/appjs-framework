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