var utils = {};
utils.easing = {
		quadratic: {
			style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			fn: function (k) {
				return k * ( 2 - k );
			}
		},
		circular: {
			style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
			fn: function (k) {
				return Math.sqrt( 1 - ( --k * k ) );
			}
		},
		bounce: {
			style: '',
			fn: function (k) {
				if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
					return 7.5625 * k * k;
				} else if ( k < ( 2 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
				} else if ( k < ( 2.5 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
				} else {
					return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
				}
			}
		}
	}

function AppScroller(wrapper, settings) {
	this.wrapper = wrapper;

	this.settings = settings;

	//enable disable scrolling (vertical or horizontal)
	this.hasScroll = {};
	this.hasScroll.x = this.settings.scrollx || false;
	this.hasScroll.y = this.settings.scrolly || false;
	
	this._disableScrollbars = this.settings.scrollbars || false;
	this.scrollbars = {x:false, y:false}

	this._autoHideScrollbars = (typeof this.settings.autoHideScrollbars != 'undefined' ? this.settings.autoHideScrollbars : true);
	

	this.settings.onscroll = this.settings.onscroll || false;

	//set starting scroll position
	this.scrollPosition = {x:0, y:0}

	//scroll width and height
	this._maxScrollX = null;
	this._maxScrollY = null;


	//mixed settings
	this._enableBounce = this.settings.bounce == true ? true : false;
	

	this._useTransform = this.settings.transform || this._hasTransform();
	this._useTransition = this.settings.transition || this._hasTransition();


	
	//private vars
	this._isTouching = false;
	this._isScrolling = false;

	this._touchStartPos = {x:null, y:null};
	this._touchLastPos = {x:null, y:null};
	this._touchCurrentPos = {x:null, y:null};
	this._touchStartTime = null;
	this._touchEndTime = null;

	this._trackingTimer = null;
	this._momentumData = null;
	this._targetScrollPos = {x:0, y:0};


	this.init();
}

AppScroller.prototype._hasTransform = function() {
	return true;
}

AppScroller.prototype._hasTransition = function() {
	return true;
}

AppScroller.prototype._getTouchPosition = function(event) {
	var pos = {x:null, y:null};
	
	if ('ontouchstart' in window) {
		if (typeof event.touches[0] != 'undefined') {
			pos.x = event.touches[0].clientX;
			pos.y = event.touches[0].clientY;
		}
		else if (typeof event.changedTouches[0] != 'undefined') {
			pos.x = event.changedTouches[0].pageX;
			pos.y = event.changedTouches[0].pageY;	
		}
		else {
			pos.x = null;
			pos.y = null;
		}
	}
	else {
		pos.x = event.clientX;
		pos.y = event.clientY;
	}
	return pos;
}

AppScroller.prototype.init = function() {
	if (this._useTransform && this._useTransition) {
		this.wrapper.style.transform = 'translateZ(0)';
		this.wrapper.style.WebkitTransform = 'translateZ(0)';
		this.wrapper.style.MozTransform = 'translateZ(0)';
		this.wrapper.style.MsTransform = 'translateZ(0)';
		this.wrapper.style.OTransform = 'translateZ(0)';

		this.wrapper.style.WebkitBackfaceVisibility = 'hidden';
		this.wrapper.style.MozBackfaceVisibility = 'hidden';
		this.wrapper.style.MsBackfaceVisibility = 'hidden';
		this.wrapper.style.backfaceVisibility = 'hidden';

		this.wrapper.style.perspective = '1000';
		this.wrapper.style.WebkitPerspective = '1000';
		this.wrapper.style.MozPerspective = '1000';
		this.wrapper.style.MsPerspective = '1000';
	}

	var objref = this;

 	if ('ontouchstart' in window) {
 		this.wrapper.addEventListener('touchstart', function(event) { objref._touchStart(event); });
		this.wrapper.addEventListener('touchmove', function(event) { objref._touchMove(event); });
    	this.wrapper.addEventListener('touchend', function(event) { objref._touchEnd(event); });
    }
    else {
		this.wrapper.addEventListener('mousedown', function(event) { objref._touchStart(event); });
		this.wrapper.addEventListener('mousemove', function(event) { objref._touchMove(event); });
    	this.wrapper.addEventListener('mouseup', function(event) { objref._touchEnd(event); });
    }

    if (this._useTransition) {
	    this.wrapper.addEventListener('transitionend', function(event) { objref._animateEnd(event); });
	    this.wrapper.addEventListener('webkitTransitionEnd', function(event) { objref._animateEnd(event); });
	    this.wrapper.addEventListener('oTransitionEnd', function(event) { objref._animateEnd(event); });
	    this.wrapper.addEventListener('MSTransitionEnd', function(event) { objref._animateEnd(event); });
	}

	this.onscroll = Utils.createEvent('onScroll');

	if (typeof window[this.settings.onscroll] == 'function') {
		this.wrapper.addEventListener('onScroll', window[this.settings.onscroll]);
	}

	this.tmp_el = this.wrapper.parentNode.getElementsByClassName('view-body-inner')[0];

	if (! this._disableScrollbars)
		this._initScrollbars();

	this.refresh();
}

AppScroller.prototype._touchStart = function(event) {
	this._isTouching = true;

	if (this._isScrolling) {
		this._animateEnd();
		// alert('stop scrolling');
	}

	if (this._autoHideScrollbars && ! this._disableScrollbars) {
		this.scrollbars.x.fadeIn(100);
		this.scrollbars.y.fadeIn(100);
	}


	// this.refresh();

	

	this._touchStartPos = this._getTouchPosition(event);

	this._touchLastPos.x = this._touchStartPos.x;
	this._touchLastPos.y = this._touchStartPos.y;

	this._touchStartTime = new Date().getTime();
}

AppScroller.prototype._touchMove = function(event) {
	if (! this._isTouching) {
		return;
	}

	this._isScrolling = true;

	this._touchCurrentPos = this._getTouchPosition(event);
		
	var scrollByX = this._touchCurrentPos.x - this._touchLastPos.x;
	var scrollByY = this._touchCurrentPos.y - this._touchLastPos.y;

	this._touchLastPos.x = this._touchCurrentPos.x;
	this._touchLastPos.y = this._touchCurrentPos.y;

	var destX = this.scrollPosition.x + scrollByX;
	var destY = this.scrollPosition.y + scrollByY;

	this.scrollTo(destX, destY); //scroll without animating
}

AppScroller.prototype._touchEnd = function(event) {
	if (! this._isTouching) {
		return;
	}
	this._isTouching = false;
	
	var curr_pos = this._getTouchPosition(event);

	
	var momentum = {duation:0};
	
	if (this.scrollPosition.x > 0 || this.scrollPosition.x < this._maxScrollX || this.scrollPosition.y > 0 || this.scrollPosition.y < this._maxScrollY) {
		this._isScrolling = false;
		this._bounceBack();
	}
	else {
		momentum = this._getMomentum(curr_pos);
		// document.getElementById('scroll_console').innerHTML = momentum.duration;
		if (momentum.duration > 0)
			this.scrollTo( momentum.destX, momentum.destY, {speed: momentum.duration, easing: momentum.easing} );	
		else {
			if (this._autoHideScrollbars && ! this._disableScrollbars) {
				this.scrollbars.x.fadeOut(200);
				this.scrollbars.y.fadeOut(200);
			}
		}
	}


	this._touchStartPos.x = null;
	this._touchStartPos.y = null;
	this._touchCurrentPos.x = null;
	this._touchCurrentPos.y = null;
}

AppScroller.prototype._getMomentum = function(curr_pos) {
	this._touchEndTime = new Date().getTime();

	var touch_duration = this._touchEndTime - this._touchStartTime;

	var dist_x = (curr_pos.x - this._touchStartPos.x);
	var dist_y = (curr_pos.y - this._touchStartPos.y);
	
	var speedX = this.hasScroll.x ? Math.abs( dist_x / touch_duration) : 0;
	var speedY = this.hasScroll.y ? Math.abs( dist_y / touch_duration) : 0;
	if (touch_duration >= 300) {
		speedX = 0;
		speedY = 0;
	}
	else {
		speedX = speedX * 0.8;
		speedY = speedY * 0.8;
	}
	
	var deceleration = 0.002;

	dist_x = (speedX * speedX) / ( 2 * deceleration) * ( dist_x < 0 ? -1 : 1 );
	dist_y = (speedY * speedY) / ( 2 * deceleration) * ( dist_y < 0 ? -1 : 1 );

	var dest_x = this.scrollPosition.x + dist_x;
	var dest_y = this.scrollPosition.y + dist_y;

	var duration = Math.max( (speedX / deceleration) , (speedY / deceleration) );
	var easing = 'circular';

	var dest_corrected = false, max_bounce = 50;


	if (dest_x > 0) {
		dest_x = dest_x - (dest_x * 0.8);
		dest_x = this._enableBounce ? Math.min(dest_x, max_bounce) : 0;
		dest_corrected = true;
	}
	else if (dest_x < this._maxScrollX) {
		dest_x = dest_x - (dest_x - this._maxScrollX) * 0.8;
		dest_x = this._enableBounce ? Math.max(dest_x, this._maxScrollX - max_bounce) : this._maxScrollX;
		dest_corrected = true;
	}

	if (dest_y > 0) {
		dest_y = dest_y - (dest_y * 0.9);
		dest_y = this._enableBounce ? Math.min(dest_y, max_bounce) : 0;
		dest_corrected = true;
	}
	else if (dest_y < this._maxScrollY) {
		dest_y = dest_y - (dest_y - this._maxScrollY) * 0.8;
		dest_y = this._enableBounce ? Math.max(dest_y, this._maxScrollY - max_bounce) : this._maxScrollY;
		dest_corrected = true;
	}

	if (dest_corrected) {
		easing = 'quadratic';
		dist_x = Math.abs(dest_x - this.scrollPosition.x);
		dist_y = Math.abs(dest_y - this.scrollPosition.y);
		duration_x = speedX == 0 ? 0 : Math.round(dist_x / speedX);
		duration_y = speedY == 0 ? 0 : Math.round(dist_y / speedY);

		if (duration_x != 0)
			duration_x = Math.max(duration_x, Math.abs(dist_x / 10));

		if (duration_y != 0)
			duration_y = Math.max(duration_y, Math.abs(dist_y / 10));

		duration = Math.max(duration_x, duration_y);
	}

	return {
			destX: dest_x,
			destY: dest_y,
			duration: duration,
			easing: easing
		};
}

AppScroller.prototype.scrollTo = function(x, y, animate_data) {
	this.wrapper.dispatchEvent(this.onscroll);

	var scrollByX = this.scrollPosition.x - x;
	var scrollByY = this.scrollPosition.y - y;

	// console.log('scroll before   '+x+':'+y);

	if (this._isTouching) { 
	 	if (this._enableBounce) {
	 		var delta = 0.8;
			if (x > 0) 
				x = x - Math.abs(scrollByX * delta);
			else if (x < this._maxScrollX)
				x = x + Math.abs(scrollByX * delta);
			
			if (y > 0) 
				y = y - Math.abs(scrollByY * delta);
			else if (y < this._maxScrollY)
				y = y + Math.abs(scrollByY * delta);
	 	}
	 	else {
			if (x > 0) 
				x = 0;
			else if (x < this._maxScrollX)
				x = this._maxScrollX;

			if (y > 0) 
				y = 0;
			else if (y < this._maxScrollY)
				y = this._maxScrollY;
		}
	}

	if (! this.hasScroll.x) x = 0;
	if (! this.hasScroll.y) y = 0;

	// console.log('scroll after   '+x+':'+y);
	
	var animate = animate_data || {speed:0, easing:'circular'};
	
	this._move(x, y, animate);
}

AppScroller.prototype._move = function(x, y, animate) {
	// console.log(animate);

	// this._targetScrollPos.x = x;
	// this._targetScrollPos.y = y;
	if (this._useTransform) {
		if (animate.speed == 0) {
			this.scrollPosition.x = x;
			this.scrollPosition.y = y;
			this.wrapper.style.webkitTransition = "none";
			this.wrapper.style.transition = "none";

			this.wrapper.style.transform = 'translate('+x+'px, '+y+'px) translateZ(0)';
			this.wrapper.style.WebkitTransform = 'translate('+x+'px, '+y+'px) translateZ(0)';
			this.wrapper.style.MsTransform = 'translate('+x+'px, '+y+'px) translateZ(0)';
			if (! this._disableScrollbars) {
				this.scrollbars.x.setPosition(x);
				this.scrollbars.y.setPosition(y);
			}
		}
		else {
			var easing_str = utils.easing[animate.easing].style;
			this.wrapper.style.webkitTransition = "all "+animate.speed+"ms "+easing_str;
			this.wrapper.style.transition = "all "+animate.speed+"ms "+easing_str;
			var objref = this;
			setTimeout(function(){
				objref.wrapper.style.transform = 'translate('+x+'px, '+y+'px) translateZ(0)';
				objref.wrapper.style.WebkitTransform = 'translate('+x+'px, '+y+'px) translateZ(0)';
				objref.wrapper.style.MsTransform = 'translate('+x+'px, '+y+'px) translateZ(0)';
				
				if (! objref._disableScrollbars) {
					objref.scrollbars.x.setPosition(x);
					objref.scrollbars.y.setPosition(y);
				}

			}, 0);
			
			//if not bouncing back
			if (animate.easing != 'bounce') {
				this._isScrolling = true;
				this._startTrackPosition();
			}


		}
	}
}

AppScroller.prototype._animateEnd = function() {
	var curr_scroll_pos = this._getCurrentPosition();
	this.scrollTo(curr_scroll_pos.x, curr_scroll_pos.y);

	if (this._useTransition) {
		this.wrapper.style.webkitTransition = "1ms";
		this.wrapper.style.transition = "1ms";
	}

	this.scrollPosition.x = curr_scroll_pos.x;
	this.scrollPosition.y = curr_scroll_pos.y;

	this._stopTrackPosition();

	if (this._isScrolling) {
		this._isScrolling = false;	
		this._bounceBack();
	}
	else {
		if (this._autoHideScrollbars && ! this._disableScrollbars && ! this._isTouching) {
			this.scrollbars.x.fadeOut(200);
			this.scrollbars.y.fadeOut(200);
		}
	}
}

AppScroller.prototype._bounceBack = function() {
	if (this._enableBounce && ! this._isScrolling) {
		var bounceBack = false;
		var x = this.scrollPosition.x;
		var y = this.scrollPosition.y;

		if (x > 0) {
			x = 0;
			bounceBack = true;
		}
		else if (x < this._maxScrollX) {
			x = this._maxScrollX;
			bounceBack = true;
		}

		if (y > 0) {
			y = 0;
			bounceBack = true;
		}
		else if (y < this._maxScrollY) {
			y = this._maxScrollY;
			bounceBack = true;
		}

		if (bounceBack) {
			this.scrollTo(x, y, {speed: 200, easing:'bounce'} );
			return true;
		}
		else
			return false;
	}
	else
		return false;
}

AppScroller.prototype._startTrackPosition = function() {
	var cons = document.getElementById('scroll_console');
	var objref = this;
	if (this._isScrolling) {
	    objref._trackingTimer = setInterval(function() {
	    	objref.wrapper.dispatchEvent(objref.onscroll);
	    }, 100);
	}
}

AppScroller.prototype._stopTrackPosition = function() {
	clearInterval(this._trackingTimer);
}

AppScroller.prototype._getCurrentPosition = function() {
	
	var computedStyle = window.getComputedStyle(this.tmp_el, null);
	if (this._useTransform) {
		var val = computedStyle.webkitTransform || computedStyle.transform;
		val = val.split(')')[0].split(', ');
		var posx = val[12] || val[4];
		var posy = val[13] || val[5];
		var pos = {x: Math.round(posx), y: Math.round(posy) }
	}
	return pos;
}

AppScroller.prototype.getScrollPosition = function() {
	var pos = this._getCurrentPosition();
	pos.x_progress = this._maxScrollX != 0 ? Math.abs(pos.x / this._maxScrollX) * 100 : 0;
	pos.y_progress = this._maxScrollY != 0 ? Math.abs(pos.y / this._maxScrollY) * 100 : 0;
	return pos;
}

AppScroller.prototype._initScrollbars = function() {
	this.scrollbars.x = new AppScrollbar('x', this);
	this.scrollbars.y = new AppScrollbar('y', this);
}

AppScroller.prototype.refresh = function() {
	this._maxScrollX = this.wrapper.parentNode.clientWidth - this.wrapper.clientWidth;
	if (this._maxScrollX >= 0) {
		this.hasScroll.x = false;
		this._maxScrollX = 0;
	}
	else 
		this.hasScroll.x = true;

	this._maxScrollY = this.wrapper.parentNode.clientHeight - this.wrapper.clientHeight;
	if (this._maxScrollY >= 0) {
		this.hasScroll.y = false;
		this._maxScrollY = 0;
	}
	else 
		this.hasScroll.y = true;

	if (! this._disableScrollbars) {
		this.scrollbars.x.setScrollsize(this._maxScrollX);
		this.scrollbars.y.setScrollsize(this._maxScrollY);

		this.scrollbars.x.refresh();
		this.scrollbars.y.refresh();
	}

	this._bounceBack();
}




//////////////////////////////////////////////////////
function AppScrollbar(axis, scroller) {
	this.axis = (axis == 'x' ? 'x' : 'y');
	this.visible = true;
	this.scroller = scroller;

	this.scrollsize = 0;
	this.scrollposition = 0;
	this.wrapper_size = 0;
	this.indicator_size = 0;

	this.wrapper = document.createElement('DIV');
	this.wrapper.className = 'scrollbar scrollbar-'+this.axis;

	this.indicator = document.createElement('DIV');
	this.indicator.className = 'scroll-indicator';


	this.wrapper.appendChild(this.indicator);

	this.scroller.wrapper.parentNode.appendChild(this.wrapper);

	this.fadeTimer = null;



	// if (this.scroller._autoHideScrollbars)
	// 	this.wrapper.style.opacity = '0';
}


AppScrollbar.prototype.refresh = function() {
	if (this.axis == 'y') {
		var space = this.scroller.scrollbars.x.wrapper.clientHeight;
		this.wrapper_size = (this.scroller.wrapper.parentNode.clientHeight - space);
		this.wrapper.style.height = this.wrapper_size + 'px';
	}
	if (this.axis == 'x') {
		var space = this.scroller.scrollbars.y.wrapper.clientWidth;
		this.wrapper_size = (this.scroller.wrapper.parentNode.clientWidth - space);
		this.wrapper.style.width =  this.wrapper_size + 'px';
	}
	this.updateIndicator();
}

AppScrollbar.prototype.hide = function() {
	this.visible = false;
	this.wrapper.style.display = 'none';
}

AppScrollbar.prototype.show = function() {
	this.visible = true;
	this.wrapper.style.display = 'block';
}

AppScrollbar.prototype.setScrollsize = function(scrollsize) {
	if (scrollsize == 0)
		this.hide();
	else
		this.show();

	this.scrollsize = Math.abs(scrollsize);
	this.updateIndicator();
}

AppScrollbar.prototype.updateIndicator = function() {

	if (this.scrollsize != 0) {
		var indicator_size = this._getIndicatorSize();
		var indicator_position = this._getIndicatorPosition(indicator_size);
		var objref = this;
		setTimeout(function(){
			if (objref.axis == 'x') {
				objref.indicator.style.width = indicator_size + 'px';
				objref.indicator.style.left =  indicator_position + 'px';
			}
			if (objref.axis == 'y') {
				objref.indicator.style.height = indicator_size + 'px';
				objref.indicator.style.top = indicator_position + 'px';
				// document.getElementById('console').innerHTML = new Date().getTime();
			}
		},10)


	}
}

AppScrollbar.prototype._getIndicatorPosition = function(size) {
	var max_position = this.wrapper_size - size;
	var indicator_position = (this.scrollposition / this.scrollsize) * max_position;

	return Math.round(indicator_position);
}

AppScrollbar.prototype._getIndicatorSize = function() {
	
	var size = (this.wrapper_size / (this.scrollsize + this.wrapper_size)) * this.wrapper_size;
	size = Math.max(size, 20);

	return Math.round(size);
}

AppScrollbar.prototype.setPosition = function(position) {
	console.log(this.axis+' position '+position);
	if (position > 0) position = 0;
	if (this.axis == 'x' && position < this.scroller._maxScrollX)
		position = this.scroller._maxScrollX;
	if (this.axis == 'y' && position < this.scroller._maxScrollY)
		position = this.scroller._maxScrollY;

	this.scrollposition = Math.abs(Math.round(position));
	this.updateIndicator();
	
}


AppScrollbar.prototype.fadeOut = function(duration) {
	return;
	this.wrapper.style.transition = 'all 200ms';
	this.wrapper.style.WebkitTransition = 'all 200ms';
	var objref = this;
	clearTimeout(this.fadeTimer);
	this.fadeTimer = setTimeout(function() {
		objref.wrapper.style.opacity = '0';
	}, 1000);
}


AppScrollbar.prototype.fadeIn = function(duration) {
	return;
	this.wrapper.style.transition = 'all 200ms';
	this.wrapper.style.WebkitTransition = 'all 200ms';
	var objref = this;
	clearTimeout(this.fadeTimer);
	this.fadeTimer = setTimeout(function() {
		objref.wrapper.style.opacity = '1.0';
	}, 10);
}




