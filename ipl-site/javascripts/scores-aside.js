//Scores aside - James Burroughs

(function($) {

	//Globals
	var _url = "http://esports.ign.com/content/v1/events.json";
	var _config = window.scoresConfig;
	var _requestInterval = (_config && _config.interval) ? _config.interval : 5*60*1000; //Default 5 minute (debug 1s)

	//Util
	function gebi(id) {return document.getElementById(id);}
	function ce(t,c,i,h) {
		var e = document.createElement(t);
		if(c) e.className = c;
		if(i) e.setAttribute("id",i);
		if(h !== undefined) e.innerHTML = h;
		return e;
	}

	//When document is ready, init
	$(function() {

		var root = gebi("scores-aside"); //Check for target div
		if(!root) return; //If there is no target container, return

		var target = ce("div");
		root.appendChild(target);

		var getDates = function() {

			var now = new Date();

			var hours = now.getHours();
			var minutes = now.getMinutes();
			var seconds = now.getSeconds();
			var milli = now.getMilliseconds();

			var milli_to_midnight = 86400000 - (hours*60*60*1000 + minutes*60*1000 + seconds*1000 + milli);

			var end = new Date(now.getTime() + milli_to_midnight - 1000);
			var start = new Date(end.getTime() - 21*24*60*60*1000 + 1000);

			return {
				startDate: (_config && _config.startDate) ? _config.startDate : start.toJSON(),
				endDate: (_config && _config.endDate) ? _config.endDate : end.toJSON()
			};
		};

		var sortEvents = function(data) {
			data.sort(function(a,b) {
				var date_a = Date.parse(a["ends_at"]["dateTime"]);
				var date_b = Date.parse(b["ends_at"]["dateTime"]);

				if(isNaN(date_b) || isNaN(date_a) || date_a > date_b) return -1;
				if(date_a < date_b) return 1;
				return 0;
			});
		};

		var generateHTML = function(data) {
			var frag = document.createDocumentFragment();
			var currentDate = "";
				
			for(var i in data) {
				var o = data[i];

				//Check data
				if(!o.matchup || !o.matchup.teams || !o.matchup.teams[0] || !o.matchup.teams[0].name) continue;

				var date = new Date(Date.parse(o["ends_at"]["dateTime"]));
				var dateString = date.toLocaleDateString();

				//If is a different date, add header
				if(dateString !== currentDate) {
					currentDate = dateString;
					frag.appendChild(generateHTML_header(date));
				}

				frag.appendChild(generateHTML_row(o));
			}

			return frag;
		};

		var generateHTML_header = function(date) {
			var wrapper = ce("div","date");
			var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
			var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
			var suffix = {
				1: "st",
				2: "nd",
				3: "rd"
			};

			var dayNumber = date.getDay();
			var dateNumber = date.getDate();

			wrapper.appendChild(ce("div","day_number","","<div class='month_text'>" +  months[date.getMonth()] + "</div>" + dateNumber)); //+ "<span>" + (suffix[dayNumber] ? suffix[dayNumber] : "th") + "</span>"));
			wrapper.appendChild(ce("div","day_text","",days[dayNumber]));

			return wrapper;
		};

		var generateHTML_row = function(o) {
			var frag = document.createDocumentFragment();
			
			var title = ce("div","title");
			frag.appendChild(title);

			title.appendChild(ce("span","gameAbbrev","",o["franchise"]["abbreviation"]));
			title.appendChild(ce("div","text","",o["title"]));

			var row = ce("div","row");
			frag.appendChild(row);

			var teams = o["matchup"]["teams"];
			var team1 = teams[0]["name"];
			var team1_avatar = teams[0]["image_url"] ? ce("img","thumb") : "";
			if(team1_avatar) team1_avatar.setAttribute("src", teams[0]["image_url"]);
			var team1_score = teams[0]["points"];
			var team2 = teams[1]["name"];
			var team2_score = teams[1]["points"];
			var team2_avatar = teams[1]["image_url"] ? ce("img","thumb") : "";
			if(team2_avatar) team2_avatar.setAttribute("src", teams[1]["image_url"]);

			var team1_cell = ce("div","team1 cell");
			if(team1_avatar) team1_cell.appendChild(team1_avatar);
			team1_cell.innerHTML += team1;

			var team2_cell = ce("div","team2 cell");
			if(team2_avatar) team1_cell.appendChild(team2_avatar);
			team2_cell.innerHTML += team2;

			row.appendChild(ce("div","score1 cell" + ((team1_score > team2_score) ? " win" : ""),"",team1_score));
			row.appendChild(team1_cell);
			row.appendChild(team2_cell);
			row.appendChild(ce("div","score2 cell" + ((team2_score > team1_score) ? " win" : ""),"",team2_score));

			return frag;
		};

		target.innerHTMl = "Loading Scores...";

		//Begin polling loop
		(function sendRequest() {
			var req = $.ajax({
				url: _url,
				dataType: "jsonp",
				cache: true,
				jsonpCallback: "getCachedEvent",
				//data: getDates()
				data: {
					box: true
				}
			});

			req.fail(function(jqXHR, textStatus) {
				console.log("Score request failed. Reason: " + textStatus);
			});

			req.done(function(data) {

				if(!data || !data instanceof Array) return;

				sortEvents(data); //Sort

				$(target).empty();
				var h = generateHTML(data);
				if(h) target.appendChild(h);
			});

			req.always(function() {
				setTimeout(sendRequest, _requestInterval);
			});

		})();


	});

})(jQuery);