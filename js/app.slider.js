function AppSlider(wrapper) {
	this.wrapper = wrapper;
	var tmpl = this.wrapper.getElementsByClassName('app-slider-template')[0];
	this.template = tmpl.innerHTML;

	this.wrapper.removeChild(tmpl);
	this.datasource = window[this.wrapper.dataset.datasource];
	this.index = 0;

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

    this._init();
}

AppSlider.prototype._init = function() {
	console.log(this.template);
}


AppSlider.prototype._touchstart = function(event) {

}

AppSlider.prototype._touchmove = function(event) {

}

AppSlider.prototype._touchend = function(event) {

}