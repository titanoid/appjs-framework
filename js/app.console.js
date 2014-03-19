var appconsole = {
	visible: false,
	wrapper : null,
	header: null,
	body: null,
	body_inner : null,
	
	wrapperPos: {x:5, y:5},
	touchStarted : null,
	touchLastPos: {},

	logdata : [],

	scroller : null,
	maxLogitems: 100,

	log: function(obj) {
		console.log(obj);
		var item = this.createLogitem(obj);

		if (this.logdata.length >= this.maxLogitems) {
			if (this.wrapper != null)
				this.body_inner.removeChild(this.logdata[0]);

			this.logdata.splice(0, 1);
		}
		this.logdata.push(item);

		if (this.wrapper != null) {
			this.body_inner.appendChild(item);
			this.refreshScroller();
		}
	},

	displayLog: function() {
		for(var i=0; i<this.logdata.length; i++) {
			this.body_inner.appendChild(this.logdata[i]);
		}

		this.refreshScroller();
	},

	createLogitem: function(obj) {
		var item = document.createElement('DIV');
		item.className = 'console-log-item';
		item.innerHTML = obj.toString();
		// if (typeof obj == 'object')
		// 	item.innerHTML = JSON.stringify(obj);
		// else
		// 	item.innerHTML = obj;

		return item;
	},

	show: function() {
		if (this.wrapper != null) {
			this.wrapper.style.display = "block";
			this.adjust();
		}
		else {

			var objref = this;

			window.addEventListener('resize', function() {
				if (objref.visible)
        			objref.adjust();
    		});

			

			this.wrapper = document.createElement('DIV');
			this.wrapper.id = 'console-wrapper';
			this.wrapper.style.WebkitTransform = 'translate('+this.wrapperPos.x+'px, '+this.wrapperPos.y+'px)';
			
			this.header = document.createElement('DIV');
			this.header.id = "console-header";
			this.header.addEventListener('mousedown', function(event) { objref.onTouchStart(event); });
			this.header.addEventListener('mousemove', function(event) { objref.onTouchMove(event); });
			this.header.addEventListener('mouseup', function(event) { objref.onTouchEnd(event); });
			this.header.addEventListener('touchstart', function(event) { objref.onTouchStart(event); });
			this.header.addEventListener('touchmove', function(event) { objref.onTouchMove(event); });
			this.header.addEventListener('touchend', function(event) { objref.onTouchEnd(event); });

			var closer = document.createElement('DIV');
			closer.id = "console-icon-close";
			closer.className = "appicon appicon-remove";
			closer.onclick = function(event) { objref.hide(); Utils.stopPropagation(event); };
			closer.enableTap();
			this.header.appendChild(closer);

			var reset = document.createElement('DIV');
			reset.id = "console-icon-reset";
			reset.className = "appicon appicon-eye-close";
			reset.onclick = function(event) { objref.clean(); Utils.stopPropagation(event); };
			reset.enableTap();
			this.header.appendChild(reset);


			var title = document.createElement('DIV');
			title.id = 'console-title';
			title.innerHTML = 'app console';
			this.header.appendChild(title);



			this.body = document.createElement('DIV');
			this.body.id = 'console-body';
			this.body.addEventListener('mousedown', function(event) { Utils.stopPropagation(event); });
			this.body.addEventListener('touchstart', function(event) { Utils.stopPropagation(event); });
			this.body_inner = document.createElement('DIV');
			this.body_inner.id = 'console-body-inner';
			this.body.appendChild(this.body_inner);


			this.wrapper.appendChild(this.header);
			this.wrapper.appendChild(this.body);
		
			document.body.appendChild(this.wrapper);

			var scroll_settings = {scrollx: true, scrolly:true, bounce: false, autoHideScrollbars: false }
			this.scroller = new AppScroller(this.body, scroll_settings);

			this.adjust();

			this.displayLog();

			this.visible = true;

			setTimeout(function() {
				//closer.enableTap();
			}, 100);
			
		}
	},


	adjust: function() {
		this.body.style.height = (this.wrapper.clientHeight - this.header.clientHeight)+'px';
		this.refreshScroller(400);
	},

	refreshScroller: function(delay) {
		delay = delay || 300;
		var objref = this;
		setTimeout(function() {
			if (objref.scroller != null)
				objref.scroller.refresh();
			delete objref;
		}, delay);
	},

	hide: function() {
		if (this.wrapper != null) {
			this.wrapper.style.display = 'none';
			this.visible = false;
		}
	},

	destroy: function() {
		if (this.wrapper != null) {
			this.wrapper.parentNode.removeChild(this.wrapper);
			this.wrapper = null;
			this.header = null;
			this.body = null;
			this.body_inner = null;
			this.wrapperPos = {x:5, y:5};
			this.touchStarted = null;
			this.touchLastPos = {};
			this.logdata = [];
			this.scroller = null;
			this.visible = false;
			delete this.scroller;
		}
	},

	clean : function() {
		this.logdata = [];
		this.body_inner.innerHTML = '';
		this.refreshScroller();
	},

	onTouchStart: function(event) {
		this.touchStarted = true;
		this.touchLastPos = Utils.getTouchPosition(event);
	},

	onTouchMove: function(event) {
		if (! this.touchStarted) return;

		var pos = Utils.getTouchPosition(event);
		this.wrapperPos.x = this.wrapperPos.x + (pos.x - this.touchLastPos.x);
		this.wrapperPos.y = this.wrapperPos.y + (pos.y - this.touchLastPos.y);
		this.wrapper.style.WebkitTransform = 'translate('+this.wrapperPos.x+'px, '+this.wrapperPos.y+'px)';

		this.touchLastPos = pos;
	},

	onTouchEnd: function(event) {
		this.touchStarted = false;
	},
}
