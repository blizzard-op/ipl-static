//redis://snap:f9f95b55de704fa42fd23b32f446b900@scat.redistogo.com:9444/

var redis = require('redis');
var client = redis.createClient(9444,'scat.redistogo.com');
client.auth('f9f95b55de704fa42fd23b32f446b900', function (err) {
  if (err) { console.log("Error Authenticating with redis"); }

  //DELETE ALL DATA FROM REDIS
  //client.DEL("livepolls");

  //Import data from redis
  Livepoll.import();

});


var _pubMap = {};
var _controlMap = {};
var _viewMap = {};
var _appKey = "5c4426766e583c2a635f265c46482829313a6d7123363a51207b72475f";

//Socket NS
var _pub;
var _control;
var _view;


//LivePoll Widget
var Livepoll = (function() {

	var polls = {};
	var room_prefix = "livepoll";
	var uniqueSeed = 0;
	var redisHash = "livepolls";

	function findPoll(id, getIndex) {
		for(var channelID in polls) {
			var channel = polls[channelID];
			for(var i = 0, len = channel.length; i < len; i++) {
				if(channel[i].data.id === id) {
					if(getIndex) return {
						channel: channel,
						index: i
					};
					return channel[i];
				}
			}
		}
	}

	var pub = (function() {

		function getPolls(data, socket) {

			if(!data || !(data instanceof Array) || !data.length) return;

			var returnData = [];

			for(var i = 0, len = data.length; i < len; i++) {
				var pollChannel = polls[data[i]];

				//The user is making a new connection, add to room
				socket.join(room_prefix + "_" + data[i]);

				if(!pollChannel) continue;

				for(var z = 0, zlen = pollChannel.length; z < zlen; z++) {
					var poll = pollChannel[z];
					if(poll.data.savedAt) continue;
					returnData.push(poll.getData(false, socket.handshake.address.address));
				}
			}

			socket.emit("restore", returnData);
		}

		function castVote(data, socket) {
			if(typeof data.channel !== "string" || Number(data.index) === NaN || typeof data.id !== "string") return;

			var poll = findPoll(data.id);
			if(!poll) return;

			poll.vote(data, socket);
		}

		//Set pub routes
		_pubMap.getPolls = getPolls;
		_pubMap.castVote = castVote;

	})();

	var view = (function() {


	})();


	var control = (function() {

		function redis_import() {
			//Load saved polls into memory
			client.HGETALL(redisHash, function(err, res) {
				if(err) {
					console.log("HGETALL " + err);
					return;
				}
				if(!res) return;
				var keys = Object.keys(res);
				for(var i = 0, len = keys.length; i < len; i++) {
					var data = JSON.parse(res[keys[i]]);
					var channel = data.channel;
					var poll = new Poll(data);

					if(!polls[channel]) polls[channel] = [poll];
					else polls[channel].push(poll);

				}
			});
		}

		function redis_write(poll) {
			if(!poll || !(poll instanceof Poll)) return;
			client.HSET(redisHash, poll.data.id, JSON.stringify(poll.getData(true)));
		}

		function getViews(cb) {

			var o = {};
			var sockets = _view.clients();
			var waitFor = sockets.length;
			var sendtoCtrl = function() {
				waitFor--;
				if(waitFor) return;
				cb(o);
			};

			for(var i = 0, len = sockets.length; i < len; i++) {
				var socket = sockets[i];
				var id = socket.id;
				var closure = function() {
					var myid = id;
					return function(data) {
						if(data) o[myid] = data;
						sendtoCtrl();
					};
				};
				socket.emit("getViews", closure());

			}
		}

		function assignView(data, socket) {
			if(!data || !data.pollid || !data.viewid) {
				return;
			}

			var poll = findPoll(data.pollid);
			if(!poll) {
				return;
			}

			_view.emit("assign", {
				view: data.viewid,
				poll: poll.getData(true)
			});

		}

		function getPolls(data, socket) {
			var o = {};
			var channels = Object.keys(polls);
			for(var i = 0, len = channels.length; i < len; i++) {
				var pushTo_arr = o[channels[i]] = [];
				var channel = polls[channels[i]];
				for(var z = 0, zlen = channel.length; z < zlen; z++) {
					pushTo_arr.push(channel[z].getData(true));
				}
			}

			socket.emit("allPolls", o);
		}

		//Verifies poll data before creation, broadcasts
		function pollFactory(data, socket) {
			//check data
			if(
				!data ||
				!data.channel ||
				!data.author ||
				!data.question ||
				!data.options ||
				!data.duration ||
				typeof data.channel !== "string" ||
				typeof data.author !== "string" ||
				typeof data.question !== "string" ||
				!(data.options instanceof Array) ||
				isNaN(Number(data.duration))
			) {
				console.log("Attempted to parse incorrect or incomplete data from controller.");
				return;
			}

			//Create new poll and set unique id
			var channel = data.channel;
			data.id = getUnique(channel);

			var poll = new Poll(data);

			//Add poll to channel or make channel if not already
			if(polls[channel]) polls[channel].push(poll);
			else polls[channel] = [poll];

			//Start timeout to remove poll from memory
			if(poll.duration) {
				poll.removeTimer = setTimeout(function() {
					poll.complete();
				}, poll.duration);
			}

			//sendToClients
			_pub.in(room_prefix + "_" + channel).emit('startPoll', poll.getData());

			//sendToController
			_control.emit("startPoll", poll.getData(true));
		}

		function endPoll(data, socket) {

			if(!data) return;

			var poll = findPoll(data.id);
			if(!poll) return;

			poll.complete();
		}

		function deletePoll(data) {

			if(!data || !data.id) return;

			var o = findPoll(data.id, true);
			var channel = o.channel;
			var index = o.index;

			//Remove from channel array
			channel.splice(index,1);

			//Send to control
			_control.emit("deletePoll", {id: data.id});

			//Remove from redis
			client.HDEL(redisHash, data.id, function(err, res) {
				if(err) console.log(err);
			});

		}

		//===== POLL CLASS =======//
		function Poll(data) {

			this.data = data; //Exportable data

			this.duration = Number(data.duration) * 60 * 1000;
			this.start = new Date().getTime();
			this.end = this.duration > 0 ? this.start + this.duration : 0;

			this.options = [];
			this.votes = {}; //IP:option map

			for(var i = 0, len = data.options.length; i < len; i++) {
				this.options.push(new Option(data.options[i], i));
			}

		}

		Poll.prototype = {

			getData: function(control, ip) {

				//Compile return data
				var returnData = {};
				for(var i in this.data) {
					if(!(this.data.hasOwnProperty(i))) continue;
					returnData[i] = this.data[i];
				}

				//Overwrite / Set additional values
				if(control) returnData.options = this.getOptions();
				returnData.serverTime = new Date().getTime();
				returnData.start = this.start;
				returnData.end = this.end;
				//if(ip) returnData.selected = this.votes[ip] ? this.votes[ip].index : null;
				

				return returnData;
			},

			getOptions: function() {
				var totalVotes = 0;
				var totalOptions = this.options.length;
				var optionsArray = [];

				for(var i = 0; i < totalOptions; i++) {
					totalVotes += this.options[i].voteCount;
				}
				
				for(var i = 0; i < totalOptions; i++) {
					var option = this.options[i];
					optionsArray.push({
						text: option.text,
						votes: option.voteCount,
						percent: totalVotes > 0 ? Math.round((option.voteCount / totalVotes * 100)*100)/100 : Math.round(100/totalOptions)
					});
				}

				return optionsArray;
			},

			vote: function(data, socket) {

				if(!data) return;

				var index = Number(data.index);
				if(index === NaN) return;

				//Get option
				var option = this.options[index];
				if(!option) return;

				// //Grab last vote
				// var ip = socket.handshake.address.address;
				// var pastVote = this.votes[ip];

				// if(!pastVote) {
				// 	//Send details of user to DB (for prizes);
				// }

				// //If same IP votes for same thing, return
				// if(pastVote && pastVote === option) return;
				// else if(pastVote) pastVote.removeVote();
				
				//Add / replace new vote
				option.addVote();
				//this.votes[ip] = option;

				var emit = {
					id: this.data.id,
					options: this.getOptions()
				};

				//Emit to control
				_control.emit("newVote", emit);

				//Emit to views
				_view.emit("newVote", emit);

			},

			complete: function() {
				var channel = this.data.channel;

				//Interupt timeout if necessary
				clearTimeout(this.removeTimer);

				var savedAt = new Date().getTime();
				this.data.savedAt = savedAt;

				//Emit to control
				_control.emit("endPoll", this.getData(true));

				//sendToClients
				_pub.in(room_prefix + "_" + channel).emit('endPoll', {id: this.data.id});

				// //Write to redis
				redis_write(this);
			}
		};

		//======= QUESTION CLASS ==========//
		function Option(data, index) {
			this.voteCount = data.count || 0;
			this.text = data.text || "";
			this.index = index;
		}

		Option.prototype = {

			addVote: function() {
				this.voteCount++;
			},

			removeVote: function() {
				this.voteCount--;
			}

		};

		function getUnique(channel) {
			return room_prefix + "_" + channel + "_" + new Date().getTime() + "_" + (++uniqueSeed);
		}

		//Set control routes
		_controlMap.newPoll = pollFactory;
		_controlMap.getPolls = getPolls;
		_controlMap.endPoll = endPoll;
		_controlMap.deletePoll = deletePoll;
		_controlMap.getViews = getViews;
		_controlMap.assignView = assignView;

		return {
			import: redis_import
		};

	})();

	return {
		import: control.import
	};

})();


