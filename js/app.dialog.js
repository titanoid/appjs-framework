AppDialog = {

	visible: false,
	message: null, 
	type: null,
	transition: null,
	callback: null,

	dom_wrapper: null,
	dom_box: null,


	_parseSettings: function(settings) {
		this.message = settings.message || 'Are you sure?';

		this.type = settings.type || 'confirm';

		this.transition = settings.transition || 'fade';

		this.callback = settings.callback || null;
	},

	show: function(settings) {
		if (this.visible) return;

		this._parseSettings(settings);

		this.dom_wrapper = document.createElement('DIV');
		this.dom_wrapper.className = "app-dialog-wrapper";

		this.dom_box = document.createElement('DIV');
		this.dom_box.className = 'app-dialog-box';

		var dom_msg = document.createElement('DIV');
		dom_msg.className = 'dialog-msg';
		dom_msg.innerHTML = this.message;
		this.dom_box.appendChild(dom_msg);

		var dom_actions = document.createElement('DIV');
		dom_actions.className = 'dialog-actions';
		this.dom_box.appendChild(dom_actions);

		this.dom_wrapper.appendChild(this.dom_box);

		document.body.appendChild(this.dom_wrapper);

		// this.dom_wrapper.style.transition = 'all 200ms';
		// this.dom_wrapper.style.WebkitTransition = 'all 200ms';
		
		this.dom_box.style.visibility = 'visible';
	}
}