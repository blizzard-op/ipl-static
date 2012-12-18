//Streams.js - James Burroughs

(function($) {

	var _api = "http://esports.ign.com/content/v1/streams.json?test=true";
	var _target;
	var _pollrate = 5 * 60 * 1000; //5 Minutes

	function ce(t,c,h) {
		var e = document.createElement(t);
		if(c) e.className = c;
		if(h) e.innerHTML = h;
		return e;
	}

	var get = function(data, jsonpcbname, cb) {
		return $.ajax({
			url: _api,
			dataType: "jsonp",
			cache: true,
			jsonpCallback: jsonpcbname,
			data: data || null
		})
		.fail(function() {
			cb();
		})
		.done(function(data) {
			cb(data);
		});
	};

	var format = function(data) {
		return {
			thumb: 				data.image_url || "",
			title: 				data.title || "",
			franchise: 			data.franchise && data.franchise.name || "",
			franchise_slug: 	data.franchise && data.franchise.slug || "",
		};
	};


	var frag = function(data) {
		var frag = document.createDocumentFragment();
		for(var i = 0, len = data.length; i < len; i++) {
			var o 			= format(data[i]);
			var url 		= "/ipl/" + o.franchise_slug;
			var wrapper 	= ce("div", "streamslist_wrapper clearfix");
			var thumb_a 	= ce("a", "streamslist_thumb_a");
			var thumb 		= ce("img", "streamslist_thumb");
			var franchise 	= ce("div", "streamslist_franchise", o.franchise);
			var title 		= ce("a", "streamslist_title", o.title);

			$(thumb_a).append(thumb).attr("href", url);
			$(thumb).attr("src", o.thumb);
			$(title).attr("href", url);
			$(wrapper).append(thumb_a, franchise, title);

			frag.appendChild(wrapper);
		}
		return frag;
	};


	var load = function() {
		get(null, "getCachedEvent", function(data) {
			if(data) {
				$(_target).empty().append(frag(data));
			}
			setTimeout(load, _pollrate);
		});
	};

	//Onready
	$(function() {
		_target = document.getElementById("streamslist");
		if(!_target) {
			console.log("Streams.js attempted to load but was unable to find the necessary DOM elements.");
			return;
		}
		load();
	});

})(jQuery);