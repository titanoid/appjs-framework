function AppSlider(wrapper) {
	this.wrapper = wrapper;
	var tmpl = this.wrapper.getElementsByClassName('app-slider-template')[0];
	this.item_template = tmpl.innerHTML;
	this.wrapper.removeChild(tmpl);

	this.inner = document.createElement('DIV');
	this.inner.className = 'app-slider-inner';
	this.wrapper.appendChild(this.inner);

	this.direction = 'horizontal';
	
	this.datasource = window[this.wrapper.dataset.datasource];
	this.curr_index = 0;

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

	
}

AppSlider.prototype._init = function(index) {
	this.curr_index = index;
	var item_pre, item, item_next;
	
	if (index - 1 < 0)
		item_pre = '';
	else
		item_pre = this._createItem(index - 1);

	item = this._createItem(index);

	if (index + 1 >= this.items.length)
		item_next = '';
	else
		item_next = this._createItem(index + 1);

	this.wrapper.innerHTML = item_pre + item + item_next;

}


AppSlider.prototype._touchStart = function(event) {

}

AppSlider.prototype._touchMove = function(event) {

}

AppSlider.prototype._touchEnd = function(event) {

}

AppSlider.prototype._createItem = function(index) {
	var item = document.createElement('DIV');
	item.className = 'app-slider-item';
	var data = this.items[index];
	var item_html = this.item_template;
	for(var key in data) {
		item_html = item_html.replace('%'+key+'%', data[key]);
	}
	item.innerHTML = item_html;

	return item;
}