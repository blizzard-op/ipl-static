basepath = ""
basepath = "http://esports.ign.com/addons/ipl-widgets/schedule/" if local?

iplSchedule =
  init: (config) ->
    unless config?
      config =
        franchise: "all"

    fetchingSchedule = this.fetchUrl "schedule"
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
      schedule = this.buildSchedule scheduleData[0], franchiseData[0], config.franchise
      games = this.buildGames scheduleData[0], franchiseData[0], config.franchise
      date = this.buildDates()
      allSchedules = schedule.join("")
      $("#schedule").html("<section class='guide'>" + games + date + allSchedules + "</section>").addClass("games-" + schedule.length) if schedule.length

      this.balanceGuide()

  getBroadcastDate: (broadcast) ->
    broadcastDate =
      starts_at: new Date broadcast.starts_at
      ends_at: new Date broadcast.ends_at

  fetchUrl: (type) ->
    $.ajax({
      url: "http://esports.ign.com/" + type + ".json"
      dataType: "jsonp"
      cache: true
      jsonpCallback: "getCached" + type
    })

  buildGames: (scheduleData, franchiseData, currentFranchiseSlug = all) ->
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

  buildSchedule: (scheduleData, franchiseData, currentFranchiseSlug = all) ->
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
              if broadcastDate.starts_at.getDate() is day.date() and broadcastDate.ends_at > moment()
                broadcastList[index] += "<li class='clearfix'><p><time>" + moment(broadcastDate.starts_at).format("h:mma") + "</time> - <span class='title'>" + broadcast.title + "</span>"
                if broadcast.subtitle_1 || broadcast.subtitle_2
                  broadcastList[index] += "<br />" 
                  broadcastList[index] += "<span>" + broadcast.subtitle_1 + "</span> " if broadcast.subtitle_1
                  broadcastList[index] += "<span>" + broadcast.subtitle_2 + "</span> " if broadcast.subtitle_2
                if broadcast.metadata.rebroadcast
                  broadcastList[index] += "<br /><span class='old'>Rebroadcast</span>"
                else
                  broadcastList[index] += "<br /><span class='new'>All new</span>"

                broadcastList[index] += "<br /><a class='now' href= '/ipl/" + franchise.slug + "'>Watch now</a>" if broadcastDate.starts_at < moment() < broadcastDate.ends_at
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