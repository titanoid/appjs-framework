var AppSpinner = {

	visible: false,

	wrapper: null,
	container: null,
	spinner: null,

	show: function(dropshadow) {
		if (this.visible) return;

		this.visible = true;

		this.wrapper = document.createElement('DIV');
		this.wrapper.className = 'app-spinner-backdrop';
		if (dropshadow) {
        	this.wrapper.className = this.wrapper.className+' app-spinner-dropshadow';
    	}

		this.container = document.createElement('DIV');
		this.container.className = 'app-spinner-container';

		this.spinner = document.createElement('DIV');
		this.spinner.className = 'app-spinner';
		this.container.appendChild(this.spinner);

		this.wrapper.appendChild(this.container);
   	    
   	    document.body.appendChild(this.wrapper);

	},

	hide: function() {
		if (! this.visible) return;
		
		this.container.style.visibility = 'hidden';
		var objref = this;
		setTimeout(function(){
			objref.wrapper.parentNode.removeChild(objref.wrapper);
			objref.visible = false;	
			this.wrapper = null;
			this.container = null;
			this.spinner = null;
		}, 1);
		
	}

}