$(document).bind("mobileinit", function(){
  $.mobile.page.prototype.options.addBackBtn = true;
  $.mobile.page.prototype.options.backBtnText = "";
  $.extend($ .mobile, {
    defaultPageTransition: "slide",
    loadingMessageTheme: "c",
    addBackBtn: "true"
  });
});
var tweet_list = '';
var fetchTweets = function() {
  if(tweet_list.length === 0) {
    var fetchingTweets = $.ajax({
      url: "http://search.twitter.com/search.json?q=%23ipl4&rpp=25&include_entities=true",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: 'getCached'
    });
    fetchingTweets.done(function(data){
      var replaceHash = function(tweet, content) {
        if (tweet.entities.hashtags.length > 0) {
          for (var i = 0, len = tweet.entities.hashtags.length; i < len; i++) {
            var modifiedTweet = hashedTweet ? hashedTweet : content;
            var hashtag = "#" + tweet.entities.hashtags[i].text;
            var hashedTweet = modifiedTweet.replace(hashtag, "<a class='hashTag' rel='external' href='http://twitter.com/#!/search/%23" + tweet.entities.hashtags[i].text + "'>" + hashtag + "</a>");
          }
          return hashedTweet;
        } else {
          return content
        }
      }
      var replaceUrl = function(tweet, content) {
        if (tweet.entities.urls.length > 0) {
          for (var i = 0, len = tweet.entities.urls.length; i < len; i++) {
            var modifiedTweet = urledTweet ? urledTweet : content;
            var urledTweet = modifiedTweet.replace(tweet.entities.urls[i].url, "<a rel='external' href='" + tweet.entities.urls[i].url + "'>" + tweet.entities.urls[i].url + "</a>")
          }
          return urledTweet;
        } else {
          return content
        }
      }
      var replaceMention = function(tweet, content) {
        if (tweet.entities.user_mentions.length > 0) {
          for (var i = 0, len = tweet.entities.user_mentions.length; i < len; i++) {
            var modifiedTweet = mentionedTweet ? mentionedTweet : content;
            var reply = "@" + tweet.entities.user_mentions[i].screen_name;
            var mentionedTweet = modifiedTweet.replace(reply, "<a class='mention' rel='external' href='http://www.twitter.com/" + tweet.entities.user_mentions[i].screen_name + "'>" + reply + "</a>")
          }
          return mentionedTweet;
        } else {
          return content
        }
      }
      for(var i = 0, len = data.results.length; i < len; i++){
        var tweet = data.results[i];
        var hashedTweet = replaceHash(tweet, tweet.text);
        var urledTweet = replaceUrl(tweet, hashedTweet);
        var mentionedTweet = replaceMention(tweet, urledTweet);
        tweet_list += "<li><img src='" + tweet.profile_image_url + "' /><h4><a href='http://www.twitter.com/" + tweet.from_user + "'>" + tweet.from_user_name + "</a></h4><p>" + mentionedTweet + "</p></li>"
      };
      $("#tweetContainer").html(tweet_list).listview('refresh');
    });
  }
};

$( document ).on( 'pagebeforecreate', "#tweets", function(event){
  fetchTweets();
});

$(document).on("pageshow", "#maps", function() {
  window.mySwipe = new Swipe(document.getElementById('mapContainer'), {
    startSlide: 1,
    callback: function(event, index, elem) {
      $("#mapNav li").eq(index).addClass("selected").siblings().removeClass("selected");
    }
  });
  var $listNav = $("#mapNav").find("li");
  var margin = 2;
  $listNav.each(function(){
    $(this).css({
      "margin-right": margin + "%",
      "width": 100/$listNav.length - (margin*(($listNav.length-1)/$listNav.length))  + "%" 
    })
  })
});
$(document).on("touchstart", "#mapNav a", function(e) {
  $li = $(this).parent()
  e.preventDefault();
  window.mySwipe.slide($li.index(), 300);
  $li.addClass("selected").siblings().removeClass("selected");
});

