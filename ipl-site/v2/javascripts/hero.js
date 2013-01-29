//Hero.js - James Burroughs

(function($, swfobject) {

	if(window.hero) return; //Only load once

	var _dom;				//Map of DOM elements
	var _provider;			//So the resize function knows what size to scale to
	var _filterMap = window.hero_filterMap || {
		all: {
			sources: [
				{type: "streams"},
				{type: "videos"}
			]
		},
		live: {
			sources: [
				{type: "streams"}
			]
		},
		"on demand": {
			sources: [
				{type: "videos"}
			]
		}
	};

	//================================== Util
	function gebi(id) {return document.getElementById(id);}
	function ce(type) {return document.createElement(type);}
	function req(url, data, jsonpcallback, cb) {
		if(!cb) return;

		var req = $.ajax({
			url: url,
			dataType: "jsonp",
			cache: true,
			jsonpCallback: jsonpcallback,
			data: data || null
		})
		.done(function(data, textStatus, jqXHR) {
			cb(data || []);
		})
		.fail(function() {
			cb([]);
		});

		return req;

	}


	//================================== Scroll NS
	var scroll = (function() {

		var _wrapperHeight;
		var _sliderHeight;
		var _sliderOffset;
		var _maxStep;

		var setValues = function(sliderWrapperHeight) {
			if(sliderWrapperHeight) _wrapperHeight = sliderWrapperHeight;
			_sliderHeight = $(_dom.slider).height();
			_sliderOffset = 0;
			_maxStep = maxStep();
			_dom.slider.style.top = "0px"; //Reset

			show();
		};

		var show = function() {
			if(_sliderHeight + _sliderOffset > _wrapperHeight) {
				$(_dom.down).show();
			}
			else {
				$(_dom.down).hide();
			}

			if(_sliderOffset < 0) {
				$(_dom.up).show();
			}
			else {
				$(_dom.up).hide();
			}
		};


		var maxStep = function() {
			return Math.floor(_wrapperHeight / 84) * 84;
		};

		var up = function(event) {
			var toEnd = -_sliderOffset;
			var step = Math.min(_maxStep, toEnd);
			_sliderOffset += step;
			animate();
		};

		var down = function(event) {
			var toEnd =  _sliderHeight + _sliderOffset - _wrapperHeight;
			var step = Math.min(_maxStep, toEnd);
			_sliderOffset -= step;
			animate();
		};

		var animate = function() {
			$(_dom.slider).animate({top: _sliderOffset}, 500, "swing", show);
		};

		return {
			set: setValues,
			show: show,
			up: up,
			down: down
		};

	})();



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

			var newSliderWrapperHeight = newHeight - 70;
			$(slider_wrapper).height(newSliderWrapperHeight); //Set slider height

			scroll.set(newSliderWrapperHeight); //Show/hide updown buttons

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

				youtube: function(id) {
					var flashvars = {
						autoplay: 1
					};
					var params = {
						allowScriptAccess: "always",
						autoplay: 1
					};
					swfobject.embedSWF("http://www.youtube.com/v/" + id + "?enablejsapi=1&playerapiid=ytplayer&version=3", "hero_video_target", width, height, swfVersionStr, xiSwfUrlStr, flashvars, params);
				},

				ign: function(videoURL) {

					videoURL += "?qs_autoplay=true";
					var swf = "http://media.ign.com/ev/esports/ipl-static/ipl-site/v2/swfs/ignplayer_ipl.swf";
					var cachebust = "?version=3.120612.02";

					var flashvars = {
						cacheBusting: "true",
						url: videoURL
					};
					var params = {
						quality: "high",
						allowscriptaccess: "always",
						allowfullscreen: "true",
						bgcolor: "#000000"
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

		var renderRelatedLinks = function(articleList){
			$relatedLinks = $("#hero_related_links")
			var linkText = "";
			for (var i = 0; i < articleList.length; i++) {
				var articleData = articleList[i];
				var title = articleData.metadata.headline;
				var url = "/ipl/all/news/" + articleData.metadata.slug;
				linkText += "<li><a href='" + url + "'>" + title + "</a></li>";
			};
			$relatedLinks.append(linkText);
		}

		var findFeaturedImage = function (articleContent) {
			var firstImage = articleContent.match(/<img[\w'-=\"\s]+\/>/), firstImageSrc = "";
			if(firstImage){
				firstImageSrc = firstImage[0].match(/src=[\"|\']([\w:\/\/\.-]+)[\"|\']/);
			}
			var featuredImageUrl = firstImageSrc[1];
			if(featuredImageUrl == null) {
				featuredImageUrl = "http://media.ign.com/ev/esports/ipl-static/shared/images/logos/IPL-logo-white-text.png";
			}
			return featuredImageUrl;
		}

		var renderFeaturedArticle = function(articleData) {

			var articleData = articleData[0];
			var featuredImageUrl = findFeaturedImage(articleData.content[0]);
			var $heroFeaturedArticle = $(_dom.featured).find(".hero_featured_article_text");
			var articleLink = "<a href='/ipl/all/news/" + articleData.metadata.slug + "' class='hero_featured_image_wrapper'>";
			articleLink += "<img src='" + featuredImageUrl + "' alt='" + articleData.promo.title + "' class='hero_featured_image'/>";
			articleLink += "<p class='hero_featured_title'>" + articleData.metadata.headline + "</p>";
			articleLink += "<p class='hero_featured_read'>Click to read</p></a>";
			$heroFeaturedArticle.html(articleLink);
		}

		var loadFeatured = function(franchiseSlug, numberOfArticles, tag, cb){
			var params = {
				per_page: numberOfArticles,
				tag: tag,
				franchiseSlug: franchiseSlug
			};
			var fetchingFeaturedArticle = articleLoader.fetchArticles(params, "getCachedArticles" + numberOfArticles);
			fetchingFeaturedArticle.done(function(articleData){
				if(articleData.count > 0) {
					cb(articleData.data);
				}
				if(articleData.count < numberOfArticles) {
					params.tag = null;
					params.per_page = numberOfArticles - articleData.count
					var fetchingArticle = articleLoader.fetchArticles(params, "getCachedArticles" + numberOfArticles);
					fetchingArticle.done(function(articleData){
						cb(articleData.data);
					})
				}
			});
		}
		var updateHeroBottom = function (franchise, title) {
			$("#hero_related_links").empty();
			loadFeatured(franchise.slug, 1, "feature", renderFeaturedArticle);
			loadFeatured(franchise.slug, 8, "sticky", renderRelatedLinks);
			udpateNowWatching(franchise.name, title);
		}
		var udpateNowWatching = function(franchiseName, title) {
			var videoDetails = $(_dom.featured).find(".hero_video_details")[0],
					heading = videoDetails.getElementsByTagName("h1")[0],
					details = videoDetails.getElementsByTagName("p")[0];
			heading.innerHTML = franchiseName;
			details.innerHTML = title;
		}

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
					var franchise = {
						slug: row.franchise_slug,
						name: row.franchise
					}
					var title = row.title;
					return function() {
						embedFlashPlayer(provider);
						updateHeroBottom(franchise, title);
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


		var getRelatedHTML = function(data) {
			var frag = document.createDocumentFragment();

			for(var i = 0, len = data.length; i < len; i++) {
				var d = data[i];
				var wrapper = ce("a");
				var thumb = ce("img");
				var title = ce("div");

				$(thumb).addClass("thumb").attr("src", d.thumb).attr("alt","");
				$(title).addClass("title").text(d.title);
				$(wrapper).addClass("hero_related").append(thumb, title).attr("href", d.url);

				frag.appendChild(wrapper);
			}

			return frag;
		};



		//================================== Streams Class
		function Streams(params) {
			this.params = params || {};
			this.url = "http://esports.ign.com/content/v1/streams.json";
			this.data = [];
		}
		Streams.prototype = {
			format: function(data) {
				return {
					id:         		data.id,
					thumb: 				data.image_url || "",
					title: 				data.title || "",
					franchise: 			data.franchise && data.franchise.name || "",
					franchise_slug: 	data.franchise && data.franchise.slug || "",
					long_title: 		data.metadata && data.metadata.longTitle || "",
					type: 				"stream",
					provider: {
						name: "ign",
						id: "http://esports.ign.com/content/v1/streams/" + data.id
					}
				};
			},
			load: function(cb) {
				var self = this;
				req(this.url, null, "getCachedEvent", function(data) {
					for(var i = 0, len = data.length; i < len; i++) {
						self.data.push(self.format(data[i]));
					}
					cb();
				});
			},
			sort: function() {
				//Sort by most concurrent viewers
			},
			frag: function() {
				//this.sort();
				return getHTML(this.data);
			},
			start: function(notLast) {
				if(_activeChannel || !this.data.length) return

				//Override default random behavior if franchise is set
				if(window.franchise && window.franchise !== "all") {
					for(var i = 0, len = this.data.length; i < len; i++) {
						if(this.data[i].franchise_slug === window.franchise) {
							$(this.data[i].btn).trigger("click");
							return;
						}
					}
					//No live stream was found from that franchise, so if this source is not last, return
					if(notLast) return;
				}

				//Choose live stream at random
				var index = Math.floor(Math.random()*this.data.length);
				$(this.data[index].btn).trigger("click");
			}
		}


		//================================== Related Class
		function Related(params) {
			this.params = params || {};
			this.related = [];
			this.parentVideo = null;
		}
		Related.prototype = {
			format: function(data) {
				return {
					url: 	data.url || "",
					thumb: 	data.thumbnails && data.thumbnails[0] && data.thumbnails[0].thumbnail && data.thumbnails[0].thumbnail.url || "",
					title: 	data.title
				};
			},
			load: function(cb) {
				var self = this;
				var url = this.params.videoSlug ? "http://esports.ign.com/content/v1/videos/" + this.params.videoSlug + ".json" : "";
				var data = {
					related: true,
					kind: "youtube"
				};
				req(url, data, "getCachedVideo", function(data) {
					self.parentVideo = {
						id:         		data.id,
						thumb: 				data.thumbnails && data.thumbnails[0] && data.thumbnails[0].thumbnail && data.thumbnails[0].thumbnail.url || "",
						title: 				data.title || "",
						franchise: 			data.franchise && data.franchise.name || "",
						franchise_slug: 	data.franchise && data.franchise.slug || "",
						duration: 			data.duration,
						date: 				data.publish_at,
						provider: 	{
							name: "youtube",
							id: data.youtube_id
						}
					};

					for(var i = 0, len = data.related.videos.length; i < len; i++) {
						self.related.push(self.format(data.related.videos[i]));
					}

					cb();
				});
			},
			frag: function() {
				return getRelatedHTML(this.related);
			},
			start: function() {
				if(_activeChannel || !this.parentVideo) return;
				embedFlashPlayer(this.parentVideo.provider);
				//Embed Disqus
				if(window.disqus) disqus.loadComments(this.parentVideo.id, this.params.videoSlug || "");

			}
		}



		//================================== Videos Class
		function Videos(params) {
			this.params = params || {};
			this.url = "http://esports.ign.com/content/v1/videos.json?kind=youtube";
			this.data = [];
			if(franchise && franchise !== "all") {
				this.url += "&franchise=" + franchise
			}
		}
		Videos.prototype = {
			format: function(data) {
				return {
					id:         data.id,
					thumb: 		data.thumbnails && data.thumbnails[0] && data.thumbnails[0].thumbnail && data.thumbnails[0].thumbnail.url || "",
					title: 		data.title || "",
					franchise: 	data.franchise && data.franchise.name || "",
					franchise_slug: 	data.franchise && data.franchise.slug || "",
					type: 		"video",
					provider: 	{
						name: "youtube",
						id: data.youtube_id
					},
					duration: 	data.duration,
					date: 		data.publish_at
				};
			},
			load: function(cb) {
				var self = this;
				req(this.url, this.params, "getCachedVideo", function(data) {
					for(var i = 0, len = data.length; i < len; i++) {
						self.data.push(self.format(data[i]));
					}
					cb();
				});
			},
			frag: function() {
				return getHTML(this.data);
			},
			start: function() {
				if(_activeChannel || !this.data.length) return;

				//Always trigger latest vod
				$(this.data[0].btn).trigger("click");
			}
		}


		return {
			streams: Streams,
			videos: Videos,
			related: Related
		};

	})();



	//================================== Run NS
	var runtime = (function() {

		var activePane;
		var activeFilter;
		var activeChannel;

		var changeActiveButton = function(filter) {
			if(activeFilter && activeFilter.btn) $(activeFilter.btn).removeClass("selected"); //Remove selected from other filter buttons
			$(filter.btn).addClass("selected"); //Add selected class to btn
		};


		var changeActivePane = function(sourceObj_arr) {
			var pane = ce("div");
			for(var i = 0, len = sourceObj_arr.length; i < len; i++) {
				var source = sourceObj_arr[i];
				pane.appendChild(source.frag());
				var notLast = i < len - 1;
				source.start(notLast); //Start video if not already playing
			}

			$(pane).hide();
			_dom.slider.appendChild(pane);

			if(activePane) {
				var currPane = activePane; //Temp store
				$(currPane).fadeOut("fast", function() {
					$(currPane).remove();
					$(pane).fadeIn("fast");
					scroll.set();
				});
			}
			else {
				$(pane).show();
				scroll.set();
			}

			activePane = pane;
		};


		var load = function(filter) {

			if(activeFilter === filter) return;

			changeActiveButton(filter);

			//****************** Parallel AJAX
			var wait = true;
			var waitOn = 0;
			var sourceObj_arr = [];

			var finish = function() {
				if(!wait && !waitOn) changeActivePane(sourceObj_arr);
			};

			for(var i = 0, len = filter.sources.length; i < len; i++) {
				waitOn++;

				var filterType = filter.sources[i].type;
				var filterParams = filter.sources[i].params;
				var source = new sources[filterType](filterParams);

				source.load(function() {
					waitOn--;
					finish();
				});

				sourceObj_arr.push(source);
			}

			wait = false;
			finish();
			//****************** End parallel ajax

			activeFilter = filter;

		};

		var init = function() {
			var switcher = _dom.switcher;

			//Add filters
			for(var i in _filterMap) {
				var li = ce("li");
				var span = ce("span");
				span.innerHTML = i;
				li.appendChild(span);

				var closure = function() {
					var filter = _filterMap[i];
					return function() {
						load(filter);
					};
				};

				$(li).click(closure());

				_filterMap[i].btn = li;

				switcher.appendChild(li);
			}

			//Create Up/Down Buttons
			_dom.up = $(ce("div")).addClass("hero_slider_btn").attr("id","hero_slider_up").hide().appendTo(_dom.slider_wrapper).click(scroll.up);
			_dom.down = $(ce("div")).addClass("hero_slider_btn").attr("id","hero_slider_down").hide().appendTo(_dom.slider_wrapper).click(scroll.down);

			//Load first filter
			for(var filter in _filterMap) {
				load(_filterMap[filter]);
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
			video: 				gebi("hero_video"),
			slider_wrapper: 	gebi("hero_slider_wrapper"),
			slider: 			gebi("hero_slider"),
			switcher: 			gebi("hero_switcher"),
			featured: 			gebi("featured")
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



	window.hero = true;


})(jQuery, swfobject);