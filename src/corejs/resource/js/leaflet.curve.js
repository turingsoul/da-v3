
/*
 * Leaflet.curve v0.1.0 - a plugin for Leaflet mapping library. https://github.com/elfalem/Leaflet.curve
 * (c) elfalem 2015
 */
/*
 * note that SVG (x, y) corresponds to (long, lat)
 */

L.Curve = L.Path.extend({
	options: {
	},
	
	initialize: function(path, options){
		L.setOptions(this, options);
		this._initialUpdate = true;
		this._setPath(path);
	},
	
	getPath: function(){
		return this._coords;
	},
	
	setPath: function(path){
		this._setPath(path);
		return this.redraw();
	},
	
	getBounds: function() {
		return this._bounds;
	},

	_setPath: function(path){
		this._coords = path;
		this._bounds = this._computeBounds();
	},
	
	_computeBounds: function(){
		var bound = new L.LatLngBounds();
		var lastPoint;
		var lastCommand;
		var coord;
		for(var i = 0; i < this._coords.length; i++){
			coord = this._coords[i];
			if(typeof coord == 'string' || coord instanceof String){
				lastCommand = coord;
			}else if(lastCommand == 'H'){
				bound.extend([lastPoint.lat,coord[0]]);
				lastPoint = new L.latLng(lastPoint.lat,coord[0]);
			}else if(lastCommand == 'V'){
				bound.extend([coord[0], lastPoint.lng]);
				lastPoint = new L.latLng(coord[0], lastPoint.lng);
			}else if(lastCommand == 'C'){
				var controlPoint1 = new L.latLng(coord[0], coord[1]);
				coord = this._coords[++i];
				var controlPoint2 = new L.latLng(coord[0], coord[1]);
				coord = this._coords[++i];
				var endPoint = new L.latLng(coord[0], coord[1]);

				bound.extend(controlPoint1);
				bound.extend(controlPoint2);
				bound.extend(endPoint);

				endPoint.controlPoint1 = controlPoint1;
				endPoint.controlPoint2 = controlPoint2;
				lastPoint = endPoint;
			}else if(lastCommand == 'S'){
				var controlPoint2 = new L.latLng(coord[0], coord[1]);
				coord = this._coords[++i];
				var endPoint = new L.latLng(coord[0], coord[1]);

				var controlPoint1 = lastPoint;
				if(lastPoint.controlPoint2){
					var diffLat = lastPoint.lat - lastPoint.controlPoint2.lat;
					var diffLng = lastPoint.lng - lastPoint.controlPoint2.lng;
					controlPoint1 = new L.latLng(lastPoint.lat + diffLat, lastPoint.lng + diffLng);
				}

				bound.extend(controlPoint1);
				bound.extend(controlPoint2);
				bound.extend(endPoint);

				endPoint.controlPoint1 = controlPoint1;
				endPoint.controlPoint2 = controlPoint2;
				lastPoint = endPoint;
			}else if(lastCommand == 'Q'){
				var controlPoint = new L.latLng(coord[0], coord[1]);
				coord = this._coords[++i];
				var endPoint = new L.latLng(coord[0], coord[1]);

				bound.extend(controlPoint);
				bound.extend(endPoint);

				endPoint.controlPoint = controlPoint;
				lastPoint = endPoint;
			}else if(lastCommand == 'T'){
				var endPoint = new L.latLng(coord[0], coord[1]);

				var controlPoint = lastPoint;
				if(lastPoint.controlPoint){
					var diffLat = lastPoint.lat - lastPoint.controlPoint.lat;
					var diffLng = lastPoint.lng - lastPoint.controlPoint.lng;
					controlPoint = new L.latLng(lastPoint.lat + diffLat, lastPoint.lng + diffLng);
				}

				bound.extend(controlPoint);
				bound.extend(endPoint);

				endPoint.controlPoint = controlPoint;
				lastPoint = endPoint;
			}else{
				bound.extend(coord);
				lastPoint = new L.latLng(coord[0], coord[1]);
			}
		}
		return bound;
	},
	
	//TODO: use a centroid algorithm instead
	getCenter: function () {
		return this._bounds.getCenter();
	},
	
	_update: function(){
		if (!this._map) { return; }
		
		this._updatePath();
	},
	
	_updatePath: function() {
		this._renderer._updatecurve(this);
	},

	_project: function() {
		var coord, lastCoord, curCommand, curPoint;

		this._points = [];
		
		for(var i = 0; i < this._coords.length; i++){
			coord = this._coords[i];
			if(typeof coord == 'string' || coord instanceof String){
				this._points.push(coord);
				curCommand = coord;
			}else {
				switch(coord.length){
					case 2:
						curPoint = this._map.latLngToLayerPoint(coord);
						lastCoord = coord;
					break;
					case 1:
						if(curCommand == 'H'){
							curPoint = this._map.latLngToLayerPoint([lastCoord[0], coord[0]]);
							lastCoord = [lastCoord[0], coord[0]];
						}else{
							curPoint = this._map.latLngToLayerPoint([coord[0], lastCoord[1]]);
							lastCoord = [coord[0], lastCoord[1]];
						}
					break;
				}
				this._points.push(curPoint);
			}
		}
	}	
});

