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

//////////////////////////////////////////////////////
////////////////  APP VIEW  //////////////////////////
function AppView(view, appref) {
    this.id = view.id;
    this.url = view.dataset.url;

    this.appref = appref;

    if (view.dataset.swipeleftsp == 'true')
        this.leftsp = this.appref.sidepanels.left;
    else
        this.leftsp = null;

    if (view.dataset.swiperightsp == 'true')
        this.rightsp = this.appref.sidepanels.right;
    else
        this.rightsp = null;

    this.wrapper = view;
    this.header = this.wrapper.getElementsByClassName('view-header')[0];

    if (typeof this.header == 'undefined') {
        this.header = null;
    }
    
    this.body = this.wrapper.getElementsByClassName('view-body')[0];

    // this.wrapper.style.display = 'none';
    this.wrapper.style.visibility = 'hidden';
    this.state = 'hidden';


    this.onAfterShow = createEvent('onViewAfterShow');
    this.onAfterHide = createEvent('onViewAfterHide');
    this.onBeforeShow = createEvent('onViewBeforeShow');
    this.onBeforeHide = createEvent('onViewBeforeHide');

    if (typeof view.dataset.onbeforeshow != 'undefined') {
        this.wrapper.addEventListener('onViewBeforeShow', window[view.dataset.onbeforeshow]);
    }
    
    if (typeof view.dataset.onbeforehide != 'undefined') {
        this.wrapper.addEventListener('onViewBeforeHide', window[view.dataset.onbeforehide]);
    }

    if (typeof view.dataset.onaftershow != 'undefined') {
        this.wrapper.addEventListener('onViewAfterShow', window[view.dataset.onaftershow]);
    }

    if (typeof view.dataset.onafterhide != 'undefined') {
        this.wrapper.addEventListener('onViewAfterHide', window[view.dataset.onafterhide]);
    }    

    //enable swipe sidepanels
    if ('ontouchstart' in window) {
        this.enableTap();
    }

    var objref = this;
    if (this.leftsp != null || this.rightsp != null) {
        this.wrapper.addEventListener('touchstart', function(event) { objref.touchstart(event); });
        this.wrapper.addEventListener('touchmove', function(event) { objref.touchmove(event); });
        this.wrapper.addEventListener('touchend', function(event) { objref.touchend(event); });
    
        this.touch_start_x = null;
        this.touch_start_y = null;
        this.touch_current_x = null;
        this.touch_current_y = null;
        this.touch_distance_x = null;
        this.touch_distance_y = null;
        this.touch_sp = null;
        this.is_swipe = false;
    }


    //enable scroller
    this.scroller = null;
    if (view.dataset.scrollx == 'true' || view.dataset.scrolly == 'true') {
        this.initScroller();
    }
    
    ///////////////////
    this.currentView = null;
}

AppView.prototype.initScroller = function() {
    
    var scroll_settings = {scrollx: false, scrolly:false, bounce: false }

    scroll_settings.scrollx = (this.wrapper.dataset.scrollx == 'true' ? true : false);
    scroll_settings.scrolly = (this.wrapper.dataset.scrolly == 'true' ? true : false);
    scroll_settings.bounce = (this.wrapper.dataset.scrollbounce == 'true' ? true : false);
    
    this.scroller = new AppScroller(this.body.getElementsByClassName('view-body-inner')[0], scroll_settings);

    // this.scroller.init();
}

AppView.prototype.beforeShow = function() {
    
    this.state = 'showing';

    this.wrapper.dispatchEvent(this.onBeforeShow);

    this.wrapper.style.transition = 'none';
    this.wrapper.style.WebkitTransition = 'none';

    

    this.wrapper.style.opacity = '0';
    // this.wrapper.style.webkitTransform = 'translateX('+window.innerHeight+'px)';

    this.wrapper.style.zIndex = 3;

    this.wrapper.style.visibility = 'visible';
    // this.wrapper.style.display = 'block';

    this.adjust();
}

AppView.prototype.enableTap = function() {
    var elements = this.wrapper.getElementsByTagName('*');
    for(var i=0; i<elements.length; i++) {
        //console.log(elements[i].tagName+' '+i);
        elements[i].enableTap();
    }
}

