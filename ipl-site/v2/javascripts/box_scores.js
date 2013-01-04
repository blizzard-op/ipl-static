// Generated by CoffeeScript 1.4.0
(function() {
  var $boxscoresSlider, $boxscoresWrapper, $next, $prev, boxScoresTemplate, calculateScrollLength, maxTimesToScroll, scrolledRight, showControls, tmpl, today, week;

  today = moment().sod().format();

  week = moment().subtract("days", 6).eod().format();

  boxScoresTemplate = $("#box_scores_template").html();

  tmpl = Handlebars.compile(boxScoresTemplate);

  Handlebars.registerHelper('boxScoreDate', function() {
    var text;
    text = moment(this.starts_at.dateTime).format("dddd, MMM Do, YYYY");
    return new Handlebars.SafeString(text);
  });

  Handlebars.registerHelper('boxScoreWinner', function(points) {
    var text;
    if (points >= this.matchup.teams[1].points && points >= this.matchup.teams[0].points) {
      text = "winner";
    } else {
      text = "";
    }
    return new Handlebars.SafeString(text);
  });

  maxTimesToScroll = 1;

  scrolledRight = 0;

  $boxscoresWrapper = $(".boxscores_wrapper");

  if (!$boxscoresWrapper.length) {
    return;
  }

  $boxscoresSlider = $boxscoresWrapper.find(".boxscores_slider");

  $prev = $boxscoresWrapper.find(".box_score_prev");

  $next = $boxscoresWrapper.find(".box_score_next");

  $prev.on("click", function(evt) {
    evt.preventDefault();
    $boxscoresSlider.animate({
      left: "+=100%"
    }, "slow");
    scrolledRight -= 1;
    return showControls();
  });

  $next.on("click", function(evt) {
    evt.preventDefault();
    $boxscoresSlider.animate({
      left: "-=100%"
    }, "slow");
    scrolledRight += 1;
    return showControls();
  });

  showControls = function() {
    if (scrolledRight <= 0) {
      $prev.hide();
    } else {
      $prev.show();
    }
    if (scrolledRight === maxTimesToScroll) {
      return $next.hide();
    } else {
      return $next.show();
    }
  };

  calculateScrollLength = function() {
    return maxTimesToScroll = Math.floor($boxscoresSlider.width() / $boxscoresWrapper.width());
  };

  $(window).resize(calculateScrollLength);

  (function() {
    var fetchingScores;
    fetchingScores = $.ajax({
      url: "http://esports.ign.com/content/v1/events.json?startDate=" + week + "&endDate=" + today + "&direction=desc",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedScores"
    });
    return fetchingScores.done(function(scores) {
      var filteredScores;
      if (franchise === "all") {
        filteredScores = scores;
      } else {
        filteredScores = _.filter(scores, function(score) {
          return score.franchise.slug === franchise;
        });
      }
      $boxscoresSlider.append(tmpl(filteredScores));
      calculateScrollLength();
      return showControls();
    });
  })();

}).call(this);
