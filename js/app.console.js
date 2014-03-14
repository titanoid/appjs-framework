var AppConsole = {
	wrapper : null,
	inner: null,
	closer: null,

	touchStarted : null,
	touchMargin: {},

	logdata : [],


	log: function(obj) {
		this.logdata.push(obj);
		console.log(obj);
	},

	show: function() {
		if (this.wrapper != null) {
			this.wrapper.style.display = "block";
		}
		else {
			var objref = this;

			this.wrapper = document.createElement('DIV');
			this.wrapper.id = 'console-wrapper';
			this.wrapper.addEventListener('mousedown', function(event) { objref.onTouchStart(event); });
			this.wrapper.addEventListener('mousemove', function(event) { objref.onTouchMove(event); });
			this.wrapper.addEventListener('mouseup', function(event) { objref.onTouchEnd(event); });

			this.wrapper.addEventListener('touchstart', function(event) { objref.onTouchStart(event); });
			this.wrapper.addEventListener('touchmove', function(event) { objref.onTouchMove(event); });
			this.wrapper.addEventListener('touchend', function(event) { objref.onTouchEnd(event); });
			
			this.inner = document.createElement('DIV');
			this.inner.id = 'console-wrapper-inner';
			this.inner.addEventListener('mousedown', function(event) { Utils.stopPropagation(event); });
			this.inner.addEventListener('touchstart', function(event) { Utils.stopPropagation(event); });
			this.wrapper.appendChild(this.inner);

			this.closer = document.createElement('DIV');
			this.closer.id = "console-closer";
			this.closer.addEventListener('click', function(event) { objref.hide(); Utils.stopPropagation(event); });
			this.closer.enableTap();
			//this.closer.addEventListener('touchstart', function(event) { objref.hide(); Utils.stopPropagation(event); });
			this.wrapper.appendChild(this.closer);

			document.body.appendChild(this.wrapper);
		}
	},

	hide: function() {
		if (this.wrapper != null) {
			this.wrapper.style.display = 'none';
		}
	},

	destroy: function() {
		if (this.wrapper != null) {
			this.wrapper.parentNode.removeChild(this.wrapper);
			this.wrapper = null;
			this.inner = null;
			this.closer = null;
			this.touchStarted = null;
			this.touchMargin = {};
			this.logdata = [];
		}
	},

	onTouchStart: function(event) {
		this.touchStarted = true;
		var pos = Utils.getTouchPosition(event);
		this.touchMargin.x = pos.x - this.wrapper.offsetLeft;
		this.touchMargin.y = pos.y - this.wrapper.offsetTop;
	},

	onTouchMove: function(event) {
		if (! this.touchStarted) return;

		var pos = Utils.getTouchPosition(event);
		this.wrapper.style.left = (pos.x - this.touchMargin.x) + 'px';
		this.wrapper.style.top = (pos.y - this.touchMargin.y) + 'px';
	},

	onTouchEnd: function(event) {
		this.touchStarted = false;
	},

}