(function init() {

	var http = require('http');
	var io = require('socket.io');
	var util = require('util');

	//Public server
	var server = http.createServer();

	//Attach socket.io to servers
	var _io = io.listen(server);

	//Production Settings for Socket.io
	_io.enable('browser client minification');  // send minified client
	_io.enable('browser client etag');          // apply etag caching logic based on version number
	_io.enable('browser client gzip');          // gzip the file
	_io.set('log level', 0);                    // reduce logging
	_io.set('transports', [                     // enable all transports (optional if you want flashsocket)
	    'websocket'
	  // , 'flashsocket'
	  // , 'htmlfile'
	  // , 'xhr-polling'
	  // , 'jsonp-polling'
	]);

	//============================================== Public NS
	var keys_pub = Object.keys(_pubMap);
	_pub = _io
	.of("/socket/pub")
	.on('connection', function (socket) {

		for(var i = 0, len = keys_pub.length; i < len; i++) {
			var closure = function() {
				var key = keys_pub[i];
				return function(data) {
					_pubMap[key](data, socket);
				};
			};
			socket.on(keys_pub[i], closure());
		}

		socket.on("disconnect", function() {
			//_control.emit("connectionCounts", counts);
			delete socket;
		});

		//Update counts on control
		//_control.emit("connectionCounts", counts);
	});


	//============================================== Control NS
	var keys_control = Object.keys(_controlMap);
	_control = _io
	.of("/socket/control")
	.authorization(function (handshakeData, callback) {
		var allow = handshakeData.query.appKey === _appKey;
		callback(null, allow);
	})
	.on("connection", function(socket) {

		for(var i = 0, len = keys_control.length; i < len; i++) {

			var closure = function() {
				var key = keys_control[i];
				return function(data) {
					_controlMap[key](data, socket);
				};
			};

			socket.on(keys_control[i], closure());
		}

		socket.on("disconnect", function() {
			//_control.emit("connectionCounts", counts);
			delete socket;
		});

		socket.emit("connectionCounts", counts);


	});

	//============================================== View NS
	var keys_view = Object.keys(_viewMap);
	_view = _io
	.of("/socket/view")
	.authorization(function (handshakeData, callback) {
		var allow = handshakeData.query.appKey === _appKey;
		callback(null, allow);
	})
	.on("connection", function(socket) {

		for(var i = 0, len = keys_view.length; i < len; i++) {

			var closure = function() {
				var key = keys_view[i];
				return function(data) {
					_viewMap[key](data, socket);
				};
			};

			socket.on(keys_view[i], closure());
		}

		socket.on("disconnect", function() {
			//_control.emit("connectionCounts", getCounts());
			delete socket;
		});

		//Update counts on control
		//_control.emit("connectionCounts", getCounts());
	});

	var counts;
	(function getCounts() {
		var mem = Math.round((util.inspect(process.memoryUsage().rss) / 1048576)*100)/100;
		counts = {
			"pub": _pub.clients().length,
			"control": _control.clients().length,
			"view": _view.clients().length,
			"mem": mem
		};
		setTimeout(getCounts, 5000);
		_control.emit("connectionCounts", counts);
	})();


	//Start server
	server.listen(1337);
	

})();