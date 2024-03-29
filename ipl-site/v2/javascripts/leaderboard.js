// Generated by CoffeeScript 1.4.0
(function() {
  var authCheck, getScores, setupLoginForm;

  getScores = function(userId) {
    var fetchingAuth, fetchingScores, queryParams;
    queryParams = document.location.search ? document.location.search : "";
    fetchingScores = $.getJSON("http://esports.ign.com/vote/v1/scores" + queryParams + "?callback=?");
    fetchingScores.done(function(scores) {
      var score, scoreboard, _i, _len, _ref;
      scoreboard = "<table><thead><tr><td>Rank</td><td>User</td><td>Score</td></tr></thead><tbody>";
      _ref = scores.results;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        score = _ref[_i];
        if (score.user.id !== null) {
          scoreboard += "<tr><td>" + score.rank + "</td><td>" + score.user.id + "</td><td>" + score.score + "</td></tr>";
        }
      }
      scoreboard += "</tbody></table>";
      return $("#vote-leaderboard .leaderboard").append(scoreboard);
    });
    fetchingAuth = authCheck();
    fetchingAuth.done(function(userData) {
      var gettingScores;
      if (userData !== null) {
        gettingScores = $.getJSON("http://esports.ign.com/vote/v1/scores/" + userData.profileId + "?callback=?");
        gettingScores.done(function(data) {
          var userScoreHTML, _ref;
          if ((data != null ? (_ref = data.user) != null ? _ref.id : void 0 : void 0) != null) {
            userScoreHTML = "<h3>Your score:</h3><table><thead><tr><td>Rank</td><td>User</td><td>Score</td></tr></thead><tbody>";
            userScoreHTML += "<tr><td>" + data.rank + "</td><td>" + data.user.id + "</td><td>" + data.score + "</td></tr>";
            userScoreHTML += "</tbody></table>";
          }
          return $("#user-score").append(userScoreHTML);
        });
        return gettingScores.fail(function(jqxhr, status, text) {
          return $("#user-score").append("<p><a href='http://ign.com/ipl'>Vote to win stuff, dummy!</a> Oh, and go wash your dirty hands. I hate it when you touch me like that.</p>");
        });
      } else {
        return setupLoginForm("Not Found");
      }
    });
    fetchingScores.fail(function(jqxhr, status, text) {
      return console.log(jqxhr, status, text);
    });
    return fetchingAuth.fail(function(jqxhr, status, text) {
      return setupLoginForm(text);
    });
  };

  setupLoginForm = function(text) {
    var userScoreHTML;
    if (text === "Not Found") {
      userScoreHTML = "<h3><a href='https://s.ign.com/' class='signin'>login to have your score tracked</a></h3>";
    }
    return $("#user-score").append(userScoreHTML);
  };

  $("body").on("click", ".signin", function(evt) {
    var gettingLogin;
    evt.preventDefault();
    gettingLogin = $.getJSON("http://widgets.ign.com/social/shared/registration/signin.jsonp?r=${encodeURIComponent(document.location.href)}&callback=?");
    return gettingLogin.done(function(registration) {
      console.log(registration);
      return $("body").append(registration);
    });
  });

  authCheck = function() {
    return $.ajax({
      url: "http://esports.ign.com/auth/v1/users/current/?geo=true",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedAuth"
    });
  };

  getScores();

}).call(this);