L.curve = function (path, options){
	return new L.Curve(path, options);
};

L.SVG.include({
	_updatecurve: function(layer){
		this._setPath(layer, this._curvePointsToPath(layer._points));

		if(layer.options.animate){
			var path = layer._path;
			var length = path.getTotalLength();
			
			if(!layer.options.dashArray){
				path.style.strokeDasharray = length + ' ' + length;
			}
			
			if(layer._initialUpdate){
				// path.animate([
				// 		{strokeDashoffset: length},
				// 		{strokeDashoffset: 0}
				// 	], layer.options.animate);
				var THIS = this;
				path.style["strokeDashoffset"] =  length+"px";
				var callBack = function(){
					path.style["strokeDashoffset"] =  length+"px";
					THIS._animate(path, {strokeDashoffset: 0}, 100, 0.3, callBack);
				}
				THIS._animate(path, {strokeDashoffset: 0}, 100, 0.3, callBack);
				layer._initialUpdate = false;
			}
		}
	},
	
 	_curvePointsToPath: function(points){
		var point, curCommand, str = '';
		for(var i = 0; i < points.length; i++){
			point = points[i];
			if(typeof point == 'string' || point instanceof String){
				curCommand = point;
				str += curCommand;
			}else{
				switch(curCommand){
					case 'H':
						str += point.x + ' ';
						break;
					case 'V':
						str += point.y + ' ';
						break;
					default:
						str += point.x + ',' + point.y + ' ';
						break;
				}
			}
		}
		return str || 'M0 0';
	},

	_animate: function(obj, css, interval, speedFactor, func) { 
		clearInterval(obj.timer); 
		function getStyle(obj, prop) { 
		  if (obj.style) 
			return obj.style[prop]; // ie 
		  else 
			return document.defaultView.getComputedStyle(obj, null)[prop]; // 非ie 
		} 
		obj.timer = setInterval(function(){ 
		  var flag = true; 
		  for (var prop in css) { 
			var cur = 0; 
			if(prop == "opacity")  
			  cur = Math.round(parseFloat(getStyle(obj, prop)) * 100); 
			else 
			  cur = parseInt(getStyle(obj, prop)); 
			var speed = (css[prop] - cur) * speedFactor; 
			speed = speed > 0 ? Math.ceil(speed): Math.floor(speed); 
			if (cur != css[prop]) 
			  flag = false; 
			if (prop == "opacity") { 
			  obj.style.filter = "alpha(opacity : '+(cur + speed)+' )"; 
			  obj.style.opacity = (cur + speed) / 100; 
	  } 
			else 
			  obj.style[prop] = cur + speed + "px"; 
		  } 
		  if (flag) { 
			clearInterval(obj.timer); 
			if (func) 
			  func(); 
		  } 
		}, interval); 
	  } 
});
