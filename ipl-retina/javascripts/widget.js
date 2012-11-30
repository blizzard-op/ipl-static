// Generated by CoffeeScript 1.3.3
(function() {
  var authCheck, calculatePercent, checkForNewPolls, createDescription, createPoll, currentStreams, descriptionText, getGeoIP, getPayouts, getPoll, getPollInterval, getPolls, getStreams, getVotes, init, loadDigibet, loadPolls, loadUser, loadVideo, loadWidget, newPollInterval, pollForStream, pollsObj, postVote, randomizeOrder, readCookie, restrictedCountries, returningVote, streamKeys, submittingPoll, updatePoll, updatePollView, updateVotes, updatingVote, userId, _mediaUrl, _url;

  if (document.location.port === "3000") {
    _url = "test.ign.com:3000";
    _mediaUrl = "localhost:8888/media";
  } else {
    _url = "esports.ign.com";
    _mediaUrl = "media.ign.com";
  }

  getPollInterval = "";

  pollsObj = {};

  userId = 21;

  newPollInterval = "";

  restrictedCountries = ["United States", "France", "Spain", "Denmark", "Netherlands", "Belgium"];

  returningVote = false;

  updatingVote = false;

  streamKeys = [];

  currentStreams = {};

  descriptionText = {
    "league-of-legends": "League of Legends is a popular team game featuring intense combat and complex \nstrategies. Teams of 5 battle it out with the overall goal of destroying their opponents’ base. The team \nwith the greater mechanics, and the greater strategy, will prevail. \n<a href=\"http://www.ign.com/ipl/league-of-legends/ipl-5\">More Details</a>",
    "shootmania": "ShootMania is a pure first person shooter with a $100,000 tournament being held live at \nIPL5! The 8 best teams from North America and Europe will be battling it out in ShootMania's \nElite mode, which pits 1 attacker against 3 defenders in a tug of war battle for the Goal with the winner \ntaking home the $30,000 first prize!\n<a href=\"http://www.ign.com/ipl/shootmania/ipl-5\">More Details</a>",
    "fighters": "IPL Welcomes Capcom!",
    "starcraft-2": "At IPL5, 72 of the world’s greatest StarCraft II players compete for $100,000 in prizes \nin a double elimination bracket! First place takes $40,000 and earns the title IPL5 Champion! \n<a href=\"http://www.ign.com/ipl/starcraft-2/ipl-5\">More Details</a>"
  };

  calculatePercent = function(total, votes) {
    var percent;
    percent = parseInt(Math.round(votes / total * 100), 10);
    if (isNaN(percent)) {
      percent = 50;
    }
    return percent;
  };

  getVotes = function(poll, name) {
    var player, _i, _len, _ref;
    _ref = poll.options;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      player = _ref[_i];
      if (player.name === name) {
        return player.votes;
      }
    }
  };

  pollForStream = function(poll, streamId) {
    if (poll.stream.id === streamId) {
      return poll;
    } else {
      return false;
    }
  };

  createPoll = function(poll) {
    var chartHTML, index, payout, percent, percentHTML, player, pollHTML, votes, _i, _j, _len, _len1, _ref, _ref1;
    pollHTML = "<div id='" + poll.id + "' class='results vcentered'>\n  <img src='http://" + _mediaUrl + "/ev/esports/ipl-static/ipl-site/images/ipl5-150x115.png' alt='IPL5 logo' class=\"ipl5-logo\" />\n  <h4>Who Will Win Game " + poll.matchup.game.number + "?</h4>\n  <div class=\"label clearfix\">";
    _ref = poll.options;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      player = _ref[index];
      if (index === 2) {
        break;
      }
      payout = player.payout;
      pollHTML += "<div class=\"team-" + (index + 1) + "\">\n  <p>Vote for</p>\n  <i data-value=\"" + player.name + "\" data-combined-id=\"" + poll.id + "\" data-team=\"team-" + (index + 1) + "\">\n    <p>" + player.name + "</p>\n    <p class='potential-label'><span class=\"potential-payout\">Payout: </span><span class='potential team-" + (index + 1) + "'>" + payout + "</span></p>\n  </i>\n</div>";
      if (index === 0) {
        pollHTML += "<span> or </span>";
      }
    }
    pollHTML += '<div class="cover"></div></div>';
    chartHTML = '<div class="chart clearfix">';
    percentHTML = '';
    _ref1 = poll.options;
    for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
      player = _ref1[index];
      if (index === 2) {
        break;
      }
      votes = player.votes || 0;
      percent = calculatePercent(poll.total, votes);
      percentHTML += "<span class='team-" + (index + 1) + " team-percent'>" + percent + "%</span>";
      chartHTML += "<div class='percent team-" + (index + 1) + "' style='width: " + percent + "%' data-team='team-" + (index + 1) + "' data-value='" + player.name + "'></div>";
    }
    chartHTML += "</div>";
    pollHTML += percentHTML + chartHTML;
    pollHTML += "<p class='signin'></p>";
    pollHTML += "<a href='http://www.ign.com/ipl/vote/leaderboard'>Leaderboard and rules</a>";
    return pollHTML += "</div>";
  };

  updatePollView = function(poll) {
    var $poll, index, percent, player, _i, _len, _ref, _results;
    $poll = $("#" + poll.id);
    if (poll.state === "inactive") {
      $poll.find(".label div > p").remove();
      $poll.find("h4").fadeOut("fast", function() {
        return $(this).text("Poll is now closed. " + poll.matchup.game.winner + " wins!").fadeIn("fast");
      });
      $poll.find("i").addClass("disabled");
      return setTimeout(function() {
        return $poll.fadeOut("slow", function() {
          return $(this).remove();
        });
      }, 5000);
    } else {
      _ref = poll.options;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        player = _ref[index];
        percent = calculatePercent(poll.total, player.votes);
        if (!$poll.find(".team-" + (index + 1) + " i").hasClass("disabled")) {
          $poll.find(".team-" + (index + 1) + ".potential").html(player.payout);
        }
        $poll.find(".team-" + (index + 1) + ".percent").width("" + percent + "%");
        _results.push($poll.find(".team-" + (index + 1) + ".team-percent").html("" + percent + "%"));
      }
      return _results;
    }
  };

  createDescription = function(franchiseSlug) {
    return "<div class='description cvr-highlights'><h3 class='cvr-headline lcs-headline'>" + currentStreams[franchiseSlug].title + "</h3><p class='cvr-teaser lcs-teaser'>" + descriptionText[franchiseSlug] + "</p></div>";
  };

  getPayouts = function(pollId, userId) {
    var fetchingPayouts;
    if (!userId) {
      return false;
    }
    fetchingPayouts = $.ajax({
      url: "http://" + _url + "/vote/v1/payouts/" + pollId + "/" + userId,
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedPayouts"
    });
    fetchingPayouts.done(function(data) {
      var $poll;
      if (userId === 21) {
        pollsObj[pollId].payout = 0;
        return pollsObj[pollId].name = "";
      } else {
        $poll = $("#" + pollId);
        pollsObj[pollId].payout = data.payout;
        pollsObj[pollId].name = data.name;
        return $poll.find("i").each(function(index) {
          if ($(this).data("value") === data.name) {
            $(this).addClass("disabled");
            $(this).find(".potential-payout").text("Your payout: ");
            return $(this).find(".potential").text(data.payout);
          }
        });
      }
    });
    return fetchingPayouts.fail(function(jqxhr, status, text) {
      return console.log(jqxhr, status, text);
    });
  };

  getPoll = function(pollId) {
    return $.ajax({
      url: "http://" + _url + "/vote/v1/polls/" + pollId,
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedPoll"
    });
  };

  getPolls = function(streamId) {
    var stream;
    stream = streamId != null ? "?stream=" + streamId : "";
    return $.ajax({
      url: "http://" + _url + "/vote/v1/polls" + stream,
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedPolls"
    });
  };

  postVote = function(pollId, votedValue) {
    var postingVote;
    postingVote = $.post("http://" + _url + "/vote/v1/votes/" + pollId, {
      option: {
        name: votedValue
      },
      user: {
        id: userId
      }
    });
    postingVote.done(function(data) {
      var $poll, index, player, _i, _len, _ref;
      returningVote = true;
      $poll = $("#" + data.id);
      _ref = data.options;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        player = _ref[index];
        if (player.selected === true && userId !== 21) {
          pollsObj[data.id].payout = player.payout;
          $poll.find(".potential.team-" + (index + 1)).html(player.payout);
        }
      }
      return submittingPoll($poll);
    });
    return postingVote.fail(function(jqxhr, status, text) {
      return console.log(jqxhr, status, text);
    });
  };

  updatePoll = function(poll) {
    clearInterval(getPollInterval);
    if (poll == null) {
      return false;
    }
    if (poll.state === "inactive") {
      return updatePollView(poll);
    } else {
      return getPollInterval = setInterval(function() {
        var gettingPoll;
        gettingPoll = getPoll(poll.id);
        return gettingPoll.done(function(poll) {
          return updatePollView(poll);
        });
      }, 10000);
    }
  };

  submittingPoll = function($poll) {
    if (returningVote === true && updatingVote === true) {
      $poll.removeClass("isSubmitting");
      returningVote = false;
      return updatingVote = false;
    }
  };

  checkForNewPolls = function(streamId) {
    clearInterval(newPollInterval);
    if (streamId == null) {
      return false;
    }
    return newPollInterval = setInterval(function() {
      var fetchingPolls;
      fetchingPolls = getPolls(streamId);
      return fetchingPolls.done(function(polls) {
        var currentPoll, poll;
        poll = polls[0];
        if (!$("#" + poll.id).length) {
          currentPoll = poll;
          pollsObj[poll.id] = poll;
          $("#poll-container").prepend(createPoll(poll));
          getPayouts(poll.id, userId);
          return updatePoll(poll);
        }
      });
    }, 30000);
  };

  updateVotes = function(evt) {
    var $poll, currentPoll, pollId, target;
    target = evt.target.nodeName === "I" ? evt.target : $(evt.target).parents("i")[0];
    pollId = $(target).data("combined-id");
    currentPoll = pollsObj[pollId];
    $poll = $("#" + pollId);
    $poll.addClass("isSubmitting");
    currentPoll.votedValue = $(target).data("value");
    $(".disabled").removeClass("disabled").find(".potential-payout").text("Payout: ");
    $(target).addClass("disabled");
    $(target).find(".potential-payout").text("Your Payout: ");
    if (currentPoll.votedValue != null) {
      postVote(pollId, currentPoll.votedValue);
    }
    setTimeout(function() {
      updatingVote = true;
      return submittingPoll($poll);
    }, 3000);
    return false;
  };

  authCheck = function() {
    return $.ajax({
      url: "http://esports.ign.com/auth/v1/users/current/",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedAuth"
    });
  };

  getGeoIP = function() {
    return $.ajax({
      url: "http://69.10.24.59/countries/self.jsonp",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedGeoIP"
    });
  };

  loadUser = function(userData, pollId) {
    if (userData === null) {
      return $("#" + pollId).find(".signin").html("<a href='https://s.ign.com/'>Log in</a> and vote to win an IPL PC!");
    } else {
      userId = userData.profileId;
      return getPayouts(pollId, userData.profileId);
    }
  };

  loadDigibet = function(country) {
    var $results, countryName, restricted, _i, _len;
    if (!country) {
      return false;
    }
    restricted = false;
    for (_i = 0, _len = restrictedCountries.length; _i < _len; _i++) {
      countryName = restrictedCountries[_i];
      if (!(country === countryName)) {
        continue;
      }
      restricted = true;
      break;
    }
    $results = $("#poll-container").find(".results");
    if (restricted === false) {
      return $results.removeClass("vcentered").append("<a href='http://media.digibet.com/redirect.aspx?pid=2693&bid=1501' class='digibet'><img src='http://" + _mediaUrl + "/ev/esports/ipl-static/ipl-site/images/digibet-01.png' alt='Digibet' /><a>");
    }
  };

  loadPolls = function(pollData, streamId) {
    var checkingAuth, currentPoll, fetchingIP, poll, polls, _i, _j, _len, _len1;
    polls = "";
    currentPoll = "";
    if (streamId != null) {
      for (_i = 0, _len = pollData.length; _i < _len; _i++) {
        poll = pollData[_i];
        if (!(poll.state === "active")) {
          continue;
        }
        currentPoll = poll;
        pollsObj[poll.id] = poll;
        polls = createPoll(poll);
        break;
      }
    } else {
      currentPoll = pollData[0];
      for (_j = 0, _len1 = pollData.length; _j < _len1; _j++) {
        poll = pollData[_j];
        pollsObj[poll.id] = poll;
        polls += createPoll(poll);
      }
    }
    checkingAuth = authCheck();
    fetchingIP = getGeoIP();
    fetchingIP.done(function(data) {
      return loadDigibet(data.name);
    });
    checkingAuth.done(function(data) {
      return loadUser(data, currentPoll.id);
    });
    checkingAuth.fail(function(jqxhr, status, text) {
      return console.log(jqxhr, status, text);
    });
    fetchingIP.fail(function(jqxhr, status, text) {
      return console.log(jqxhr, status, text);
    });
    $("#poll-container").prepend(polls);
    return updatePoll(currentPoll);
  };

  init = function(streamId) {
    var fetchingPolls;
    checkForNewPolls(streamId);
    fetchingPolls = getPolls(streamId);
    fetchingPolls.done(function(polls) {
      return loadPolls(polls, streamId);
    });
    return fetchingPolls.fail(function(jqxhr, status, text) {
      return console.log(jqxhr, status, text);
    });
  };

  readCookie = function(name) {
    var c, ca, nameEQ, _i, _len;
    nameEQ = name + "=";
    ca = document.cookie.split(';');
    for (_i = 0, _len = ca.length; _i < _len; _i++) {
      c = ca[_i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  };

  getStreams = function() {
    var gettingStreams;
    $("head").append("<link rel='stylesheet' href='http://" + _mediaUrl + "/ev/esports/ipl-static/ipl-retina/stylesheets/widget.css'>");
    $("#coverStoriesContainer .evo-wrapper").append("<div class='evo-coverStories'><div class='carousel'><div class='storyUnit wide index-0 active'><div class='cvr-main'></div><div id='poll-container' class='cvr-highlights'></div></div></div></div>");
    gettingStreams = $.ajax({
      url: "http://esports.ign.com/content/v1/streams.json",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedStreams"
    });
    return gettingStreams.done(function(streams) {
      var order, stream, _i, _len;
      for (_i = 0, _len = streams.length; _i < _len; _i++) {
        stream = streams[_i];
        if (!(stream.providers[0].id !== null && typeof currentStreams[stream.franchise.slug] === "undefined")) {
          continue;
        }
        streamKeys.push(stream.franchise.slug);
        currentStreams[stream.franchise.slug] = stream;
      }
      order = randomizeOrder(streamKeys);
      return loadWidget(order);
    });
  };

  loadWidget = function(order) {
    var IGNId, first, franchiseSlug, index, provider, tabs, _i, _j, _len, _len1, _ref;
    first = '';
    tabs = "<div class='fuseNav clearfix'>";
    for (index = _i = 0, _len = order.length; _i < _len; index = ++_i) {
      franchiseSlug = order[index];
      first = index === 0 ? 'first' : '';
      tabs += "<a href='http://www.ign.com/ipl/" + franchiseSlug + "'class='tab " + franchiseSlug + " " + first + " tab-" + (order.length + 1) + "'><span class='text' data-franchise='" + franchiseSlug + "' >Live: " + currentStreams[franchiseSlug].franchise.name + "</span><span class='fuse'><span></span></span></a>";
    }
    tabs += "<a href='#'class='tab whatisipl tab-" + (order.length + 1) + "'><span class='text'>What is IPL?</span><span class='fuse'><span></span></span></a>";
    tabs += "</div>";
    $(".evo-coverStories").prepend(tabs);
    if (typeof selectedFranchise !== "undefined" && selectedFranchise !== null) {
      franchiseSlug = selectedFranchise;
      document.cookie = "ipl5selectedstream=" + franchiseSlug + "; expires=Mon, 3 Dec 2012 01:00:00 UTC; path=/";
    } else if (readCookie("ipl5selectedstream")) {
      franchiseSlug = readCookie("ipl5selectedstream");
    } else {
      franchiseSlug = order[0];
    }
    $(".fuseNav ." + franchiseSlug).addClass("active");
    if (typeof window.initialLoadDisqus === "function") {
      initialLoadDisqus(franchiseSlug);
    }
    IGNId = "";
    _ref = currentStreams[franchiseSlug].providers;
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      provider = _ref[_j];
      if (provider.name === "ign") {
        IGNId = provider.id;
      }
    }
    loadVideo(IGNId);
    $("#poll-container").prepend(createDescription(franchiseSlug));
    return init(currentStreams[franchiseSlug].id);
  };

  randomizeOrder = function(franchiseArray) {
    var i, j, tempi, tempj;
    i = franchiseArray.length;
    if (i === 0) {
      return false;
    }
    while (--i) {
      j = Math.floor(Math.random() * (i + 1));
      tempi = franchiseArray[i];
      tempj = franchiseArray[j];
      franchiseArray[i] = tempj;
      franchiseArray[j] = tempi;
    }
    return franchiseArray;
  };

  loadVideo = function(IGNId, muted) {
    var gettingVideos;
    if (IGNId == null) {
      IGNId = "503a23efb2658992583643d4494be5f8";
    }
    if (muted == null) {
      muted = true;
    }
    gettingVideos = $.ajax({
      url: "http://widgets.ign.com/video/embed/content.jsonp?id=" + IGNId + "&automute=" + muted + "&autoplay=true&width=640&height=360",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedVideo"
    });
    return gettingVideos.done(function(data) {
      return $(".cvr-main").html(data);
    });
  };

  getStreams();

  $("#coverStoriesContainer").delegate("#poll-container .label i", "click", function(evt) {
    evt.preventDefault();
    if (!$(this).hasClass("disabled")) {
      return updateVotes(evt);
    }
  });

  $("#coverStoriesContainer").delegate(".signin a", "click", function(evt) {
    var gettingLogin;
    evt.preventDefault();
    gettingLogin = $.ajax({
      url: "http://widgets.ign.com/social/shared/registration/signin.jsonp?disable_js=false&r=" + (encodeURIComponent(document.location.href)),
      dataType: "jsonp"
    });
    return gettingLogin.done(function(registration) {
      return $("body").append(registration);
    });
  });

  $("#coverStoriesContainer").delegate(".tab:not('.whatisipl')", "click", function(evt) {
    var $pollContainer, IGNId, franchiseSlug, provider, _i, _len, _ref;
    evt.preventDefault();
    franchiseSlug = $(evt.target).data("franchise");
    document.cookie = "ipl5selectedstream=" + franchiseSlug + "; expires=Mon, 3 Dec 2012 01:00:00 UTC; path=/";
    _ref = currentStreams[franchiseSlug].providers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      provider = _ref[_i];
      if (provider.name === "ign") {
        IGNId = provider.id;
      }
    }
    loadVideo(IGNId, false);
    $pollContainer = $("#poll-container");
    $pollContainer.children().each(function() {
      return $(this).fadeOut("slow", function() {
        return $(this).remove();
      });
    });
    $pollContainer.prepend(createDescription(franchiseSlug));
    $(".tab").removeClass("active");
    $(this).addClass("active");
    init(currentStreams[franchiseSlug].id);
    if (typeof window.loadDisqus === "function") {
      return loadDisqus(franchiseSlug);
    }
  });

  $("#coverStoriesContainer").delegate(".tab.whatisipl", "click", function(evt) {
    var $pollContainer, franchiseSlug, whatIsIPLDescription, whatIsIPLDescriptionHTML;
    evt.preventDefault();
    franchiseSlug = $(evt.target).data("franchise");
    loadVideo(null, false);
    $pollContainer = $("#poll-container");
    $pollContainer.children().each(function() {
      return $(this).fadeOut("slow", function() {
        return $(this).remove();
      });
    });
    whatIsIPLDescription = "The IGN ProLeague is holding a $300,000 eSports tournament at the Cosmopolitan of Las Vegas this weekend! \nIPL5 features the top professional gamers competing in StarCraft 2, League of Legends, and ShootMania. Catch \nthe action all weekend long here on IGN.com.\n<a href=\"http://www.ign.com/ipl/all/ipl-5\">More Details</a>";
    whatIsIPLDescriptionHTML = "<div class='description cvr-highlights'><h3 class='cvr-headline lcs-headline'>What is IPL?</h3><p class='cvr-teaser lcs-teaser'>" + whatIsIPLDescription + "</p></div>";
    $pollContainer.prepend(whatIsIPLDescriptionHTML);
    updatePoll();
    checkForNewPolls();
    $(".tab").removeClass("active");
    return $(this).addClass("active");
  });

  $("#chat-toggle").click(function() {
    var $disqusThread, $schedule, visible;
    $schedule = $("#schedule");
    $disqusThread = $("#disqus_thread");
    visible = $schedule.is(':visible');
    if (visible) {
      $schedule.fadeOut("fast");
      return $disqusThread.fadeIn("fast");
    } else {
      $schedule.fadeIn("fast");
      return $disqusThread.fadeOut("fast");
    }
  });

}).call(this);
