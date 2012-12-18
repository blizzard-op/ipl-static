//Video.js - James Burroughs

(function($) {

	//Util
	function gebi(id) {return document.getElementById(id);}
	function ce(type) {return document.createElement(type);}

	var _franchise 	= (window.franchise && window.franchise !== "all") ? window.franchise : "";
	var _api 		= "http://esports.ign.com/content/v1/videos.json?kind=youtube"
	var _dom;


	var load = function(show) {
		var params = {
			franchise: _franchise,
			per_page: 50
		};
		get(params, "getCachedVideo", function(data) {
			if(!data || !data.length) return;
			$(_dom.videolist).empty().append(frag(data));
		});
	};


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


	var frag = function(data) {
		//Would send to handlebars here
		var frag = document.createDocumentFragment();
		for(var i = 0, len = data.length; i < len; i++) {
			var d = data[i];
			var o = {
				game: 		d.franchise && d.franchise.abbreviation || "",
				category: 	d.show && d.show.name || "General",
				url: 		"http://www.youtube.com/watch?v=" + d.youtube_id, //d.url || "",
				title: 		d.title || "",
				date: 		d.published_at ? new Date(d.published_at).toLocaleDateString() : "",
				thumb:  	d.thumbnails && d.thumbnails[0] && d.thumbnails[0].thumbnail && d.thumbnails[0].thumbnail.url || ""  
			};
			frag.appendChild(HTML_videoblock(o));
		}
		return frag;
	};


	var HTML_videoblock = function(o) {
		var game 			= ce("strong");
		var channel 		= ce("span");
		var channel_link 	= ce("a");
		var thumb_img 		= ce("img");
		var thumb 			= ce("a");
		var title 			= ce("a");
		var date 			= ce("span");
		var lining 			= ce("span");
		var cell 			= ce("div");

		$(game).text(o.game);
		$(channel_link).attr("href", o.url).attr("target","_blank").text(o.category);
		$(channel).addClass("videolist_channel").append(game, channel_link);
		$(thumb_img).attr("src", o.thumb);
		$(thumb).attr("href", o.url).attr("target","_blank").addClass("videolist_thumb").append(thumb_img);
		$(title).attr("href", o.url).attr("target","_blank").addClass("videolist_title").text(o.title);
		$(date).addClass("videolist_published").text(o.date);
		$(lining).addClass("videolist_lining").append(channel, thumb, title, date);
		$(cell).addClass("videolist_cell").append(lining);

		return cell;
	};

	//Onready
	$(function() {
		_dom = {
			videolist: gebi("videolist")
		};

		if(!_dom.videolist) {
			console.log("Video.js attempted to load but was unable to find necessary DOM elements.");
			return;
		}

		load();
	});

})(jQuery);