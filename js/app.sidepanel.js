function AppSidePanel(sidepanel, appref) {
    this.id = sidepanel.id;
    this.appref = appref;
    this.wrapper = sidepanel;
    this.position = sidepanel.dataset.position;
    
    this.width = this.wrapper.offsetWidth;

    this.wrapper.style.zIndex = 0;

    this.wrapper.style.top = '0px';
    if (this.position == 'right') {
        this.wrapper.style.left = '100%';
        this.wrapper.style.marginLeft = '-'+this.width+'px';
    }
    if (this.position == 'left')
        this.wrapper.style.left = '0px';


    this.state = 'hidden';

    this.onAfterShow = Utils.createEvent('onSidepanelAfterShow');
    this.onAfterHide = Utils.createEvent('onSidepanelAfterHide');
    this.onBeforeShow = Utils.createEvent('onSidepanelBeforeShow');
    this.onBeforeHide = Utils.createEvent('onSidepanelBeforeHide');
    
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

    if ('ontouchstart' in window) {
        var elements = this.wrapper.getElementsByTagName('*');
        for(var i=0; i<elements.length; i++) {
            //console.log(elements[i].tagName+' '+i);
            elements[i].enableTap();
        }
    }
}

AppSidePanel.prototype.beforeShow = function() {
    this.wrapper.style.visibility = 'visible';
    this.wrapper.style.zIndex = 2;
    this.state = 'showing';
    this.wrapper.dispatchEvent(this.onBeforeShow);
}

AppSidePanel.prototype.show = function() {
    if (this.state == 'visible' || (this.appref.currentSidepanel != null && this.appref.currentSidepanel != this))
        return;

    // if (this.appref.currentSidepanel != null && this.appref.currentSidepanel != this)
    //     this.appref.currentSidepanel.hide();
    
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
    },1);
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
    

    setTimeout(function(){
        objref.appref.currentView.wrapper.addEvent('webkitTransitionEnd', function() { objref.afterHide(); } );
        if (objref.position == 'left') {
            objref.appref.currentView.wrapper.style.webkitTransform = 'translateX(0px)';
            objref.appref.currentView.wrapper.style.transform = 'translateX(0px)';
        }
        if (objref.position == 'right') {
            objref.appref.currentView.wrapper.style.webkitTransform = 'translateX(0px)';
            objref.appref.currentView.wrapper.style.transform = 'translateX(0px)';
        }
    },10);
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