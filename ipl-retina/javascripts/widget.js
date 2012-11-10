// Generated by CoffeeScript 1.3.3
(function() {
  var authCheck, calculatePercent, createPoll, currentStreams, getPayouts, getPolls, getStreams, getVotes, init, loadPolls, loadUser, loadVideo, loadWidget, pollForStream, pollsObj, postVote, randomizeOrder, readCookie, socket, streamKeys, updateVotes, userId;

  socket = io.connect("http://esports.ign.com:80");

  pollsObj = {};

  userId = 21;

  calculatePercent = function(total, votes) {
    return parseInt(Math.round(votes / total * 100), 10);
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
    var index, payout, percent, player, pollHTML, votes, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    pollHTML = "<div id='" + poll.id + "' class='results'>\n  <h4>Who Will Win Game " + poll.matchup.game.number + "?</h4>\n  <div class=\"label clearfix\">";
    _ref = poll.options;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      player = _ref[index];
      pollHTML += "<div class=\"team-" + (index + 1) + "\" data-combined-id=\"" + poll.id + "\">\n  <p>Vote for</p>\n  <i data-value=\"" + player.name + "\" data-team=\"team-" + (index + 1) + "\">" + player.name + "</i>\n</div>";
      if (index === 0) {
        pollHTML += "<span> or </span>";
      }
    }
    pollHTML += '</div><div class="chart clearfix">';
    _ref1 = poll.options;
    for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
      player = _ref1[index];
      votes = player.votes || 0;
      percent = calculatePercent(poll.total, votes);
      if (isNaN(percent)) {
        percent = 50;
      }
      if (Math.round(votes / poll.total * 100) + Math.round((poll.total - votes) / poll.total * 100) > 100) {
        if (index === 1 && percent > 0) {
          percent -= 1;
        }
      }
      if (index === 0) {
        pollHTML += "<div class='percent team-" + (index + 1) + "' style='width: " + percent + "%' data-team='team-" + (index + 1) + "' data-value='" + player.name + "'>" + percent + "%</div>";
      } else {
        pollHTML += "<div class='percent team-" + (index + 1) + "' style='width: " + percent + "%' data-team='team-" + (index + 1) + "' data-value='" + player.name + "'>" + percent + "%</div>";
      }
    }
    pollHTML += "</div>";
    _ref2 = poll.options;
    for (index = _k = 0, _len2 = _ref2.length; _k < _len2; index = ++_k) {
      player = _ref2[index];
      payout = player.payout;
      pollHTML += "<p class='team-" + (index + 1) + "'>Potential: <span class='potential'>" + payout + "</span></p>";
    }
    pollHTML += "<div class='payout'>\n  <p>You chose:\n    <span id='team-" + poll.id + "'> </span>\n  </p>";
    if (userId !== 21) {
      pollHTML += "<p>Winning payout: <span id='payout-" + poll.id + "'>0</span></p>";
    } else {
      pollHTML += "<p><a href='https://s.ign.com/' class='signin'>Login</a> to have your scores tracked</p>";
    }
    pollHTML += "<a href='/vote/v1/leaderboard'>Leaderboard and rules</a>";
    return pollHTML += "</div>";
  };

  socket.on("createPoll", function(poll) {
    var $pollContainer;
    pollsObj[poll.id] = poll;
    $pollContainer = $("#" + poll.id);
    if ($pollContainer.length) {
      $pollContainer.remove();
    }
    return $("#poll-container").prepend(createPoll(poll));
  });

  socket.on("updatePoll", function(poll) {
    var $poll, index, modifier, percent, player, _i, _len, _ref, _results;
    $poll = $("#" + poll.id);
    if (poll.state === "inactive") {
      $poll.find(".label p").remove();
      $poll.find("h4").fadeOut("slow", function() {
        return $(this).text("Poll is now closed. " + poll.winner + " wins!").fadeIn();
      });
      $poll.find("i").addClass("disabled");
      if (userId !== 21) {
        $poll.find(".payout").fadeOut("slow", function() {
          if (poll.winner === pollsObj[poll.id].votedValue) {
            return $(this).text("You earned " + pollsObj[poll.id].payout + " points").fadeIn();
          } else {
            return $(this).text("Sorry better luck next time.").fadeIn();
          }
        });
      }
      return setTimeout(function() {
        return $poll.fadeOut();
      }, 5000);
    } else {
      _ref = poll.options;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        player = _ref[index];
        percent = calculatePercent(poll.total, player.votes);
        modifier = index === 0 ? 1 : 0;
        $poll.find(".team-" + (index + 1) + " .potential").html(player.payout);
        _results.push($poll.find(".team-" + (index + 1) + ".percent").width("" + (percent - modifier) + "%").html("" + percent + "%"));
      }
      return _results;
    }
  });

  getPayouts = function(pollId, userId) {
    var fetchingPayouts;
    if (!userId) {
      return false;
    }
    fetchingPayouts = $.ajax({
      url: "/vote/v1/payouts/" + pollId + "/" + userId,
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedPayouts"
    });
    fetchingPayouts.done(function(data) {
      if (userId === 21) {
        pollsObj[pollId].payout = 0;
        pollsObj[pollId].name = "";
      } else {
        pollsObj[pollId].payout = data.payout;
        pollsObj[pollId].name = data.name;
      }
      $("#team-" + pollId).html(pollsObj[pollId].name);
      if (userId !== 21) {
        return $("#payout-" + pollId).html(pollsObj[pollId].payout);
      }
    });
    return fetchingPayouts.fail(function(jqxhr, status, text) {
      return console.log(jqxhr, status, text);
    });
  };

  getPolls = function(streamId) {
    var stream;
    stream = streamId != null ? "?stream=" + streamId : "";
    return $.ajax({
      url: "/vote/v1/polls" + stream,
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedPolls"
    });
  };

  postVote = function(pollId, votedValue) {
    var postingVote;
    postingVote = $.post("/vote/v1/votes/" + pollId, {
      option: {
        name: votedValue
      },
      user: {
        id: userId
      }
    });
    postingVote.done(function(data) {
      var $poll, index, player, _i, _len, _ref, _results;
      $("#team-" + data.id).html(votedValue);
      $poll = $("#" + data.id);
      _ref = data.options;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        player = _ref[index];
        if (player.selected === true && userId !== 21) {
          pollsObj[data.id].payout = player.payout;
          _results.push($("#payout-" + data.id).html(player.payout));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    });
    return postingVote.fail(function(jqxhr, status, text) {
      return console.log(jqxhr, status, text);
    });
  };

  updateVotes = function(evt) {
    var currentPoll, pollId;
    pollId = $(evt.target).parent().data("combined-id");
    currentPoll = pollsObj[pollId];
    currentPoll.votedValue = $(evt.target).data("value");
    $(".disabled").removeClass("disabled");
    $(evt.target).addClass("disabled");
    if (currentPoll.votedValue != null) {
      postVote(pollId, currentPoll.votedValue);
    }
    return false;
  };

  authCheck = function() {
    return $.ajax({
      url: "http://esports-fantasy-prd-api-01.las1.colo.ignops.com:8181/auth/v1/users/ignauth/current",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedAuth"
    });
  };

  loadUser = function(userData) {
    return userId = (userData != null ? userData.ProfileId : void 0) ? userData.ProfileId : 21;
  };

  loadPolls = function(pollData, streamId) {
    var poll, polls, _i, _len;
    polls = "";
    if (streamId != null) {
      pollsObj[pollData[0].id] = pollData[0];
      polls = createPoll(pollData[0]);
      getPayouts(pollData[0].id, userId);
    } else {
      for (_i = 0, _len = pollData.length; _i < _len; _i++) {
        poll = pollData[_i];
        pollsObj[poll.id] = poll;
        polls += createPoll(poll);
        getPayouts(poll.id, userId);
      }
    }
    return $("#poll-container").prepend(polls);
  };

  init = function(streamId) {
    var checkingAuth, fetchingPolls;
    checkingAuth = authCheck();
    fetchingPolls = getPolls(streamId);
    checkingAuth.done(function(data) {
      return loadUser(data);
    });
    fetchingPolls.done(function(polls) {
      return loadPolls(polls, streamId);
    });
    return fetchingPolls.fail(function(jqxhr, status, text) {
      return console.log(jqxhr, status, text);
    });
  };

  streamKeys = [];

  currentStreams = {};

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
    $("head").append("<link rel='stylesheet' href='http://media.ign.com/ev/esports/ipl-static/ipl-retina/stylesheets/widget.css'>");
    $("#coverStoriesContainer .evo-wrapper").append("<div class='evo-coverStories'><div class='carousel'><div class='storyUnit wide index-0 active'><div class='cvr-main'><div id='IGNPlayerContainer'></div></div><div id='poll-container' class='cvr-highlights'></div></div></div></div>");
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
      tabs += "<a href='http://www.ign.com/ipl/" + franchiseSlug + "'class='tab " + franchiseSlug + " " + first + "'><span class='text' data-franchise='" + franchiseSlug + "' >" + currentStreams[franchiseSlug].franchise.name + "</span><span class='fuse'><span></span></span></a>";
    }
    tabs += "</div>";
    $(".evo-coverStories").prepend(tabs);
    franchiseSlug = readCookie("ipl5selectedstream") ? readCookie("ipl5selectedstream") : "league-of-legends";
    $(".fuseNav ." + franchiseSlug).addClass("active");
    IGNId = "";
    _ref = currentStreams[franchiseSlug].providers;
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      provider = _ref[_j];
      if (provider.name === "ign") {
        IGNId = provider.id;
      }
    }
    loadVideo(IGNId);
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

  loadVideo = function(IGNId) {
    var gettingVideos;
    $('#IGNPlayer').replaceWith("<div id='IGNPlayerContainer'></div>");
    gettingVideos = $.ajax({
      url: "http://widgets.ign.com/video/embed/content.jsonp?id=" + IGNId + "&autoplay=true&callback=getCachedVideo",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedVideo"
    });
    return gettingVideos.done(function(data) {
      return $("body").append(data);
    });
  };

  getStreams();

  $("body").on("click", "#poll-container .label i", function(evt) {
    evt.preventDefault();
    if (!$(evt.target).hasClass("disabled")) {
      return updateVotes(evt);
    }
  });

  $("body").on("click", ".signin", function(evt) {
    var gettingLogin;
    evt.preventDefault();
    gettingLogin = $.ajax({
      url: "http://widgets.ign.com/social/shared/registration/signin.jsonp?r=${encodeURIComponent(document.location.href)}&callback=?",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedLogin"
    });
    return gettingLogin.done(function(registration) {
      return $("body").append(registration);
    });
  });

  $("body").on("click", ".tab", function(evt) {
    var IGNId, franchiseSlug, provider, _i, _len, _ref;
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
    loadVideo(IGNId);
    $("#poll-container").find(".results").fadeOut("slow", function() {
      return $(this).remove();
    });
    $(".tab").removeClass("active");
    $(this).addClass("active");
    return init(currentStreams[franchiseSlug].id);
  });

}).call(this);
