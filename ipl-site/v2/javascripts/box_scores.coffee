today = moment().sod().format()
week = moment().subtract("days", 6).eod().format()
boxScoresTemplate = $("#box_scores_template").html()
tmpl = Handlebars.compile boxScoresTemplate

Handlebars.registerHelper 'boxScoreDate', ->
  text = moment(this.starts_at.dateTime).format("dddd, MMM Do, YYYY")
  new Handlebars.SafeString text


Handlebars.registerHelper 'boxScoreWinner', (points)->
  if points >= this.matchup.teams[1].points and points >= this.matchup.teams[0].points
    text = "winner"
  else
    text = ""
  new Handlebars.SafeString text

maxTimesToScroll = 1
scrolledRight = 0

$boxscoresWrapper = $(".boxscores_wrapper")
return unless $boxscoresWrapper.length

$boxscoresSlider = $boxscoresWrapper.find(".boxscores_slider")
$prev = $boxscoresWrapper.find(".box_score_prev")
$next = $boxscoresWrapper.find(".box_score_next")

$prev.on "click", (evt)->
  evt.preventDefault()
  $boxscoresSlider.animate
    left: "+=100%"
  , "slow"
  scrolledRight -= 1
  showControls()

$next.on "click", (evt)->
  evt.preventDefault()
  $boxscoresSlider.animate
    left: "-=100%"
  , "slow"
  scrolledRight += 1
  showControls()

showControls = ->
  if scrolledRight <= 0 
    $prev.hide()
  else
    $prev.show()

  if scrolledRight is maxTimesToScroll
    $next.hide()
  else
    $next.show()

calculateScrollLength = ->
  maxTimesToScroll = Math.floor($boxscoresSlider.width() / $boxscoresWrapper.width())

$(window).resize calculateScrollLength

do ->
  fetchingScores = $.ajax
    url: "http://esports.ign.com/content/v1/events.json?startDate=#{week}&endDate=#{today}&direction=desc"
    dataType: "jsonp"
    cache: true
    jsonpCallback: "getCachedScores"

  fetchingScores.done (scores)->
    if franchise is "all"
      filteredScores = scores
    else 
      filteredScores = _.filter scores, (score)->
        return score.franchise.slug is franchise
      
    $boxscoresSlider.append tmpl(filteredScores)
    calculateScrollLength()
    showControls()