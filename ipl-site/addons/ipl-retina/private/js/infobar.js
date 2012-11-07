//Retina Info Bar & global helpers

(function($, io, retina) {

	if(window.retinaController) return;

	var _appKey = encodeURIComponent("5c4426766e583c2a635f265c46482829313a6d7123363a51207b72475f");

	var _dom_status;
	var _dom_counts;
	var _path = retina.sSocket + "/control";
	var _socket;

	//On DOM Ready
	$(function() {

		build_bar();

		//Connect to server!
		_socket = io.connect(_path + "?appKey=" + _appKey);

		//Generic Socket Events
		_socket.on("connecting", function() {
			setStatus("Connecting...");
		});
		_socket.on("connect", function() {
			setStatus("Connected.");
		});
		_socket.on("connect_failed", function() {
			setStatus("Failed to connect.");
		});
		_socket.on("disconnect", function() {
			setStatus("Disconnected.");
		});
		_socket.on("reconnecting", function() {
			setStatus("Reconnecting...");
		});
		_socket.on("reconnect", function() {
			setStatus("Reconnected.");
		});
		_socket.on("reconnect_failed", function() {
			setStatus("Failed to reconnect.");
		});

		//Custom Socket Events
		_socket.on("connectionCounts", setCounts);
	
	});

	function build_bar() {
		var bar = ce("ul","","infobar");

		var createLI = function(title) {
			var li = ce("li");
			var strong = ce("strong","","",title);
			var span = ce("span","","","?");

			li.appendChild(strong);
			li.appendChild(span);

			bar.appendChild(li);

			return span;
		};

		_dom_status = createLI("Connection Status:");

		_dom_counts = {
			pub: createLI("User Connections:"),
			control: createLI("Control Connections:"),
			view: createLI("View Connections:"),
			mem: createLI("Heap Used (Mb):")
		};

		document.body.appendChild(bar);

	}


	function setStatus(status) {
		if(!_dom_status) return;
		_dom_status.innerHTML = status;
	}

	function setCounts(data) {
		for(var i in _dom_counts) {
			if(typeof data[i] === "undefined" || !_dom_counts[i]) continue;
			_dom_counts[i].innerHTML = data[i];
		}
	}

})(jQuery, io, retina);

//Global helpers

function ce(tag,c,id,h) {

	if(!tag) return;

	var e = document.createElement(tag);
	if(c) e.className = c;
	if(id) e.setAttribute("id", id);
	if(h) e.innerHTML = h;

	return e;
}

function gebi(id) {
	return document.getElementById(id);
}

function injectCSS(url) {
	var css = ce("link");
	css.setAttribute("rel", "stylesheet");
	css.setAttribute("href", url);
	document.getElementsByTagName("head")[0].appendChild(css);
}