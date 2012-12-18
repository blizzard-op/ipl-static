today = moment().sod().format()
week = moment().add("days", 6).eod().format()

Handlebars.registerHelper 'formattedDateTime', ->
  text = moment(this.starts_at.dateTime).format("h:mma")
  new Handlebars.SafeString text



Handlebars.registerHelper 'today', ->
  if this[0].startWeekDay is moment().format("dddd")
    return '<div class="schedule_calendar today">'
  return '<div class="schedule_calendar">'
$scheduleTemplate = $("#schedule-template")
return unless $scheduleTemplate.length
scheduleTemplate = $scheduleTemplate.html()
tmpl = Handlebars.compile scheduleTemplate
do ->

  fetchingEvents = $.ajax
    url: "http://esports.ign.com/content/v1/events.json?startDate=#{today}&endDate=#{week}"
    dataType: "jsonp"
    cache: true
    jsonpCallback: "getCachedEvents"

  fetchingEvents.done (events)->
    rows = ''
    groupOfEvents = _.chain events
      .filter (event)->
        if franchise is "all"
          return event
        else
          return event.franchise.slug is franchise
      .groupBy (event)->
        return moment(event.starts_at.dateTime).format("MM-DD-YYYY")
      .value()

    dates = []

    previousDay = moment()
    for key, value of groupOfEvents
      dates.push key
      formattedDay = moment(key)
      diff = formattedDay.diff(previousDay, "days")
      while(diff > 1)
        newDate = previousDay.add("days", 1).format("MM-DD-YYYY")
        dates.push newDate
        groupOfEvents[newDate] = [
          {
            startTime: newDate
          }
        ]
          
        diff -= 1
      previousDay = formattedDay

    dates.sort()


    for date in dates
      mdate = moment(date)
      firstEvent = groupOfEvents[date][0]
      firstEvent.startDay = mdate.date()
      firstEvent.startWeekDay = mdate.format("dddd")
      firstEvent.startMonth = mdate.format("MMM")
      firstEvent.startYear = mdate.year()
      rows += tmpl groupOfEvents[date]


    $("#schedule").append rows