AppView.prototype.beforeHide = function() {
    this.state = 'hiding';
    this.wrapper.style.zIndex = 1;
    this.wrapper.dispatchEvent(this.onBeforeHide);

}


AppView.prototype.show = function(currentView) {
    if (this.state != 'hidden')
        return false;

    this.currentView = currentView;

    if (this.currentView != null) {
        this.currentView.beforeHide();
    }

    this.beforeShow();    

    var objref = this;
    setTimeout(function(){
        objref.wrapper.style.transition = 'all 200ms';
        objref.wrapper.style.WebkitTransition = 'all 200ms';
        objref.wrapper.addEvent('webkitTransitionEnd', function() { objref.afterShow(); } );
        objref.wrapper.style.opacity = '1';
        // objref.wrapper.style.webkitTransform = 'translateX(0px)';
    }, 1);

}

AppView.prototype.hide = function() {
    this.visible = false;
    // this.wrapper.style.display = 'none';
    this.wrapper.style.visibility = 'hidden';
    this.state = 'hidden';
    var objref = this;
    this.wrapper.removeEvent('webkitTransitionEnd', objref.afterShow);

    this.afterHide();
}

AppView.prototype.afterShow = function() {
    this.wrapper.dispatchEvent(this.onAfterShow);

    this.wrapper.removeEvent('webkitTransitionEnd', this.afterShow);
    this.wrapper.style.transition = 'none';
    this.wrapper.style.WebkitTransition = 'none';

    if (this.currentView != null) {
        this.currentView.hide();
        this.currentView = null;
    }
    this.state = 'visible';
    if (this.scroller != null) {
        this.scroller.refresh();
        this.scroller.scrollTo(0, 0);
    }
    else {
        var myScroll = new IScroll(this.body, {mouseWheel: true, scrollbars: 'custom', scrollX: true, scrollY:true, fadeScrollbars:true, bounce:true});
    }
}

AppView.prototype.afterHide = function() {
    this.wrapper.dispatchEvent(this.onAfterHide);
    this.state = 'hidden';
}

AppView.prototype.adjust = function() {
    this.wrapper.style.left = '0px';
    this.wrapper.style.top = '0px';
    
    this.body.style.left = '0px';
    this.body.style.width = '100%';
    
    if (this.header != null) {
        var hsize = this.header.offsetHeight;
        this.body.style.top =  hsize + 'px';
        this.body.style.height = (window.innerHeight - hsize) + 'px';
    }
    else {
        this.body.style.top = '0px';
        this.body.style.height = window.innerHeight + 'px';
    }

    if (this.scroller != null) {
        this.scroller.refresh();
    }
}

AppView.prototype.touchstart = function(event) {
    this.touch_start_x = event.touches[0].clientX;
    this.touch_start_y = event.touches[0].clientY;

    //this.appref.currentView.wrapper.style.webkitTransform = 'translateZ(0)';
}

