//Hero.js - James Burroughs

(function($, swfobject) {

	var _dom;				//Map of DOM elements
	var _provider;			//So the resize function knows what size to scale to


	//================================== Util
	function gebi(id) {return document.getElementById(id);}
	function ce(type) {return document.createElement(type);}
	function req(url, jsonpcallback, cb) {
		if(!cb) return;

		var req = $.ajax({
			url: url,
			dataType: "jsonp",
			cache: true,
			jsonpCallback: jsonpcallback,
		});
		req.fail(function() {
			cb([]);
		});
		req.done(function(data) {
			cb(data || []);
		});
	}
		


	//================================== Resize NS
	var resize = (function() {	
		var savedWidth;
		var ratioMap = {
			default: function(width) {
				return width / 16 * 9;
			},
			twitch: function(width) {
				return width / 16 * 9 + 30;
			}
		};

		return function(hard) {
			var video = _dom.video;
			var slider_wrapper = _dom.slider_wrapper;

			var currWidth = $(video).width();

			if(currWidth === savedWidth && !hard) return; //Only exec if width has actually changed

			var ratioFunction = ratioMap[_provider] || ratioMap.default;

			var newHeight = ratioFunction(currWidth);
			$(video).height(newHeight);//Set video height
			$(slider_wrapper).height(newHeight - 70); //Set slider height

			savedWidth = currWidth;
		};
	})();


	//================================== sources NS
	var sources = (function() {
		var _activeChannel;
		var _activeChannelID;


		var embedFlashPlayer = function(provider) {

			var swfVersionStr = "10.1.0";
			var width = "100%";
			var height = "100%";
			var xiSwfUrlStr = "http://oystatic.ignimgs.com/src/core/swf/expressInstall.swf";

			var playerMap = {
				ign: function(id) {

					var swf = "http://oystatic.ignimgs.com/src/core/swf/IGNPlayer.swf";
					var cachebust = "?version=3.120612.02";
					var url = id + "?qs_autoplay=true";
					var flashvars = {
						cacheBusting: "true",
						url: url
					};
					var params = {
						quality: "high",
						allowscriptaccess: "always",
						allowfullscreen: "true",
					};
					swfobject.embedSWF(swf+cachebust, "hero_video_target", width, height, swfVersionStr, xiSwfUrlStr, flashvars, params);

                },

            	twitch: function(id) {
            		var swf = "http://www.justin.tv/widgets/live_embed_player.swf"
            		var expressInstall = "http://localhost:2007/javascripts/lib/swfobject/expressinstall.swf";
            		var flashvars = {
            			hostname: "www.twitch.tv",
            			channel: id,
            			auto_play: true,
            			start_volume: 50
            		};
            		var params = {
            			movie: swf,
            			allowFullScreen: "true",
            			allowScriptAccess: "always",
            			allowNetworking: "all"
            		}
            		swfobject.embedSWF(swf, "hero_video_target", width, height, swfVersionStr, xiSwfUrlStr, flashvars, params);

            	}
            };

            if(provider && provider.name && playerMap[provider.name]) {
            	$(_dom.player).empty();

            	//Create a target for swfobject to replace
            	var swfTarget = ce("div");
            	$(swfTarget).attr("id","hero_video_target");
            	_dom.video.appendChild(swfTarget);

            	if(provider.name !== _provider) {
            		_provider = provider.name;
            		resize(true);
            	}
            	playerMap[provider.name](provider.id);
            }

		};


		var getHTML = function(data) {

			var frag = document.createDocumentFragment();

			for(var i = 0, len = data.length; i < len; i++) {

				var row = data[i];

				var wrapper = ce("div");
				var thumb = ce("img");
				var statusbar = ce("div");
				var status = ce("span");
				var franchise = ce("span");
				var title = ce("div");

				$(thumb).addClass("thumb").attr("src",row.thumb).attr("alt","");
				$(status).addClass("status").text(row.type === "stream" ? "Live" : "Video");
				$(franchise).addClass("franchise").text(" / " + row.franchise);
				$(title).addClass("title").text(row.title);
				$(statusbar).addClass("statusbar").append(status, franchise);
				$(wrapper).addClass("hero_channel" + (row.type === "stream" ? " live" : "")).append(thumb, statusbar, title);

				if(row.id === _activeChannelID) {
					$(wrapper).addClass("watching");
					_activeChannel = wrapper;
				}

				var closure = function() {
					var provider = row.provider;
					var id = row.id;
					return function() {
						embedFlashPlayer(provider);
						if(_activeChannel) $(_activeChannel).removeClass("watching");
						$(this).addClass("watching");
						_activeChannel = this;
						_activeChannelID = id;
					};
				};

				$(wrapper).click(closure());
				frag.appendChild(wrapper);
				row.btn = wrapper; //Reference

			}

			return frag;
		};



		//================================== Streams NS
		var streams = (function() {
			var _url = "http://esports.ign.com/content/v1/streams.json";
			var _data = [];

			var format = function(data) {
				return {
					id:         		data.id,
					thumb: 				data.image_url || "",
					title: 				data.title || "",
					franchise: 			data.franchise && data.franchise.name || "",
					franchise_slug: 	data.franchise && data.franchise.slug || "",
					provider: 			data.providers && data.providers[data.providers.length - 1] || null,
					type: 				"stream"
				};
			};

			var load = function(cb) {
				_data = []; //Purge
				req(_url, "getCachedEvent", function(data) {
					for(var i = 0, len = data.length; i < len; i++) {
						_data.push(format(data[i]));
					}
					cb();
				});
			};

			var sort = function() {
				//Sort by amount of viewers (current not in api)
			};

			var frag = function() {
				sort();
				return getHTML(_data);
			};

			var start = function() {
				if(_activeChannel || !_data.length) return

				//Override default random behavior if franchise is set
				if(window.franchise) {
					for(var i = 0, len = _data.length; i < len; i++) {
						if(_data[i].franchise_slug === window.franchise) {
							$(_data[i].btn).trigger("click");
							return;
						}
					}
				}

				//Choose live stream at random
				var index = Math.floor(Math.random()*_data.length);
				$(_data[index].btn).trigger("click");

			};

			return {
				load: load,
				frag: frag,
				start: start
			};
		})();



		//================================== VODs NS
		var videos = (function() {
			var _url = "http://esports.ign.com/content/v1/videos.json";
			var _data = [];

			var format = function(data) {
				var data = data.video;
				return {
					id:         data.id,
					thumb: 		data.thumbnails && data.thumbnails[0] && data.thumbnails[0].thumbnail && data.thumbnails[0].thumbnail.url || "",
					title: 		data.name || "",
					franchise: 	data.franchise && data.franchise.name || "",
					type: 		"video",
					provider: 	{
						name: "ign",
						id: data.url
					},
					duration: data.duration,
					date: data.publish_at
				};
			};

			var load = function(cb) {
				_data = []; //Purge
				req(_url, "getCachedVideo", function(data) {
					for(var i = 0, len = data.length; i < len; i++) {
						_data.push(format(data[i]));
					}
					cb();
				});
			};

			var sort = function() {
				_data.sort(function(a, b) {
					var d_a = new Date(a.date).getTime();
					var d_b = new Date(b.date).getTime();

					if(d_a > d_b) return -1;
					if(d_a < d_b) return 1;
					return 0;
				});
			};

			var frag = function() {
				sort();
				return getHTML(_data);
			};

			var start = function() {
				if(_activeChannel || !_data.length) return;

				//Always trigger latest vod
				$(_data[0].btn).trigger("click");
			};

			return {
				load: load,
				frag: frag,
				start: start
			};
		})();



		return {
			streams: streams,
			videos: videos
		};

	})();



	//================================== Run NS
	var runtime = (function() {

		var filterMap = {
			// all: {
			// 	sources: ["streams","videos"],
			// 	btn: null
			// },
			live: {
				sources: ["streams"],
				btn: null
			}
			// "on demand": {
			// 	sources: ["videos"],
			// 	btn: null
			// }
		};
		var activePane;
		var activeFilter;
		var activeChannel;


		var changeActiveButton = function(filter) {
			if(activeFilter && activeFilter.btn) $(activeFilter.btn).removeClass("selected"); //Remove selected from other filter buttons
			$(filter.btn).addClass("selected"); //Add selected class to btn
		};


		var load = function(filter) {

			if(activeFilter === filter) return;

			changeActiveButton(filter);

			//****************** Parallel AJAX
			var wait = true;
			var waitOn = 0;

			var finish = function() {
				if(wait || waitOn) return;

				var pane = ce("div");
				for(var i = 0, len = filter.sources.length; i < len; i++) {
					var source = sources[filter.sources[i]];
					pane.appendChild(source.frag());
					source.start(); //Start video if not already playing
				}

				if(activePane) {
					$(activePane).fadeOut("fast", function() {
						$(pane).hide();
						_dom.slider.appendChild(pane);
						$(pane).fadeIn("fast");
					});
				}
				else {
					_dom.slider.appendChild(pane);
				}

				activePane = pane;
			};

			for(var i = 0, len = filter.sources.length; i < len; i++) {
				waitOn++;
				var callback = function() {
					waitOn--;
					finish();
				};
				sources[filter.sources[i]].load(callback);
			}

			wait = false;
			finish();
			//****************** End parallel ajax

			activeFilter = filter;

		};


		var init = function() {
			var switcher = _dom.switcher;

			//Add filters
			for(var i in filterMap) {
				var li = ce("li");
				var span = ce("span");
				span.innerHTML = i;
				li.appendChild(span);

				var closure = function() {
					var filter = filterMap[i];
					return function() {
						load(filter);
					};
				};

				$(li).click(closure());

				filterMap[i].btn = li;

				switcher.appendChild(li);
			}

			//Load first filter
			for(var filter in filterMap) {
				load(filterMap[filter]);
				break;
			}

		};


		return {
			init: init
		};

	})();



	//================================== OnReady
	$(function() {
		_dom = {
			video: 			gebi("hero_video"),
			slider_wrapper: gebi("hero_slider_wrapper"),
			slider: 		gebi("hero_slider"),
			switcher: 		gebi("hero_switcher")
		};

		//Check all DOM elements are accounted for
		if(!_dom.video || !_dom.slider_wrapper || !_dom.slider || !_dom.switcher) {
			console.log("Hero.js attempted to execute but did not find necessary DOM elements.");
			return;
		}

		resize();
		runtime.init();

		//OnResize
		$(window).resize(resize);
	});


})(jQuery, swfobject);