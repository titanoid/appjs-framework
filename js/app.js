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
