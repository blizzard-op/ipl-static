basepath = ""
basepath = "http://esports.ign.com/addons/ipl-widgets/schedule/" if local?

iplSchedule =
  init: (config) ->
    unless config?
      config =
        franchise: "all"

    fetchingSchedule = this.fetchUrl "events"
    fetchingFranchises = this.fetchUrl "franchises"

    fetchingSchedule.fail (jqXHR, textStatus, errorThrown)->
      console.log jqXHR, textStatus, errorThrown

    fetchingFranchises.fail (jqXHR, textStatus, errorThrown)->
      console.log jqXHR, textStatus, errorThrown

    ###
    fetchingFranchises.done (data)->
      window.franchiseList = data if window.franchiseList?
    ###
    
    $.when(fetchingSchedule, fetchingFranchises).done (scheduleData, franchiseData) =>
      converted = @convertSchedule scheduleData[0]
      schedule = this.buildSchedule( converted, franchiseData[0], config.franchise)
      games = this.buildGames( converted, franchiseData[0], config.franchise)
      date = this.buildDates()
      allSchedules = schedule.join("")
      $("#schedule").html("<section class='guide'>" + games + date + allSchedules + "</section>").addClass("games-" + schedule.length) if schedule.length
      this.balanceGuide()

  getBroadcastDate: (broadcast) ->
    broadcastDate =
      starts_at: new Date broadcast.starts_at.dateTime
      ends_at: new Date broadcast.ends_at.dateTime


  fetchUrl: (type) ->
    $.ajax({
      url: "http://esports.ign.com/content/v1/" + type + ".json"
      dataType: "jsonp"
      cache: true
      jsonpCallback: "getCached" + type.charAt(0).toUpperCase() + type.slice(1)
    })


  buildGames: (scheduleData, franchiseData, currentFranchiseSlug = "all") ->
    gameList = "<ul class='games'>"
    gameList += "<li class='times'><p>Times for your time zone</p><a href='/ipl/all/schedule'>Full Schedule</a></li>"
    
    for franchise in franchiseData
      for own game, value of scheduleData
        if game is franchise.slug && (currentFranchiseSlug is "all" || currentFranchiseSlug is game)
          gameList += "<li class='gameHeader " + franchise.slug + "'><h3><a href='/ipl/" + franchise.slug + "'>" + franchise.name + "</a></h3></li>"
    gameList += "</ul>"

  buildDates: () ->
    dateList = "<ul class='dates'>"
    i = 0
    while i < 7
      day = moment().local().add("days", i)
      dayText = day.format("dddd")
      monthText = day.format("MMM")
      monthDateText = day.format("Do")
      dateList += "<li class='" + dayText.toLowerCase() + " clearfix " + (if i is 0 then 'today' else '') + "'><time><span>" + dayText + "</span><br />" + monthText + ", " + monthDateText + "</time></li>"
      i++

    dateList += "</ul>"

  convertSchedule: (scheduleData) ->
    franchiseList = {}
    index = 0
    # sort games into map
    for game in scheduleData
      unless franchiseList[game.franchise.slug]?
        franchiseList[game.franchise.slug] = []
      franchiseList[game.franchise.slug].push game
    franchiseList

  buildSchedule:(scheduleData, franchiseData, currentFranchiseSlug = "all") ->
    broadcastList = []
    index = 0

    for franchise in franchiseData
      for own game, broadcasts of scheduleData

        if game is franchise.slug && (currentFranchiseSlug is "all" || currentFranchiseSlug is game)
          i = 0
          broadcastList[index] = "<ul class='" + franchise.slug + " schedule'>"
          while i < 7
            day = moment().local().eod().add("days", i)
            if i is 0
              broadcastList[index] += "<li class='today " + day.format('dddd').toLowerCase() + "'><ul>"
            else
              broadcastList[index] += "<li class='" + day.format('dddd').toLowerCase() + "'><ul>"

            for broadcast in broadcasts
              broadcastDate = iplSchedule.getBroadcastDate broadcast
              streamName = broadcast.stream.name
              mainStream = if parseInt(streamName[streamName.length - 1], 10) is 1 then true else false
              if broadcastDate.starts_at.getDate() is day.date() and moment(broadcastDate.ends_at).local() > moment().local()
                broadcastList[index] += "<li class='clearfix'><p><time>" + moment(broadcastDate.starts_at).local().format("h:mma") + "</time> - <span class='title'>" + broadcast.title + "</span>"
                if broadcast.subtitle_1 || broadcast.subtitle_2
                  broadcastList[index] += "<br />" 
                  broadcastList[index] += "<span>" + broadcast.subtitle_1 + "</span> " if broadcast.subtitle_1
                  broadcastList[index] += "<span>" + broadcast.subtitle_2 + "</span> " if broadcast.subtitle_2
                broadcastList[index] += "<span> on #{streamName}</span>"
                if broadcast.rebroadcast
                  broadcastList[index] += "<br /><span class='old'>Rebroadcast</span>"
                else
                  broadcastList[index] += "<br /><span class='new'>All new</span>"
                if moment(broadcastDate.starts_at).local() < moment().local() < moment(broadcastDate.ends_at).local()
                  ###
                    for provider, index in broadcast.providers
                      if provider.id?
                        if provider.name is "twitch"
                          providerLinkUrl = "http://www.twitch.com/#{provider.id}"
                        if provider.name is "ign"
                          providerLinkUrl = "http://www.ign.com/ipl/#{franchise.slug}"
                      
                  ###
                  
                  if mainStream
                    broadcastList[index] += "<br /><a class='now' href= '/ipl/" + franchise.slug + "'>Watch now</a>"
                  #else
                    #broadcastList[index] += "<br /><a class='now' href= '/ipl/" + franchise.slug + "'>Watch now</a>"

                broadcastList[index] += "</p></li>"

            broadcastList[index] += "</ul></li>"
            i++
          broadcastList[index] += "</li></ul>"
          index++
    broadcastList

  balanceGuide: ->
    days = []
    i = 0
    while i < moment.weekdays.length
      days.push($(".guide li." + moment.weekdays[i].toLowerCase()))
      this.equalizeDays(days);
      i++

  equalizeDays: (days) ->
    i = 0
    while i < days.length
      maxHeight = 0;
      days[i].each ->
        itemHeight = $(this).outerHeight()
        maxHeight = itemHeight if maxHeight < itemHeight
      
      days[i].each ->
        $(this).height(maxHeight)
      i++


if scheduleConfig?
  iplSchedule.init scheduleConfig
else
  iplSchedule.init()