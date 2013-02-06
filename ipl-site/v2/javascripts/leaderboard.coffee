getScores = (userId)->
  queryParams = if document.location.search then document.location.search else ""

  fetchingScores = $.getJSON "http://esports.ign.com/vote/v1/scores#{queryParams}?callback=?"

  fetchingScores.done (scores)->
    scoreboard = "<table><thead><tr><td>Rank</td><td>User</td><td>Score</td></tr></thead><tbody>"
    for score in scores.results when score.user.id isnt null
      scoreboard += "<tr><td>#{score.rank}</td><td>#{score.user.id}</td><td>#{score.score}</td></tr>"

    scoreboard += "</tbody></table>"
    $("#vote-leaderboard .leaderboard").append scoreboard

  fetchingAuth = authCheck()

  fetchingAuth.done (userData)->
    if userData isnt null
      gettingScores = $.getJSON "http://esports.ign.com/vote/v1/scores/#{userData.profileId}?callback=?"
      
      gettingScores.done (data)->
        if data?.user?.id?
          userScoreHTML = "<h3>Your score:</h3><table><thead><tr><td>Rank</td><td>User</td><td>Score</td></tr></thead><tbody>"
          userScoreHTML += "<tr><td>#{data.rank}</td><td>#{data.user.id}</td><td>#{data.score}</td></tr>"
          userScoreHTML += "</tbody></table>"

        $("#user-score").append userScoreHTML

      gettingScores.fail (jqxhr, status, text)->
        $("#user-score").append "<p><a href='http://ign.com/ipl'>Vote to win stuff, dummy!</a> Oh, and go wash your dirty hands. I hate it when you touch me like that.</p>"
    else
      setupLoginForm "Not Found"
    

  fetchingScores.fail (jqxhr, status, text)->
    console.log jqxhr, status, text

  fetchingAuth.fail (jqxhr, status, text)->
    setupLoginForm text

setupLoginForm = (text)->
  if text is "Not Found"
    userScoreHTML = "<h3><a href='https://s.ign.com/' class='signin'>login to have your score tracked</a></h3>"

  $("#user-score").append userScoreHTML

$("body").on "click", ".signin", (evt)->
  evt.preventDefault()
  gettingLogin = $.getJSON "http://widgets.ign.com/social/shared/registration/signin.jsonp?r=${encodeURIComponent(document.location.href)}&callback=?"
  gettingLogin.done (registration)->
    console.log registration
    $("body").append registration


authCheck = ->
  return $.ajax
    url: "http://esports.ign.com/auth/v1/users/current/?geo=true"
    dataType: "jsonp"
    cache: true
    jsonpCallback: "getCachedAuth"

getScores()