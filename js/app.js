function App() {
    this.views = [];
    this.currentView = null;

    this.sidepanels = { left: null, right: null};
    this.currentSidepanel = null;

    this.spinner = null;

    this.location = {path:'', params:null};

    this.remoteViewPath = 'http://dev.appjsframework.com/view.php?id=%view-url%';
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
    view = this.getViewByURL(urldata.path);

    if (view != null) {
        this.location.path = urldata.path;
        this.location.params = urldata.params;
        this.showView(view.id);
    }
    else {
        var objref = this;
        //load remote view if not found locally
        var remote_url = this.remoteViewPath.replace('%view-url%', urldata.path);
        var ajax_settings = {
            spinner: true,
            spinnerShadow: false,
            json: false,
            callback : function(data) {
                if (data) {
                    document.write(data);
                    setTimeout(function() {
                        var view = objref.addViewByUrl(urldata.path);
                        objref.showView(view.id);
                    }, 10);
                    
                }
                else {
                    alert('invalid url : '+url);
                    objref.navigate('');
                }
            }
        }
        this.ajax(remote_url, ajax_settings);
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

App.prototype.addViewByUrl = function(url) {
    var views = document.getElementsByClassName('app-view');
    for(var i=0; i<views.length; i++) {
        if (views[i].dataset.url == url) {
            this.addView(views[i]);
            return views[i];
        }
    }
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

App.prototype.showSpinner = function(dropshadow) {
    if (this.spinner != null)
        return;


    this.spinner = document.createElement('DIV');
    this.spinner.addClass('app-spinner');
    var loading = document.createElement('DIV');
    loading.addClass('loading');
    this.spinner.appendChild(loading);

    dropshadow = dropshadow || false;
    
    if (dropshadow) {
        this.spinner.addClass('app-spinner-dropshadow');
    }

    document.body.appendChild(this.spinner);
}

App.prototype.hideSpinner = function() {
    if (this.spinner == null)
        return;

    var objref = this;
    var loading = this.spinner.getElementsByClassName('loading')[0];
    loading.style.visibility = 'hidden';
    setTimeout(function() {
        objref.spinner.parentNode.removeChild(objref.spinner);    
        objref.spinner = null;
    }, 1);
}


App.prototype.ajax = function(url, settings) {
    settings = settings || {};

    var callback = settings.callback || false;
    var json = settings.json || false;
    var spinner = settings.spinner || false;
    var spinnerShadow = settings.spinnerShadow || false;

    var xmlhttp = new XMLHttpRequest();

    if (spinner) 
        this.showSpinner(spinnerShadow);

    var objref = this;
    // Callback function when XMLHttpRequest is ready
    xmlhttp.onreadystatechange=function() {
        if(xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200) {
                if (spinner)
                    objref.hideSpinner();
                if (json)
                    var data = JSON.parse(xmlhttp.responseText);
                else
                    var data = xmlhttp.responseText;

                if (typeof callback == 'function')
                    callback.call(this, data);
                else
                    window[callback](data);
            }
            else {
                if (typeof callback == 'function')
                    callback.call(this, false);
                else
                    window[callback](false);
            }
        }
    };

    xmlhttp.open("GET", url , true);
    xmlhttp.send();
}
