// RETINA ViewPort - By James Burroughs 2012

(function($) {

	if(window.retView) return;

	//SOCKET IO STUFF
	var _appKey = encodeURIComponent("5c4426766e583c2a635f265c46482829313a6d7123363a51207b72475f");
	var _baseURL = "http://cg.cx:1337";
	var _path = "/socket/view";
	
	if(!window.io) document.write("<script src='http://esports.ign.com/addons/ipl-retina/views/js/libs/socket.io.min.js'></script>");
	//END SOCKET IO

	var _pollMap = {};
	var _viewQueue = []; //Render after socket connected
	var _socket;
	var _views = {};
	var _seed = 0;
	var _typeMap = (function() {

		function LeagueOfLegendsPoll() {
			this.dom = (function() {
				var wrapper = ce("div","leagueoflegends_largePoll");
				var question = ce("div","leagueoflegends_largePoll_question");
				// var votes = ce("div","leagueoflegends_largePoll_votes");
				var bar = ce("div","leagueoflegends_largePoll_bar");
				var innerBar = ce("div", "leagueoflegends_largePoll_bar_sub");
				var barOverlay = ce("div","leagueoflegends_largePoll_baroverlay");
				var leftOption = ce("div","leagueoflegends_largePoll_player leagueoflegends_largePoll_player_left");
				var rightOption = ce("div","leagueoflegends_largePoll_player leagueoflegends_largePoll_player_right");
				var leftPercent = ce("div","leagueoflegends_largePoll_percentage leagueoflegends_largePoll_percentage_left");
				var rightPercent = ce("div","leagueoflegends_largePoll_percentage leagueoflegends_largePoll_percentage_right");

				wrapper.appendChild(question);
				//wrapper.appendChild(votes);
				wrapper.appendChild(bar);
				bar.appendChild(innerBar);
				wrapper.appendChild(barOverlay);
				wrapper.appendChild(leftOption);
				wrapper.appendChild(rightOption);
				wrapper.appendChild(leftPercent);
				wrapper.appendChild(rightPercent);

				return {
					wrapper: wrapper,
					question: question,
					// votes: votes,
					innerBar: innerBar,
					leftOption: leftOption,
					rightOption: rightOption,
					leftPercent: leftPercent,
					rightPercent: rightPercent
				};
			})();
		}
		LeagueOfLegendsPoll.prototype = {
			getDOM: function() {
				return this.dom.wrapper;
			},
			redraw: function(data) {
				this.dom.question.innerHTML =  data.question;
				this.dom.leftOption.innerHTML = data.options[0].text;
				this.dom.leftPercent.innerHTML = Math.round(data.options[0].percent) + "%";
				this.dom.rightOption.innerHTML = data.options[1].text;
				this.dom.rightPercent.innerHTML = Math.round(data.options[1].percent) + "%";
				this.dom.innerBar.style.width = data.options[1].percent + "%";
				//this.dom.votes.innerHTML = data.options[1].votes + data.options[0].votes + " votes.";
			},
			update: function(data) {
				this.dom.leftPercent.innerHTML = Math.round(data[0].percent) + "%";
				this.dom.rightPercent.innerHTML = Math.round(data[1].percent) + "%";
				this.dom.innerBar.style.width = data[1].percent + "%";
				//this.dom.votes.innerHTML = data[1].votes + data[0].votes + " votes.";
			}
		};

		function StarcraftPoll() {

			this.dom = (function() {
				var wrapper = ce("div","starcraft-2_largePoll");
				var question = ce("div","starcraft-2_largePoll_question");
				var votes = ce("div","starcraft-2_largePoll_votes");
				var tile = ce("div","starcraft-2_largePoll_tile");
				var bar = ce("div","starcraft-2_largePoll_bar");
				var innerBar = ce("div", "starcraft-2_largePoll_bar_sub");
				var barOverlay = ce("div","starcraft-2_largePoll_baroverlay");
				var leftOption = ce("div","starcraft-2_largePoll_player starcraft-2_largePoll_player_left");
				var rightOption = ce("div","starcraft-2_largePoll_player starcraft-2_largePoll_player_right");
				var leftPercent = ce("div","starcraft-2_largePoll_percentage starcraft-2_largePoll_percentage_left");
				var rightPercent = ce("div","starcraft-2_largePoll_percentage starcraft-2_largePoll_percentage_right");

				wrapper.appendChild(question);
				wrapper.appendChild(votes);
				wrapper.appendChild(tile);
				wrapper.appendChild(bar);
				bar.appendChild(innerBar);
				wrapper.appendChild(barOverlay);
				wrapper.appendChild(leftOption);
				wrapper.appendChild(rightOption);
				wrapper.appendChild(leftPercent);
				wrapper.appendChild(rightPercent);

				return {
					wrapper: wrapper,
					question: question,
					votes: votes,
					tile: tile,
					innerBar: innerBar,
					leftOption: leftOption,
					rightOption: rightOption,
					leftPercent: leftPercent,
					rightPercent: rightPercent
				};
			})();

		}
		StarcraftPoll.prototype = {
			getDOM: function() {
				var self = this;
				var tile_offset = 0;
				clearTimeout(this.animTimer);
				(function anim() {
					if(tile_offset % 9 === 0) tile_offset = 0;
					self.dom.tile.style.backgroundPosition = tile_offset + "px top";
					self.animTimer = setTimeout(anim, 80);
					tile_offset++;
				})();
				return this.dom.wrapper;
			},
			redraw: function(data) {
				this.dom.question.innerHTML =  data.question;
				this.dom.leftOption.innerHTML = data.options[0].text;
				this.dom.leftPercent.innerHTML = Math.round(data.options[0].percent) + "%";
				this.dom.rightOption.innerHTML = data.options[1].text;
				this.dom.rightPercent.innerHTML = Math.round(data.options[1].percent) + "%";
				this.dom.innerBar.style.width = data.options[1].percent + "%";
				this.dom.votes.innerHTML = data.options[1].votes + data.options[0].votes + " votes.";
			},
			update: function(data) {
				this.dom.leftPercent.innerHTML = Math.round(data[0].percent) + "%";
				this.dom.rightPercent.innerHTML = Math.round(data[1].percent) + "%";
				this.dom.innerBar.style.width = data[1].percent + "%";
				this.dom.votes.innerHTML = data[1].votes + data[0].votes + " votes.";
			}
		};

		return {
			"sc2_largePoll": StarcraftPoll,
			"lol_largePoll": LeagueOfLegendsPoll
		};

	})();

	//DOM Ready
	$(function() {
		_socket = io.connect(_baseURL + _path + "?appKey=" + _appKey);

		_socket.on("getViews", function(cb) {
			var arr = [];
			for(var i in _views) arr.push(i);
			cb(arr);
		});

		_socket.on("assign", function(data, cb) {
			if(!data) {
				//cb("Error: No data.");
				return;
			}
			var view = _views[data.view];
			if(!view) {
				//cb("Error: No view by that name on this socket.");
				return;
			}
			if(view.assignedTo) {
				var arr = _pollMap[view.assignedTo];
				if(arr) {
					var index = arr.indexOf(view);
					if(index !== -1) arr.splice(index,1);
				}
			}
			if(!_pollMap[data.poll.id]) _pollMap[data.poll.id] = [view];
			else _pollMap[data.poll.id].push(view);

			view.redraw(data.poll); //Redraw with new poll data

			//cb("Success!");
		});

		_socket.on("newVote", function(data) {
			if(!data) return;
			for(var i = 0; i < _pollMap[data.id].length; i++) {
				var view = _pollMap[data.id][i];
				view.update(data.options);
			}
		});

		while(_viewQueue.length) _viewQueue.shift()();
	});

	function viewFactory(type, name) {
		if(!type || !name) return;

		//Check if name already exists
		if(_views[name]) {
			console.log("A view by that name already exists!");
			return;
		}

		//Check if type exists
		if(!_typeMap[type]) {
			console.log("Type of interface does not exist.");
			return;
		}

		var inter = new _typeMap[type]();
		var view = _views[name] = new View(name, inter);

		document.body.appendChild(view.getDOM());

	}

	function View(name, inter) {
		this.name = name;
		this.inter = inter;
		this.dom = inter.getDOM();

	}
	View.prototype = {
		getDOM: function() {
			return this.inter.getDOM();
		},
		redraw: function(data) {
			this.inter.redraw(data);
		},
		update: function(data) {
			this.inter.update(data);
		}
	};

	window.retView = {
		makeView: function(type, name) {
			_viewQueue.push(function() {
				viewFactory(type, name);
			});
		}
	};

})(jQuery);


//Global Helper
function ce(tag,c,id,h) {

	if(!tag) return;

	var e = document.createElement(tag);
	if(c) e.className = c;
	if(id) e.setAttribute("id", id);
	if(h) e.innerHTML = h;

	return e;
}