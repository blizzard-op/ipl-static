(function($) {
	var basepath = "";
	if (typeof local === "undefined") {
		basepath = "http://esports.ign.com/addons/ipl-widgets/scores/";
	}
	var ipl = {
		init: function(config) {
			this.loadStyleSheet();
			this.url = 'http://esports.ign.com/content/v1/events.json';
			// this.url = 'http://esports.ign.com/scores.json';
			this.container = $('#scores');
			this.fetch();
			this.buttons();
		},
		scoresTmpl: function(){
			var html = "";
			html += "<div class='controls clearfix'><div class='left-control'><img src='http://media.ign.com/ev/esports/ipl-static/ipl-site/addons/ipl-widgets/scores/images/left.png' class='left-button' /></div><div class='container'><div class='box-scores'>";
			for (var i = 0;i<this.matchUps.length;++i) {
				
				html += "<div class='match'>";
				html += "<div class='date-container'><div class='date'>" + this.matchUps[i].date + "</div></div>";
				html += "<div class='title'>" + this.matchUps[i].title + "</div>";
				html += "<div class='team-top'><div class='team-name " + this.matchUps[i].team1Class + "'>" + this.matchUps[i].username1 +"</div><div class='score " + this.matchUps[i].team1Class + "'>" + this.matchUps[i].points1 + "</div></div>";
				html += "<div class='team-bottom'><div class='team-name " + this.matchUps[i].team2Class + "'>" + this.matchUps[i].username2 +"</div><div class='score " + this.matchUps[i].team2Class + "'>" + this.matchUps[i].points2 + "</div></div>";
				if (this.matchUps[i].url !== "#") {
					html += "<div class='status-container'><a href='" + this.matchUps[i].url + "' class='status-link " + this.matchUps[i].status + "'>" + this.matchUps[i].status + "</a></div>";
				} else {
					html += "<div class='status-container'><p class='status " + this.matchUps[i].status + "'>" + this.matchUps[i].status + "</p></div>";
				}

				html += "</div>";
			}
			html += "</div></div><div class='right-control'><img src='http://media.ign.com/ev/esports/ipl-static/ipl-site/addons/ipl-widgets/scores/images/right.png' class='right-button' /></div></div>";
			return html;
		},
		attachTemplate: function(){
			this.container.append(this.scoresTmpl());
		},
		getStatus: function(game, url){
			var startTime=new Date(game.starts_at.dateTime).getTime();
			var endTime=new Date(game.ends_at.dateTime).getTime();
			var currentTime = new Date().getTime();
			
			if(currentTime<startTime){
				return "coming soon";
			}else if(currentTime>endTime){
				return "finished";
			}else if(currentTime>=startTime&&currentTime<=endTime){
				return "underway";
			}
		},
		getURLs: function(url, status, franchiseSlug){
			// rework
			if (status == 'underway') {
				return 'http://ign.com/ipl/' + franchiseSlug;
			} else if (status == 'finished' && url !== null) {
				return 'http://ign.com/ipl/videos';
			} else {
				return '#';
			}
		},
		fetch: function(url, status, slug) {
			var self = this;
			var startDay = moment().subtract('days', 7).eod().format();
			var endDay = moment().add('days', 1).eod().format();
			var sendD = {
				'startDate':startDay,
				'endDate':endDay
			}

			$.ajax({
					url: this.url,
					data: sendD,
					dataType: "jsonp",
					cache: true,
					jsonpCallback: "getCachedEvent",
					success: function(data) {
						self.matchUps=[];
						var game;
						
						data = data.reverse();
						//data = data.sort(function(a,b){return (new Date(a.starts_at.dateTime)).getTime()<(new Date(b.starts_at.dateTime)).getTime()?-1:1});
						self.getStatus(data[0]);
						for(var i=0;i<10;++i){
							if(data[i]==null)
								break;
							game = {
								title:data[i].title,
								status:self.getStatus(data[i]), // rewrite
								url: self.getURLs("http://ign.com/ipl/videos", self.getStatus(data[i]), data[i].franchise.slug),
								date:moment(data[i].starts_at.dateTime, "YYYY-MM-DD").format("MMM D, YYYY")
							};
							
							for(var j=0;j<data[i].matchup.teams.length;++j){
								game["username"+(j+1)] = data[i].matchup.teams[j].name;
								game["points"+(j+1)] = data[i].matchup.teams[j].points;
							};
							if(data[i].matchup.teams[0]>data[i].matchup.teams[1]){
								game.team1Class = 'winner';
								game.team2Class = 'loser';
							}else if(data[i].matchup.teams[0]<data[i].matchup.teams[1]){
								game.team1Class = 'loser';
								game.team2Class = 'winner';
							}
							if(data[i].matchup.teams[0].name != "" && data[i].matchup.teams[1] != "")
								self.matchUps.push(game);
						}
						self.attachTemplate();
					},
					error: function(jqXHR, textStatus, errorThrown) {
							data = {
									error: true,
									jqXHR: jqXHR,
									textStatus: textStatus,
									errorThrown: errorThrown
							};
							console.log(data);
					}
			});
		},
		loadStyleSheet: function() {
			var head = document.getElementsByTagName( 'head' )[0],
					link = document.createElement( 'link' );
			link.setAttribute( 'href', basepath + 'css/style.css' );
			link.setAttribute( 'rel', 'stylesheet' );
			head.appendChild(link);
		},

		buttons: function() {

			$('#scores').on('mouseenter', ".left-button", function() {
				$(this).animate({'margin-left': '-=5'}, 300);
			}).on('mouseleave', '.left-button', function() {
				$(this).animate({'margin-left': '+=5'}, 300);
			});

			$('#scores').on('mouseenter','.right-button', function() {
				$(this).animate({'margin-left': '+=5'}, 300);
			}).on('mouseleave', '.right-button', function() {
				$(this).animate({'margin-left': '-=5'}, 300);
			});

			var i = 1;

			$('#scores').on('click', '.right-button', function() {
				var boxWidth = $('.box-scores .match').length * $('.box-scores .match').outerWidth()
				if( boxWidth + parseInt($('.box-scores').css('margin-left')) -152 < $('.box-scores').parent('.container').width() ){
					$('.box-scores').animate({'margin-left':  $('.box-scores').parent('.container').width() - boxWidth }, 500);
				}else{
					$('.box-scores').animate({'margin-left': '-=152'}, 500);
				}
				
			});

			$('#scores').on('click', '.left-button', function() {
				if( parseInt($('.box-scores').css('margin-left'))+152 > 0 ){
					$('.box-scores').animate({'margin-left': '0'}, 500);
				}else{
					$('.box-scores').animate({'margin-left': '+=152'}, 500);
				}
			});

			// Make entire div clickable
			$(".status-container").click(function(evt){
					evt.preventDefault();
					window.location = $(this).find("a").attr("href");
			});

		}
		
	};
	ipl.init();
})(jQuery);