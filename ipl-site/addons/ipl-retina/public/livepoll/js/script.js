// LivePoll for Retina by James Burroughs 2012 IGN-IPL CodeFoo 2012

(function($) {

	//Grab global config
	var _config = window.livePollConfig;

	if(typeof _config !== "object" || !_config.length) return; //If no config, exit

	var _docRoot = (typeof jb_localDev !== "undefined") ? "" : "http://esports.ign.com/addons/ipl-retina/public/livepoll/";
	var _cssURL = _docRoot + "css/style.css";
	var _polls = {};
	var _domTarget;
	var _domTargetID = "livepoll";
	var _baseURL = "http://cg.cx:1337";
	var _path = "/socket/pub";
	var _socket;


	//Check for socket.io js
	if(!window.io) document.write("<script src='" + _docRoot + "js/libs/socket.io.min.js'></script>");


	//Begin when DOM ready
	$(function() {

		if(!(_domTarget = document.getElementById(_domTargetID))) {
			console.log("livepoll <div> not found.");
			return;
		}

		if(!window.io) {
			console.log("Socket.io failed to load.");
			return;
		}


		//Inject CSS
		var css = ce("link");
		css.setAttribute("rel","stylesheet");
		css.setAttribute("href",_cssURL);
		document.getElementsByTagName("head")[0].appendChild(css);

		//Start socket connection
		_socket = io.connect(_baseURL + _path);
		_socket.on("startPoll", pollFactory);
		_socket.on("endPoll", endPoll);
		_socket.on("restore", restore);

		var getPolls = function() {
			_socket.emit("getPolls", _config);
		}
		_socket.on("reconnect", function() {
			//Purge old stuff
			for(var i in _polls) {
				$(_polls[i].dom.wrapper).remove();
			}
			//Reset Poll map
			_polls = {};
			
			//Get new
			getPolls();
		});

		//Emit initial event to get data
		getPolls();

	});

	function restore(data) {
		if(!data) return;
		for(var i = 0; i < data.length; i++) {
			pollFactory(data[i], true);
		}
	}

	function pollFactory(data, skipAnim) {
		//alert(JSON.stringify(data));

		if(_polls[data.id]) return; // Already a poll by that id

		var poll = _polls[data.id] = new Poll(data);

		if(!skipAnim) $(poll.dom.wrapper).hide();
		$(_domTarget).prepend(poll.dom.wrapper);
		if(!skipAnim) $(poll.dom.wrapper).slideDown();

	}

	function endPoll(data) {
		if(!data) return;

		var poll = _polls[data.id];
		if(!poll) return;

		$(poll.dom.wrapper).slideUp("fast", function() {
			$(poll.dom.wrapper).remove();
			delete _polls[data.id];
		});
	}

	//Poll Class
	function Poll(data) {

		//alert(JSON.stringify(data));

		var self = this;
		if(data.selected !== null) this.selected = data.selected;
		this.optionBtns = [];
		this.channel = data.channel;
		this.id = data.id;

		//Countdown stuff
		this.timeOffset = Number(data.serverTime) - new Date().getTime();
		this.timeEnd = data.end + this.timeOffset;
		this.duration = data.end - data.start;

		this.dom = (function() {
			var wrapper = ce("div","livepoll_poll");
			var header = ce("div","livepoll_banner","","IPL LIVEPOLL");
			var question = ce("div", "livepoll_question","","Q. " + data.question);
			var options = ce("ul","livepoll_options");
			var countdown = ce("div","livepoll_countdown");

			for(var i = 0, len = data.options.length; i < len; i++) {
				var li = ce("li","","",data.options[i].text);
				var btn = ce("div","livepoll_option_btn","","Vote");

				if(self.selected === i) $(btn).addClass("livepoll_option_btn_selected").html("Chosen");

				var closure = function() {
					var index = i;
					return function() {
						self.castVote(index);
					};
				};

				$(btn).click(closure());

				self.optionBtns.push(btn);

				li.appendChild(btn);
				options.appendChild(li);
			}

			wrapper.appendChild(header);
			wrapper.appendChild(question);
			wrapper.appendChild(options);
			wrapper.appendChild(countdown);

			return {
				wrapper: wrapper,
				countdown: countdown
			};
		})();

		if(!data.end) {
			this.dom.countdown.innerHTML = "Poll ending shortly!";
			return;
		}
		//Start countdown updater
		self.updateCountdown();
		this.countdownTimer = setInterval(function() {
			self.updateCountdown();
		}, 1000);

	}

	Poll.prototype = {

		castVote: function(index) {
			if(this.selected === index) return;
			if(!this.optionBtns[index]) return;

			var selectedClass = "livepoll_option_btn_selected";

			//Remove current selected
			if(typeof this.selected !== "undefined" && Number(this.selected) !== NaN) {
				var old = this.optionBtns[this.selected];
				$(old).removeClass(selectedClass);
				old.innerHTML = "Vote";
			}

			//Apply class to new selected
			var newb = this.optionBtns[index];
			$(newb).addClass(selectedClass);
			newb.innerHTML = "Chosen";

			this.selected = index;

			//Emit
			_socket.emit("castVote", {
				channel: this.channel,
				id: this.id,
				index: index
			});
		},

		updateCountdown: function() {
			var remaining = this.timeEnd - new Date().getTime();
			if(remaining < 0) {
				clearInterval(this.countdownTimer);
				this.dom.countdown.innerHTML = "Reticulating Splines...";
				return;
			}

			var s = 1000;
			var m = 60*s;
			var h = 60*m;
			var d = 24*h;

			var _h = Math.floor(remaining % d / h);
			var _m = Math.floor(remaining % h / m);
			var _s = Math.floor(remaining % m / s);

			var str = "";
			if(_h > 0) str += (_h < 10 ? "0"+_h : _h) + "h : ";
			if(_m > 0) str += (_m < 10 ? "0"+_m : _m) + "m : ";
			if(_s >= 0) str += (_s < 10 ? "0"+_s : _s) + "s";
			str += " Remaining...";

			this.dom.countdown.innerHTML = str;


		}
	};


	//DOM object creator helper
	function ce(tag,c,id,text) {
		if(!tag) return;
		var e = document.createElement(tag);
		if(c) e.className = c;
		if(id) e.setAttribute("id", id);
		if(text) $(e).text(text);

		return e;
	}


})(jQuery);