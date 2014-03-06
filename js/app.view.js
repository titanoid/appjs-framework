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


    this.onAfterShow = Utils.createEvent('onViewAfterShow');
    this.onAfterHide = Utils.createEvent('onViewAfterHide');
    this.onBeforeShow = Utils.createEvent('onViewBeforeShow');
    this.onBeforeHide = Utils.createEvent('onViewBeforeHide');

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
    scroll_settings.onscroll = (this.wrapper.dataset.onscroll != '' ? this.wrapper.dataset.onscroll : false);
    
    this.scroller = new AppScroller(this.body.getElementsByClassName('view-body-inner')[0], scroll_settings);
    // this.scroller.init();
}

AppView.prototype.bodyContent = function(content) {
    if (typeof content == 'undefined') {
        var body_content = this.scroller == null ? this.body.innerHTML : this.scroller.wrapper.innerHTML;
        return body_content;
    }
    else {
        if (this.scroller == null) {
            this.body.innerHTML = content;
        }
        else {
            this.scroller.wrapper.innerHTML = content;
            this.scroller.refresh();
        }
    }
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
    objref.wrapper.style.transition = 'all 200ms';
    objref.wrapper.style.WebkitTransition = 'all 200ms';
    setTimeout(function(){
        objref.wrapper.addEvent('webkitTransitionEnd', function() { objref.afterShow(); } );
        objref.wrapper.style.opacity = '1';
        // objref.wrapper.style.webkitTransform = 'translateX(0px)';
    }, 100);
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

    Utils.stopPropagation(event);

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

    Utils.stopPropagation(event);
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
    Utils.stopPropagation(event);
}