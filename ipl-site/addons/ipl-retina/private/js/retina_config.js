// Centralised Retina config/inject

(function() {

	if(window.io || window.retina) return;

	var _pubBase = "http://cg.cx:1337";
	var _secBase = "http://cg.cx:1337";
	var _pubSocket = _pubBase + "/socket";
	var _secSocket = _secBase + "/socket";

	//Inject Socket IO JS
	document.write("<script src='http://esports.ign.com/addons/ipl-retina/private/js/libs/socket.io.min.js'></script>");


	//alert(window.io);

	window.retina = {
		pSocket: _pubSocket,
		sSocket: _secSocket
	};

})();