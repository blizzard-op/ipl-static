_url = if document.location.hostname is "www.ign.com" then "esports.ign.com" else "localhost:3000"

do ->
  source = $("#profile-rank-template").html()
  tmpl = Handlebars.compile source

  fetchingUser = $.getJSON "http://#{_url}/vote/v2/users/#{userId}?callback=?"
  fetchingUserStats = $.getJSON "http://#{_url}/vote/v2/users/#{userId}/stats?callback=?"
  fetchingUser.done (user)->
    $("#displayName").html user.displayName
    $("#profile_image").attr
      src: user.thumbnailUrl
      alt: user.displayName
    $("#confidence_level").html "<p>None of the polls you voted in have completed yet. Come back when one is done to see how you did.</p>"

  $.when(fetchingUser, fetchingUserStats).done (user, stats)->
    stats = stats[0]
    $("#confidence_level").html("<h3>" + Math.round(stats.confidenceLevel) + "% <br> <span class='confidence'>confident</span></h3>")
    $("#competitions").append tmpl stats

  fetchingUserStats.fail (jqxhr, status, text)->
    console.log jqxhr, status, text

$("body").on "click", ".signin", (evt)->
  evt.preventDefault()
  gettingLogin = $.getJSON "http://widgets.ign.com/social/shared/registration/signin.jsonp?r=${encodeURIComponent(document.location.href)}&callback=?"
  gettingLogin.done (registration)->
    $("body").append registration