$( document ).on( 'pagebeforecreate', "#upcoming", function(event){
  getCalendarData();
});

var getCalendarData = function() {
  var gCalData = $.ajax({
    url: "http://www.google.com/calendar/feeds/1bksoih424eirssc01d6mcnj6g@group.calendar.google.com/public/full?alt=json-in-script&orderby=starttime&max-results=20&singleevents=true&sortorder=ascending&futureevents=true",
    dataType: 'jsonp'
  });
  var events;
  gCalData.done(function(data) {
    happeningNow(data);
  });
  gCalData.fail(function(jqXHR, textStatus, errorThrown) {
    console.log(jqXHR, textStatus, errorThrown);
  });
}
var happeningNow = function(data) {
  var event = data.feed.entry,
      events = {
        currentlyHappening: [],
        upcoming: [],
        laterToday: []
      },
      date = new Date(),
      now = date.getTime(),
      html = '';
  for (var i = 0, len = event.length; i < len; i++) {
    var begin = new Date(event[i].gd$when[0].startTime),
        end = new Date(event[i].gd$when[0].endTime);
    if (now > begin.getTime() && now < end.getTime()) {
      events.currentlyHappening.push(event[i]);
    } else if (begin.getDate() === date.getDate() && begin.getTime() - now < 3600000) {
      events.upcoming.push(event[i]);
    } else if (begin.getDate() === date.getDate()) {
      events.laterToday.push(event[i]);
    }
  }
  var upcomingFranchise = function(title) {
    upcomingInfo = {
      title: "",
      franchise: ""
    }
    if (title.match(/\[SC2\]/)) {
      upcomingInfo.title = $.trim(title.replace("[SC2]", ''));
      upcomingInfo.franchise = 'starcraft-2';
    } else if (title.match(/\[LoL\]/)) {
      upcomingInfo.title = $.trim(title.replace("[LoL]", ''));
      upcomingInfo.franchise = 'league-of-legends';
    } else {
      upcomingInfo.title = $.trim(title)
      upcomingInfo.franchise = 'all';
    }
    return upcomingInfo;
  }
  if (events.currentlyHappening.length){
    html += "<div data-role='collapsible' data-collapsed='false' data-content-theme='c'><h1>Happening now</h1><ul>";
    for (var i = 0, len = events.currentlyHappening.length; i < len; i++) {
      var upcomingData = upcomingFranchise(events.currentlyHappening[i].title.$t);
      html += "<li class='" + upcomingInfo.franchise + "'><h3>" + upcomingInfo.title + "</h3><p>" + events.currentlyHappening[i].content.$t + "</p></li>";
    }
    html += "</ul></div>"
  }
  if (events.upcoming.length){
    html += "<div data-role='collapsible' data-content-theme='c'><h1>Happening in the next hour</h1><ul>"
    for (var i = 0, len = events.upcoming.length; i < len; i++) {
      var upcomingData = upcomingFranchise(events.upcoming[i].title.$t);
      html += "<li class='" + upcomingInfo.franchise + "'><h3>" + upcomingInfo.title + "</h3><p>" + events.upcoming[i].content.$t + "</p></li>";
    }
    html += "</ul></div>";
  }
  if (events.laterToday.length){
    html += "<div data-role='collapsible' data-content-theme='c'><h1>Happening Later Today</h1><ul>"
    for (var i = 0, len = events.laterToday.length; i < len; i++) {
      var upcomingData = upcomingFranchise(events.laterToday[i].title.$t);
      html += "<li class='" + upcomingInfo.franchise + "'><h3>" + upcomingInfo.title + "</h3><p>" + events.laterToday[i].content.$t + "</p></li>";
    }
    html += "</ul></div>";
  }
  $("#upcomingContainer").html(html).trigger('pagecreate');
}