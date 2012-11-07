// Author: James Burroughs 2012 - Code-Foo IPL


(function($) {

	//============================ TICKER NAMESPACE =============================//
	(function() {

		var _docRoot = (typeof jb_localDev !== "undefined") ? "" : "http://esports.ign.com/addons/ipl-widgets/ticker/";

		var _bar;
		var _width;
		var _pollSpeed = 5*60*1000; //How often the API is called
		var _marqueeSpeed = 20*1000; //The time it will take for text to move from one side to the other
		var _data;
		var _ajaxRequests = [];
		var _pollTimer;
		var _animStarted = false;
		var _animChainID = 1; //Allows me to invalidate a loop and restart (eg resizing on fly)
		var _resizeTimer;
		var _rootID = "iplTicker";
		var _styleSheetURL = _docRoot + "css/style.css";
		var _ajaxURL = "http://esports.ign.com/news.json";
		//var _ajaxURL = "dummy_ajax.json";
		var _pause = false;

		//Style params from optional setup obj - iplTickerConfig
		var _fontSize;
		var _height;
		var _width;
		var _spacing;
		var _gameFilter = "";


		//Inject CSS
		(function() {
			var css = ce("link");
			css.setAttribute("rel","stylesheet");
			css.setAttribute("type","text/css");
			css.setAttribute("href", _styleSheetURL);
			$('head').append(css);
		})();

		//When all assets have loaded, fire (We rely on CSS);
		$(window).load(function() {

			//If fires more than once...
			if(_bar) return;

			var root = document.getElementById(_rootID);
			if(!root) return;

			_bar = ce("div","","ticker-bar");

			$(_bar).mouseenter(function() {
				_pause = true;
			});

			$(_bar).mouseleave(function() {
				_pause = false;
			});

			//Get config if available
			var setup = window.iplTickerConfig || {};

			//Set bar attributes based off setup obj
			if(setup.height) {
				_height = setup.height;
				$(_bar).height(setup.height);
			}
			if(setup.width) {
				_width = setup.width;
				$(_bar).width(setup.width);
			}
			if(setup.speed) {
				var speed = Number(setup.speed);
				if(speed !== NaN) _marqueeSpeed = speed * 1000;
			}
			if(setup.fontSize) _fontSize = setup.fontSize;
			if(setup.spacing) _spacing = setup.spacing;
			if(setup.gameSlug) _gameFilter = setup.gameSlug;

			root.appendChild(_bar);

			//Bind onresize
			$(window).resize(resizeBar);

			//Start it off!
			resizeBar();
		});
		

		function resizeBar() {
			var currWidth = $(_bar).width();
			if(currWidth !== _width) {
				_width = currWidth;
				resetAnimation();
			}
		}


		function poll() {

			if(_pollTimer) clearTimeout(_pollTimer);

			_ajaxRequests.push(
				$.ajax({
					url: _ajaxURL,
					dataType: "jsonp",
					type: "GET",
					cache: true,
					jsonpCallback: "getCached",

					success: function(data) {
						_data = data;
						if(!_animStarted) {
							animate(_animChainID);
						}
						_pollTimer = setTimeout(function() {
							poll(); //Poll again!!!
						}, _pollSpeed);
					},
					error: function(jqXHR, textStatus, errorThrown) {
						if(textStatus === "abort") return;
						//There was an error, so poll again in half a second
						_pollTimer = setTimeout(function() {
							poll();
						}, 500);
					}
				})
			);

		}

		function resetAnimation() {
			//Abort all ajax requests
			while(_ajaxRequests.length) _ajaxRequests.pop().abort();

			_animStarted = false;
			_animChainID++;

			poll();
		}


		function animate(id) {

			//Create a new textSlider from the latest data
			var textSlider = createTextSlider(_data);

			//Add textSlider to DOM		
			document.body.appendChild(textSlider); //Insert into overlay to attain actual width (with different styling)
			var textSliderWidth = $(textSlider).width(); //Grab DOM width
			$(textSlider).width(textSliderWidth); //Set width before inserting into _bar
			_bar.appendChild(textSlider); //Insert into _bar

			//We want the speed to be constant with varying textSlider lengths
			//Also we want the speed to be proportional to the resolution
			var distanceToTravel = textSliderWidth + _width;
			var multi = distanceToTravel / _width; //Also start next anim at this point
			var duration = _marqueeSpeed * multi;
			var pause = _pause;
			var pausedAt;

			var start = new Date().getTime();

			//I want the animation to start as full as possible
			if(!_animStarted) {
				start -= (Math.min(textSliderWidth, _width) / distanceToTravel) * duration;
			}

			var end = start + duration;

			//Start next animation
			var startedNext = false;
			var startNextAt = start + (textSliderWidth / distanceToTravel) * duration;


			(function animloop(now) {

				//var f = window.requestAnimationFrame(animloop);
				var f = setTimeout(animloop, 40);

				var now = new Date().getTime();

				if(_pause || pause) {
					if(!pause) {
						pause = true;
						pausedAt = (now-start)/duration;
					}
					if(!_pause) {
						start = now - pausedAt * duration;
						end = start + duration;
						startNextAt = start + (textSliderWidth / distanceToTravel) * duration;
						pause = false;
					}
					return;
				}

				//Is the animation complete?
				if(now > end || id !== _animChainID) {
					//window.cancelAnimationFrame(f);
					clearTimeout(f);
					$(textSlider).remove();
					return;
				}

				//Start the next animation yet?
				if(!startedNext) {
					if(now >= startNextAt) {
						animate(id);
						startedNext = true;
					}
				}

				var progress = (now - start) / duration;
				var x = _width - progress * distanceToTravel;

				textSlider.style.left = x + "px";


			})();

			_animStarted = true;

		}

		function createTextSlider(data) {

			var wrapper = ce("div", "ticker-textSlider");
			if(_fontSize) wrapper.style.fontSize = _fontSize;
			if(_height) wrapper.style.lineHeight = _height;

			for(var i = 0, len = data.length; i < len; i++) {

				//Verify that the data is for the correct game
				var d = data[i];
				var slug = d.metadata && d.metadata.franchise && d.metadata.franchise.slug || "";

				//Skip if following conditions are met
				if(!d.title) continue;
				else if (_gameFilter && _gameFilter !== slug) continue;

				var textBlock = ce("a","ticker-textBlock");
				if(_spacing) {
					textBlock.style.paddingLeft = _spacing;
					textBlock.style.paddingRight = _spacing;
				}
				if(d.url) textBlock.setAttribute("href", d.url);
				var contents = d.title ? processText(d.title) : "";
				textBlock.innerHTML = contents;

				wrapper.appendChild(textBlock);
			}

			return wrapper;
		}

		function processText(text) {
			var textFormat = "<span class='ticker-$1'>$2</span>";
			var iconFormat = "<span class='ticker-icon ticker-$1'></span>";

			//First replace open/close brackets
			var string = text.replace(/\[([A-Z][A-Z0-9]*)\b[^\]]*\](.*?)\[\/\1\]/gi, textFormat);

			//Next, replace image tags
			string = string.replace(/\[(zerg|protoss|terran)\]/gi, iconFormat);

			//Now replace open only brackets
			string = string.replace(/\[([A-Z][A-Z0-9]*)\b[^\]]*\]([\w\d\.]*)/gi, textFormat);

			return string;
		}


	})();


	//DOM object creator helper
	function ce(tag,c,id,text) {

		if(!tag) return;

		var e = document.createElement(tag);
		if(c) e.className = c;
		if(id) e.setAttribute("id", id);
		if(text) $(e).text(text);

		return e;
	}


})(jQuery)



