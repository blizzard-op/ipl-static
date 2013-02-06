if document.location.hostname isnt "www.ign.com"
  #dev
  _url = "localhost:3000"
  _mediaUrl = "localhost:8888/media"
else
  #prod
  _url = "esports.ign.com"
  _mediaUrl = "media.ign.com"

$.ajaxSetup
  dataType: "jsonp"
  cache: true

restrictedCountries = ["United States", "France", "Spain", "Denmark", "Netherlands", "Belgium"]

userId = 21
displayName = "Anonymous user"
returningVote = false
updatingVote = false
fetchNewPoll = 30000
newPollInterval = ""

class Poll
  constructor: (@poll) ->
    @stream = poll.stream.id || null
    @fetchUpdateInterval = 10000

  calculatePercent: (votes)->
    percent =  parseInt(Math.round(votes / @poll.total * 100), 10)
    if isNaN percent then 50 else percent

  getVotes: (name)->
    for player in @poll.options
      if player.name is name
        return player.votes

  getPayouts: (userId)->
    return false unless userId
    fetchingPayouts = $.ajax
      url: "http://#{_url}/vote/v1/payouts/#{@poll.id}/#{userId}"
      jsonpCallback: "getCachedPayouts"

    fetchingPayouts.done (data)=>
      if userId is 21
        @poll.payout = 0
        @votedValue = ""
      else
        @poll.payout = data.payout
        @votedValue = data.name
        @$el.find("i").each (index)->
          $this = $(this)
          if $this.data("value") is data.name
            $this.addClass "disabled"
            $this.find(".potential-payout").text "Your payout: "
            $this.find(".potential").text data.payout

    fetchingPayouts.fail (jqxhr, status, text)->
      console.log jqxhr, status, text

  postVote: ->
    postingVote = $.ajax
      url: "http://#{_url}/vote/v1/votes/#{@poll.id}"
      type: "POST"
      dataType: "json"
      data:
        option:
          name: @votedValue
        user:
          id: userId
          name: displayName

    postingVote.done (data)=>
      returningVote = true
      for player, index in data.options
        if player.selected is true and userId isnt 21
          @payout = player.payout
          @$el.find(".potential.team-#{index + 1}").html player.payout

      @submittingPoll()

    postingVote.fail (jqxhr, status, text)->
      console.log jqxhr, status, text

  updateVotes: (target)->
    $el = @$el
    target = if target.nodeName is "I" then target else $(target).parents("i")[0]
    $target = $(target)
    $el.addClass "isSubmitting"
    @votedValue = $target.data "value"
    $(".disabled").removeClass("disabled").find(".potential-payout").text "Payout: "
    $target.addClass "disabled"
    $target.find(".potential-payout").text "Your Payout: "
    @postVote() if @votedValue?
    setTimeout ()=>
      updatingVote = true
      @submittingPoll()
    , 3000
    return false

  updatePoll: ->
    _this = this
    poll = @poll
    clearInterval getPollInterval
    return false unless poll?
    if poll.state is "inactive"
      updatePollView()
    else
      getPollInterval = setInterval ()->
        gettingPoll = getPoll poll.id
        gettingPoll.done (updatedPoll)->
          poll.total = updatedPoll.total
          poll.options = updatedPoll.options
          poll.state = updatedPoll.state
          _this.updatePollView()
      , @fetchUpdateInterval

  setupHandlers: ->
    _this = this
    @$el.find(".label i").click (evt)->
      evt.preventDefault()
      unless $(this).hasClass "disabled"
        _this.updateVotes this

  createPoll: (el)->
    poll = @poll
    chartHTML = '<div class="chart clearfix">'
    percentHTML = ''
    pollHTML = """
  <div id='#{poll.id}' class='poll_results'>
    <div class="label clearfix">
      <h4>Who Will Win Game #{poll.matchup.game.number}?</h4>
  """
    for player, index in poll.options
      break if index is 2
      payout = player.payout
      votes = player.votes || 0
      percent = @calculatePercent votes
      percentHTML += "<span class='team-#{index+1} team-percent'>#{percent}%</span>"
      chartHTML += "<div class='percent team-#{index+1}' style='width: #{percent}%' data-team='team-#{index+1}' data-value='#{player.name}'></div>"
      pollHTML += """
      <div class="team-#{index + 1}">
        <i data-value="#{player.name}" data-team="team-#{index + 1}">
          <p class='player'>#{player.name}</p>
          <p class='potential-label'><span class="potential-payout">Payout: </span><span class='potential team-#{index+1}'>#{payout}</span></p>
        </i>
      </div>
  """
      pollHTML += "<span class='separator'> or </span>" if index is 0

    pollHTML += '<div class="cover"></div></div>'

    chartHTML += "</div>"

    pollHTML += percentHTML + chartHTML
    pollHTML += "<p class='signin'></p>"
    pollHTML += "</div>"
    $(el).html pollHTML
    @el = document.getElementById poll.id
    @$el = $(@el)
    @setupHandlers()

  updatePollView: ->
    $poll = @$el
    if @poll.state is "inactive"
      $poll.find(".label div > p").remove()
      $poll.find("h4").fadeOut "fast", ()->
        $(this).text("Poll is now closed.").fadeIn("fast")
      $poll.find("i").addClass "disabled"
      setTimeout ->
        $poll.fadeOut "slow", ()->
          $(this).remove()
      , 5000
    else
      for player, index in @poll.options
        percent = @calculatePercent player.votes
        unless $poll.find(".team-#{index + 1} i").hasClass("disabled")
          $poll.find(".team-#{index + 1}.potential").html player.payout
        $poll.find(".team-#{index + 1}.percent").width("#{percent}%")
        $poll.find(".team-#{index + 1}.team-percent").html "#{percent}%"

  submittingPoll: ->
    if returningVote is true and updatingVote is true
      @$el.removeClass "isSubmitting"
      returningVote = false
      updatingVote = false