AppView.prototype.touchmove = function(event) {
    if (this.touch_start_x == null || this.touch_start_y == null)
        return;

    this.touch_current_x = event.touches[0].clientX;
    this.touch_current_y = event.touches[0].clientY;

    this.touch_distance_x = this.touch_current_x - this.touch_start_x;
    this.touch_distance_y = this.touch_current_y - this.touch_start_y;

    if (Math.abs(this.touch_distance_x) >= 3 && (Math.abs(this.touch_distance_x) > Math.abs(this.touch_distance_y)) )
        this.is_swipe = true;

    if (! this.is_swipe)
        return;


    if (this.appref.currentSidepanel == null) {
        if (this.touch_distance_x > 0) {
            this.touch_sp = this.leftsp;
            this.leftsp.beforeShow();
        }
        else if(this.touch_distance_x < 0) {
            this.touch_sp = this.rightsp;
            this.rightsp.beforeShow();
        }
    }
    else {
        if (this.touch_distance_x > 0) {
            this.touch_sp = this.appref.currentSidepanel;
            this.rightsp.beforeHide();
        }
        else if(this.touch_distance_x < 0) {
            this.touch_sp = this.appref.currentSidepanel;
            this.leftsp.beforeHide();
        }   
    }

    if (this.touch_sp != null && this.touch_sp.state == 'showing') {
        if (this.touch_distance_x > 0 && this.touch_distance_x <= this.leftsp.width)
            this.wrapper.style.webkitTransform = 'translateX('+this.touch_distance_x+'px)';

        if (this.touch_distance_x < 0 && Math.abs(this.touch_distance_x) <= this.rightsp.width)
            this.wrapper.style.webkitTransform = 'translateX('+this.touch_distance_x+'px)';
    }

    if (this.touch_sp != null && this.touch_sp.state == 'hiding') {
        if (this.touch_distance_x > 0 && this.touch_distance_x <= this.rightsp.width && this.touch_sp.position == 'right')
            this.wrapper.style.webkitTransform = 'translateX(-'+(this.rightsp.width - this.touch_distance_x)+'px)';

        if (this.touch_distance_x < 0 && Math.abs(this.touch_distance_x) <= this.leftsp.width && this.touch_sp.position == 'left')
            this.wrapper.style.webkitTransform = 'translateX('+(this.leftsp.width - Math.abs(this.touch_distance_x))+'px)';   
    }

}

AppView.prototype.touchend = function(event) {
    if (this.touch_distance_x == 0 || ! this.is_swipe)
        return;
    var swipe_trigger = 40;
    var objref = this;
    setTimeout(function(){
        if (objref.touch_sp != null && objref.touch_sp.state == 'showing') {
            if (Math.abs(objref.touch_distance_x) > swipe_trigger ) {
                objref.touch_sp.show();
            }
            else {
                objref.touch_sp.hide();
                objref.touch_sp = null;
            }
        }
        else if (objref.touch_sp != null && objref.touch_sp.state == 'hiding') {
            if (Math.abs(objref.touch_distance_x) > swipe_trigger ) {
                objref.touch_sp.hide();
                objref.touch_sp = null;
            }
            else {
                objref.touch_sp.show();
            }
        }

        objref.touch_start_x = null;
        objref.touch_start_y = null;
        objref.touch_current_x = null;
        objref.touch_current_y = null;
        objref.touch_distance_x = null;
        objref.touch_distance_y = null;
        objref.is_swipe = false;
    }, 1);

    
}
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
function AppSidePanel(sidepanel, appref) {
    this.id = sidepanel.id;
    this.appref = appref;
    this.wrapper = sidepanel;
    this.position = sidepanel.dataset.position;
    
    this.width = this.wrapper.offsetWidth;

    this.wrapper.style.zIndex = 0;

    this.wrapper.style.top = '0px';
    if (this.position == 'right')
        this.wrapper.style.left = (window.innerWidth - this.width)+'px';
    if (this.position == 'left')
        this.wrapper.style.left = '0px';


    this.state = 'hidden';

    this.onAfterShow = createEvent('onSidepanelAfterShow');
    this.onAfterHide = createEvent('onSidepanelAfterHide');
    this.onBeforeShow = createEvent('onSidepanelBeforeShow');
    this.onBeforeHide = createEvent('onSidepanelBeforeHide');
    
    if (typeof sidepanel.dataset.onbeforeshow != 'undefined') {
        this.wrapper.addEventListener('onSidepanelBeforeShow', window[sidepanel.dataset.onbeforeshow]);
    }
    
    if (typeof sidepanel.dataset.onbeforehide != 'undefined') {
        this.wrapper.addEventListener('onSidepanelBeforeHide', window[sidepanel.dataset.onbeforehide]);
    }

    if (typeof sidepanel.dataset.onaftershow != 'undefined') {
        this.wrapper.addEventListener('onSidepanelAfterShow', window[sidepanel.dataset.onaftershow]);
    }

    if (typeof sidepanel.dataset.onafterhide != 'undefined') {
        this.wrapper.addEventListener('onSidepanelAfterHide', window[sidepanel.dataset.onafterhide]);
    }
    //////////////////////
    this.viewCover = null;
}

