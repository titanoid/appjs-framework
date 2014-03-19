AppDialog = {

	visible: false,
	message: null, 
	type: null,
	callback: null,
	callback_data: null,
	actions:null,

	wrapper: null,
	dialog: null,
	dialog_msg: null,


	alert: function(msg, callback) {
		this._create(msg, 'alert', callback);
	},

	_getDialogDOMClassname: function() {
		switch(this.type) {
			case 'alert': return 'dialog-alert';
			case 'confirm': return 'dialog-confirm';
		}
	},

	_beforeShow: function() {
		console.log('before show');
		this.wrapper.style.opacity = '0';

		if (this.type == 'alert' || this.type == 'confirm') {
			this.dialog.style.opacity = '0';
			this.dialog.style.transform = 'scale(0)';
			this.dialog.style.WebkitTransform = 'scale(0)';
			window.addEventListener('resize', AppDialog._adjust);
			console.log('settin scale to 0');
		}

		var objref = this;
		this.wrapper.style.transition = 'all 200ms';
		this.wrapper.style.WebkitTransition = 'all 200ms';
		this.dialog.style.transition = 'all 200ms';
		this.dialog.style.WebkitTransition = 'all 200ms';
		console.log('setting transition to 200ms');
	},

	_show: function() {
		console.log('show');
		if (this.type == 'alert' || this.type == 'confirm') {
			this.dialog.style.transform = 'scale(1)';
			this.dialog.style.WebkitTransform = 'scale(1)';
			this.dialog.style.opacity = '1';
			this.wrapper.style.opacity = '1';
			console.log('setting scale to 1');
		}

	},

	_beforeHide: function() {
		console.log("befor hide");
		this.wrapper.style.transition = 'all 200ms';
		this.wrapper.style.WebkitTransition = 'all 200ms';
		this.dialog.style.transition = 'all 200ms';
		this.dialog.style.WebkitTransition = 'all 200ms';
	},

	_afterHide: function() {
		console.log('after hide');
		window.removeEventListener('resize', AppDialog._center);
		if (this.wrapper != null)
				objref.wrapper.parentNode.removeChild(this.wrapper);

		this.wrapper = null;
		this.dialog = null;
		this.message = null;
		this.type = null;

		if (typeof this.callback == 'function') {
			this.callback.call(this, this.callback_data);
		}

		this.callback = null;
		this.callback_data = null;
		this.visible = false;
	},

	_hide: function() {
		console.log("hide");
		//hide for alert,confirm
		if (this.type == 'alert' || this.type == 'confirm') {
			this.dialog.style.transform = 'scale(0)';
			this.dialog.style.WebkitTransform = 'scale(0)';
			this.dialog.style.opacity = '0';
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

		this.dialog_msg = document.createElement('DIV');
		this.dialog_msg.innerHTML = msg;
		this.dialog.appendChild(this.dialog_msg);

		//creating dialog buttons
		var dom_actions = document.createElement('DIV');
		dom_actions.className = 'dialog-actions';
		var actions = this._getActions();
		for(var i=0; i<actions.length; i++) {
			dom_actions.appendChild(actions[i]);
		}
		this.dialog.appendChild(dom_actions);
		this.wrapper.appendChild(this.dialog);
		document.body.appendChild(this.wrapper);

		var objref = this;
		setTimeout(function() {
				
				objref._adjust();

				setTimeout(function(){ 
						
						objref._beforeShow();

						setTimeout(function(){ 
							objref._show();
						}, 1);

				}, 1)

		}, 1);

	},

	close: function() {
		
		var objref = this;

		this.dialog.addEvent('webkitTransitionEnd', function() {
			objref._afterHide();
		});

		this._hide();
	},

	_adjust: function() {
		console.log('adjust');
		if (AppDialog.type == 'alert' || AppDialog.type == 'confirm') {
			var dialog_h = Math.min(AppDialog.dialog_msg.clientHeight + 60, window.innerHeight * 0.9);

			AppDialog.dialog.style.transition = 'all 1ms';
			AppDialog.dialog.style.WebkitTransition = 'all 1ms';
			AppDialog.dialog.style.height = dialog_h + 'px';
			AppDialog.dialog.style.marginLeft = '-'+ (AppDialog.dialog.clientWidth / 2)+'px';
			AppDialog.dialog.style.marginTop = '-'+ (dialog_h / 2)+'px';
		}

	},

	_getActions: function() {
		var actions = [];
		if (this.type == 'alert') {
			var item = document.createElement('BUTTON');
			item.innerHTML = 'OK';
			item.onclick = function() { AppDialog.closeAlert(); };
			item.enableTap();
			actions.push(item);
		}

		if (this.type == 'confirm') {
			var item_yes = document.createElement('BUTTON');
			item_yes.innerHTML = 'Yes';
			item_yes.className = 'yes';
			item_yes.onclick = function() { AppDialog.closeAlert(); };
			item_yes.enableTap();
			actions.push(item_yes);

			var item_no = document.createElement('BUTTON');
			item_no.innerHTML = 'Yes';
			item_no.className = 'yes';
			item_no.onclick = function() { AppDialog.closeAlert(); };
			item_no.enableTap();
			actions.push(item_no);
		}


		return actions;
	},

}