# ajax stuff
getPoll = (pollId)->
  return $.ajax
    url: "http://#{_url}/vote/v1/polls/#{pollId}"
    jsonpCallback: "getCachedPoll"

getPolls = (streamId)->
  stream = if streamId? then "?stream=#{streamId}" else ""
  return $.ajax
    url: "http://#{_url}/vote/v1/polls#{stream}"
    jsonpCallback: "getCachedPolls"

authCheck = ->
  return $.ajax
    url: "http://esports.ign.com/auth/v1/users/current/"
    cache: false

getStreams = ->
  return $.ajax
    url: "http://esports.ign.com/content/v1/streams.json"
    jsonpCallback: "getCachedStreams"

checkForNewPolls = (streamId)->
  clearInterval newPollInterval
  return false unless streamId?
  newPollInterval = setInterval ->
    fetchingPolls = getPolls(streamId)
    fetchingPolls.done (polls)->
      if $("#" + polls[0].id).length is 0
        loadPolls polls, streamId
   , fetchNewPoll

loadUser = (poll, userData)->
    if userData is null
      poll.$el.find(".signin").html "<a href='https://s.ign.com/'>Log in</a> to vote!"
    else
      userId = userData.profileId
      displayName = userData.displayName
      poll.$el.find(".signin").html "signed in as #{displayName}"
      poll.getPayouts userId

loadPolls = (pollData, streamId)->
  polls = ""

  for poll in pollData when poll.state is "active"
    poll = new Poll poll
    break

  checkingAuth = authCheck()

  checkingAuth.done (data)->
    loadUser poll, data

  checkingAuth.fail (jqxhr, status, text)->
    console.log jqxhr, status, text

  poll.createPoll "#poll_container"
  poll.updatePoll()

window.switchStreams = (streamId)->
  $("#poll_container").empty()
  fetchingPolls = getPolls(streamId)

  fetchingPolls.done (polls)->
    loadPolls polls, streamId

  checkForNewPolls streamId

$("#featured").delegate ".signin a", "click", (evt)->
  evt.preventDefault()
  gettingLogin = $.ajax
    url: "http://widgets.ign.com/social/shared/registration/signin.jsonp?disable_js=false&r=#{encodeURIComponent(document.location.href)}"
  gettingLogin.done (registration)->
    $("body").append registration
