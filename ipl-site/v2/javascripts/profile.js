// Generated by CoffeeScript 1.4.0
(function() {
  var _url;

  _url = document.location.hostname === "www.ign.com" ? "esports.ign.com" : "localhost:3000";

  (function() {
    var fetchingUser, fetchingUserStats, source, tmpl;
    source = $("#profile-rank-template").html();
    tmpl = Handlebars.compile(source);
    fetchingUser = $.getJSON("http://" + _url + "/vote/v2/users/" + userId + "?callback=?");
    fetchingUserStats = $.getJSON("http://" + _url + "/vote/v2/users/" + userId + "/stats?callback=?");
    fetchingUser.done(function(user) {
      $("#displayName").html(user.displayName);
      $("#profile_image").attr({
        src: user.thumbnailUrl,
        alt: user.displayName
      });
      return $("#confidence_level").html("<p>None of the polls you voted in have completed yet. Come back when one is done to see how you did.</p>");
    });
    $.when(fetchingUser, fetchingUserStats).done(function(user, stats) {
      stats = stats[0];
      $("#confidence_level").html("<h3>" + Math.round(stats.confidenceLevel) + "% <br> <span class='confidence'>confident</span></h3>");
      return $("#competitions").append(tmpl(stats));
    });
    return fetchingUserStats.fail(function(jqxhr, status, text) {
      return console.log(jqxhr, status, text);
    });
  })();

  $("body").on("click", ".signin", function(evt) {
    var gettingLogin;
    evt.preventDefault();
    gettingLogin = $.getJSON("http://widgets.ign.com/social/shared/registration/signin.jsonp?r=${encodeURIComponent(document.location.href)}&callback=?");
    return gettingLogin.done(function(registration) {
      return $("body").append(registration);
    });
  });

}).call(this);
