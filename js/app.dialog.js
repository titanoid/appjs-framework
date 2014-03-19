AppDialog = {

	visible: false,
	message: null, 
	type: null,
	callback: null,
	actions:null,

	wrapper: null,
	dialog: null,
	dialog_msg: null,


	alert: function(msg, callback) {
		this._create(msg, 'alert', callback);
	},

	confirm: function(msg, callback) {
		this._create(msg, 'confirm', callback);
	},

	select: function(msg, options, callback) {
		this._create(msg, 'select', callback, options);
	},

	_setTransition: function() {
		this.wrapper.style.transition = 'all 200ms';
		this.wrapper.style.WebkitTransition = 'all 200ms';
		this.dialog.style.transition = 'all 200ms';
		this.dialog.style.WebkitTransition = 'all 200ms';
	},

	_resetTransition: function() {
		AppDialog.dialog.style.transition = '1ms';
		AppDialog.dialog.style.WebkitTransition = '1ms';
		AppDialog.dialog.removeEventListener('webkitTransitionEnd', AppDialog._resetTransition );
	},

	_getDialogDOMClassname: function() {
		switch(this.type) {
			case 'alert': return 'app-dialog dialog-alert';
			case 'confirm': return 'app-dialog dialog-confirm';
			case 'select': return 'app-dialog dialog-select';
		}
	},

	_beforeCreate: function() {
		this.wrapper.style.opacity = '0';
		this.dialog.visibility = 'hidden';

		if (this.type == 'alert' || this.type == 'confirm') {
			this.dialog.style.opacity = '0';
			this.dialog.style.transform = 'scale(0)';
			this.dialog.style.WebkitTransform = 'scale(0)';
			window.addEventListener('resize', AppDialog._adjust);
		}
	},

	_show: function() {
		if (this.type == 'alert' || this.type == 'confirm') {
			this.dialog.style.visibility = 'visible';
			this.dialog.style.transform = 'scale(1)';
			this.dialog.style.WebkitTransform = 'scale(1)';
			this.dialog.style.opacity = '1';
			this.wrapper.style.opacity = '1';
		}

		if (this.type == 'select') {
			this.dialog.style.visibility = 'visible';
			this.dialog.style.transform = 'translateY(0px)';
			this.dialog.style.WebkitTransform = 'translateY(0px)';
			this.wrapper.style.opacity = '1';
		}
	},

	_afterCreate: function() {

		if (this.type == 'select') {
			var h = this.dialog.clientHeight;
			this.dialog.style.transform = 'translateY('+h+'px)';
			this.dialog.style.WebkitTransform = 'translateY('+h+'px)';
			this.wrapper.onclick = function() { AppDialog.close(); }
			this.wrapper.enableTap();
		}

		this._adjust();

		this.dialog.addEvent('webkitTransitionEnd', AppDialog._resetTransition );

		var objref = this;
		setTimeout(function() {
			objref._setTransition();
			objref._show();
		}, 50);

	},

	_beforeHide: function() {
		this._setTransition();
	},

	_afterHide: function(data) {
		window.removeEventListener('resize', AppDialog._center);
		if (this.wrapper != null)
				this.wrapper.parentNode.removeChild(this.wrapper);

		this.wrapper = null;
		this.dialog = null;
		this.message = null;
		this.type = null;

		if (typeof this.callback == 'function') {
			this.callback.call(this, data);
		}

		this.callback = null;
		this.visible = false;
	},

	_hide: function() {
		//hide for alert,confirm
		if (this.type == 'alert' || this.type == 'confirm') {
			this.dialog.style.transform = 'scale(0)';
			this.dialog.style.WebkitTransform = 'scale(0)';
			this.dialog.style.opacity = '0';
			this.wrapper.style.opacity = '0';
		}

		if (this.type == 'select') {
			var h = this.dialog.clientHeight;
			this.dialog.style.transform = 'translateY('+h+'px)';
			this.dialog.style.WebkitTransform = 'translateY('+h+'px)';
			this.wrapper.style.opacity = '0';
		}
	},

	_create: function(msg, type, callback, actions) {
		if (this.visible) return;

		this.message = msg;
		this.type = type;
		this.callback = callback;
		this.actions = actions;

		//creating drop shadow
		this.wrapper = document.createElement('DIV');
		this.wrapper.className = "app-dialog-wrapper";

		//creating actual dialog
		this.dialog = document.createElement('DIV');
		this.dialog.className = this._getDialogDOMClassname();
		this.dialog.addEventListener('click', function(event) { Utils.stopPropagation(event); });

		this.dialog_msg = document.createElement('DIV');
		this.dialog_msg.className = 'dialog-msg';
		this.dialog_msg.innerHTML = msg;
		this.dialog.appendChild(this.dialog_msg);

		//creating dialog buttons
		var dom_actions = document.createElement('DIV');
		dom_actions.className = 'dialog-actions';
		var actions = this._getActions(actions);
		for(var i=0; i<actions.length; i++) {
			dom_actions.appendChild(actions[i]);
		}
		this.dialog.appendChild(dom_actions);
		this.wrapper.appendChild(this.dialog);

		this._beforeCreate();

		document.body.appendChild(this.wrapper);
		
		var objref = this;

		setTimeout(function() { objref._afterCreate() }, 1);
	},

	close: function(data) {
		
		var objref = this;

		data = data || null;

		this.dialog.addEvent('webkitTransitionEnd', function() {
			objref._afterHide(data);
		});

		this._beforeHide();

		setTimeout(function() {
			objref._hide();
		}, 10);
		
	},

	_adjust: function() {
		if (AppDialog.type == 'alert' || AppDialog.type == 'confirm') {
			var dialog_h = Math.min(AppDialog.dialog_msg.clientHeight + 60, window.innerHeight * 0.9);

			dialog_h = Math.max(dialog_h, 150);

			var left = Math.round(window.innerWidth / 2) - Math.round(AppDialog.dialog.clientWidth / 2);
			var top = Math.round(window.innerHeight / 2) - Math.round(dialog_h / 2);

			AppDialog.dialog.style.height = dialog_h + 'px';
			AppDialog.dialog.style.left = left + 'px';
			AppDialog.dialog.style.top = top + 'px';
		}
	},

	_getActions: function(options) {
		var actions = [];
		if (this.type == 'alert') {
			var item = document.createElement('BUTTON');
			item.innerHTML = 'OK';
			item.onclick = function() { AppDialog.close(); };
			item.enableTap();
			actions.push(item);
		}

		if (this.type == 'confirm') {
			var item_yes = document.createElement('BUTTON');
			item_yes.innerHTML = 'Yes';
			item_yes.className = 'yes';
			item_yes.onclick = function() { AppDialog.close('yes'); };
			item_yes.enableTap();
			actions.push(item_yes);

			var item_no = document.createElement('BUTTON');
			item_no.innerHTML = 'No';
			item_no.className = 'no';
			item_no.onclick = function() { AppDialog.close('no'); };
			item_no.enableTap();
			actions.push(item_no);
		}
		if (this.type == 'select') {
			for(var i=0; i<options.length; i++) {
				var item = document.createElement('BUTTON');
				item.innerHTML = options[i].value;
				var data = options[i].key;
				item.dataset.key = data;
				item.onclick = function(event) { var targ = Utils.getEventTarget(event);  AppDialog.close(targ.dataset.key); };
				item.enableTap();
				actions.push(item);
			}
		}

		return actions;
	},

}