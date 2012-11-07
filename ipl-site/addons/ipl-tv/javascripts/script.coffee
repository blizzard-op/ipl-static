jsonURL = "http://esports.ign.com/live_channels.json"
# test url
jsonURL = "http://esports.ign.com/live_channels_" + test + "_test.json" if test

gettingLiveChannels = $.ajax({
    url: jsonURL,
    dataType: "jsonp",
    cache: true,
    jsonpCallback: "getCachedLiveChannels"
});
gettingLiveChannels.done (data) ->
  $container = $("#video-container")
  viewModel.liveChannelsJSON data
  viewModel.chatchannel(viewModel.liveChannelsJSON()[0].name)

  switch viewModel.liveChannelsJSON().length
    when 1 then viewModel.layout("one")
    when 2 then viewModel.layout("two")
    when 3 then viewModel.layout("three")
    when 4 then viewModel.layout("four")
    when 5 then viewModel.layout("five")
    when 6 then viewModel.layout("six")
    else viewModel.layout("one")
  $("#main").attr("class", viewModel.layout())
  players = []
  players.push LivePlayer.loadPlayer channel, i for channel, i in data
  for player, index in players
    $container.append player 

  LivePlayer.setVolume()
gettingLiveChannels.fail (a, b, c) ->
  console.log a, b, c




LivePlayer =
  loadPlayer: (channel, index) ->
    volume = if index is 0 then 50 else 0
    containerhtml = "<div class='player-wrapper video-" + (index + 1) + "'><div class='keep-aspect-ratio'><img src='http://media.ign.com/ev/esports/ipl-static/ipl-site/images/aspect-ratio-16-9.png' /><div class='video-wrapper'>"
    selectList = if viewModel.liveChannelsJSON().length > 1 then this.selectList(channel) else ""

    descriptionhtml = "<div class='description clearfix'><h4>" + channel.description + "</h4>" + selectList + "</div>"
    containerhtml += this.objectHTML(channel, volume) + "</div></div>" + descriptionhtml + "</div>"

  selectList: (currentChannel) -> 
    listhtml = "<select>"
    for channel in viewModel.liveChannelsJSON()
      listhtml += "<option value='" + channel.name + "' " + (if channel.name is currentChannel.name then 'selected' else '') + ">" + channel.name + "</option>";
    listhtml += "</select>"

  objectHTML: (channel, volume = 0) -> 
    _gaq.push ['_trackEvent', 'Live Play', channel.franchise_slug, channel.description] if _gaq
    comscoreEvent.fireVideoView();

    '<object type="application/x-shockwave-flash" height="100%" width="100%" data="http://www.justin.tv/widgets/jtv_player.swf?channel=' + channel.name + '"><param name="movie" value="http://www.justin.tv/widgets/jtv_player.swf"><param name="flashvars" value="start_volume=' + volume + '&channel=' + channel.name + '&auto_play=true&enable_javascript=true&consumer_key=96OPe6EWesFs5PdLgQzxA"><param name="allowFullScreen" value="true"><param name="allowScriptAccess" value="always"><param name="allowNetworking" value="all"><param name="wmode" value="transparent"></object>'

  setVolume: ->
    playerCollection = document.getElementsByTagName("object")
    setMute = (player, index)->
      playerSet = setInterval ->
        if typeof player.mute is "function" and typeof player.unmute is "function"
          if index is 0
            setTimeout ->
              player.unmute()
              clearInterval playerSet
            , 500
          if index isnt 0 and typeof player.mute is "function"
            setTimeout ->
              player.mute()
              clearInterval playerSet
            , 500
      , 50
    for player, index in playerCollection
      setMute(player, index)
updateLayout = (layout) ->
  $("#main").removeClass().addClass(layout)

$("#layout-switch").find("a").click (e) ->
  e.preventDefault()
  viewModel.layout($(this).data("layout"))
  $(".player-wrapper").each ()->
    $this = $(this)
    $this.css("max-width", "")
    $this.css("width", "")



$("aside").on "webkitTransitionEnd", (e) ->
  $(".player-wrapper").each ()->
    $this = $(this)
    if $(this).css("left") is "100%"
      maxWidth = $this.css("max-width")
      $this.css("max-width", maxWidth)
      width = $this.css("width")
      $this.css("width", width)
    else
      $this.css("max-width", "")
      $this.css("width", "")

$("#video-container").on "change", "select", (e) ->
  selectedchannel = channel for channel in viewModel.liveChannelsJSON() when channel.name is this.value
  channelhtml = LivePlayer.objectHTML selectedchannel
  if channelhtml
    $(this).siblings("h4").html selectedchannel.description
    $(this).parent().siblings(".keep-aspect-ratio").find("object").replaceWith channelhtml