AppSidePanel.prototype.beforeShow = function() {
    this.wrapper.style.visibility = 'visible';
    this.wrapper.style.zIndex = 2;
    this.state = 'showing';
    this.wrapper.dispatchEvent(this.onBeforeShow);
}

AppSidePanel.prototype.show = function() {
    if (this.state == 'visible')
        return;
    if (this.appref.currentSidepanel != null && this.appref.currentSidepanel != this)
        this.appref.currentSidepanel.hide();
    
    this.beforeShow();

    var objref = this;
    
    this.appref.currentView.wrapper.style.transition = 'all 200ms ease-in-out';
    this.appref.currentView.wrapper.style.WebkitTransition = 'all 200ms ease-in-out';
    this.appref.currentView.wrapper.addEvent('webkitTransitionEnd', function() { objref.afterShow(); } );

    setTimeout(function(){
        if (objref.position == 'left')
            objref.appref.currentView.wrapper.style.webkitTransform = 'translateX('+objref.width+'px)';
        if (objref.position == 'right')
            objref.appref.currentView.wrapper.style.webkitTransform = 'translateX(-'+objref.width+'px)';
    },100);
}

AppSidePanel.prototype.afterShow = function() {
    var objref = this;
    this.appref.currentView.wrapper.removeEvent('webkitTransitionEnd', function() { objref.afterShow(); } );
    this.appref.currentView.wrapper.style.transition = 'none';
    this.appref.currentView.wrapper.style.WebkitTransition = 'none';
    this.appref.currentSidepanel = this;
    this.state = 'visible';
    this.wrapper.dispatchEvent(this.onAfterShow);
}

AppSidePanel.prototype.beforeHide = function() {
    this.state = 'hiding';
}

AppSidePanel.prototype.hide = function() {
    if (this.state == 'hidden')
        return;

    this.beforeHide();

    var objref = this;
    this.appref.currentView.wrapper.style.transition = 'all 200ms ease-in-out';
    this.appref.currentView.wrapper.style.WebkitTransition = 'all 200ms ease-in-out';
    this.appref.currentView.wrapper.addEvent('webkitTransitionEnd', function() { objref.afterHide(); } );

    setTimeout(function(){
        if (objref.position == 'left') {
            objref.appref.currentView.wrapper.style.webkitTransform = 'translateX(0px)';
            objref.appref.currentView.wrapper.style.transform = 'translateX(0px)';
        }
        if (objref.position == 'right') {
            objref.appref.currentView.wrapper.style.webkitTransform = 'translateX(0px)';
            objref.appref.currentView.wrapper.style.transform = 'translateX(0px)';
        }
    },100);
}

AppSidePanel.prototype.afterHide = function() {
    this.appref.currentView.wrapper.removeEvent('webkitTransitionEnd', this.afterHide);
    this.appref.currentView.wrapper.style.transition = 'none';
    this.appref.currentView.wrapper.style.WebkitTransition = 'none';
    this.appref.currentSidepanel = null;
    this.state = 'hidden';
    this.wrapper.style.visibility = 'hidden';
    this.wrapper.style.zIndex = 0;
    this.wrapper.dispatchEvent(this.onAfterHide);
}

AppSidePanel.prototype.toggle = function() {
    if (this.state == 'visible')
        this.hide();
    else if (this.state == 'hidden')
        this.show();
    else
        return;
}

AppSidePanel.prototype.enableViewCover = function() {
    this.viewCover = document.createElement('DIV');
    this.viewCover.style.position = 'absolute';
    this.viewCover.style.zIndex = 9999999;
    this.viewCover.style.left = '0px';
    this.viewCover.style.top = '0px';
    this.viewCover.style.width = '100%';
    this.viewCover.style.height = '100%';
    this.viewCover.style.backgroundColor = 'rgba(255, 0, 0, 0.33)';
    // this.viewCover.onclick

    this.viewRef.wrapper.appendChild(this.viewCover);
}

AppSidePanel.prototype.disableViewCover = function() {
    this.viewRef.removeChild(this.viewCover);
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
 
