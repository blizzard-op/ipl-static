contentLoader = {
  init: function(franchiseSlug) {
    if($("#player-wrapper").not(".promo").length) {
      this.fetchLiveChannels(franchiseSlug);
    }
    
    comscoreEvent.fireVideoAndPageView();
    contentLoader.loadFooter();

    if ($(".afg-table")){
      this.photoPagination($(".afg-table"));
    }
    if ($("#headlines").length) {
      articleLoader.loadHeadlines(franchiseSlug);
    }
  },
  fetchUrl: function(type) {
    return $.ajax({
      url: "http://esports.ign.com/" + type + ".json",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCached" + type
    });
  },
  fetchFranchises: function(){
    fetchingFranchises = this.fetchUrl("franchises");
    fetchingFranchises.done(function(data) {
      var source = $("#tournament-nav").html();
      var template = Handlebars.compile(source);
      $("#tournamentNav").append(template(data));
    });
  },
  loadMainVod: function(franchiseSlug) {
    var videoFranchise = franchiseSlug;
    if (videoFranchise === 'starcraft-2') {
      videoProperties = {
          id: "EKUP8FcsoUM",
          slug: "ipl4-in-two-minutes",
          show: "IPL4 in two minutes",
          show_slug: "ipl-4-starcraft-2",
          match_name: "",
          franchise: "starcraft-2",
          match_slug: "ipl4-in-two-minutes"
        };
    } else if(videoFranchise === "dead-or-alive-5") {
      videoProperties = {
        id: "y_Oz6w-uihk",
        slug: "jann-lee-vs-hayate-number-2-doa5-august-build",
        show: "12 Days of DOA5",
        show_slug: "12-days-of-doa5",
        match_name: "Jann Lee vs Hayate #1 DOA5 August Build",
        franchise: "dead-or-alive-5"
      };
    } else if (videoFranchise === "shootmania") {
      videoProperties = {
        id: "kyb31D_KvjM",
        slug: "shootmania-ign-pro-leagues-first-person-shooter-debut",
        show: "Shootmania",
        show_slug: "shootmania",
        match_name: "Shootmania - IGN Pro League's First Person Shooter Debut",
        franchise: "shootmania"
      };
    } else {
      videoProperties = {
          id: "4GBRqe9IAds",
          slug: "top-5-plays-lol-ep-5",
          show: "IPL Top 5 Plays",
          show_slug: "ipl-top-5-plays-lol",
          match_name: "",
          franchise: "league-of-legends"
        };
    }
    youtube.HTML(videoProperties.id, "ytplayer");
    if ($("#description").find("h4").length && videoProperties.show) {
      $("#description").find("h4").text(videoProperties.show);
    }
    if (_gaq && videoProperties.franchise && videoProperties.slug) {
      _gaq.push(['_trackEvent', 'Video Play', videoProperties.franchise, videoProperties.slug]);
    }
  },
  playerLoaded: function(exception) {
    var $player = $("#live_embed_player_flash");
    if (_gaq && $player.data('slug') && $player.data('description')) {
      _gaq.push(['_trackEvent', 'Live Play', $player.data('slug'), $player.data('description')]);
    }
  },
  scrollTo: function(element) {
    $("body").scrollTo("#" + element);
  },
  photoPagination: function($el){
    if ($el.length) {
      $el.attr("id", "afg-table");
      $("#photo-holder").jPages({
          containerID : "afg-table",
          perPage: 5
      });
    }
  },
  fetchLiveChannels: function(franchiseSlug){
    var gettingChannels = this.fetchUrl("live_channels");
    gettingChannels.done(function(data){
      contentLoader.loadPlayer(data, franchiseSlug);
    });
  },
  loadPlayer: function(data, franchiseSlug){
    var source = $("#video-player").html();
    var template = Handlebars.compile(source);
    var descriptionSource = $("#description-content").html();
    var descriptionTemplate = Handlebars.compile(descriptionSource);
    var updateHeroUnit = function(currentChannel) {
      $("#player-wrapper").append(template(currentChannel));
      $("#description").append(descriptionTemplate(currentChannel));
      sharing.loadTwitter();
      sharing.loadFacebook();
    };
    if(franchiseSlug === "all") {
      for (var k = data.length - 1; k >= 0; k--) {
        if (data[k].name === "ipllol" ) {
          updateHeroUnit(data[k]);
          return;
        }
      }
    } else {
      for (var i = data.length - 1; i >= 0; i--) {
        if (franchiseSlug === "league-of-legends" && data[i].name === "ipllol" ) {
          updateHeroUnit(data[i]);
          return;
        } else if (franchiseSlug === "starcraft-2" && data[i].name === "ignproleague" ) {
          updateHeroUnit(data[i]);
          return;
        } else if (franchiseSlug === "dead-or-alive-5" && data[i].name === "iplfighters" ) {
          updateHeroUnit(data[i]);
          return;
        } else if (franchiseSlug === "shootmania" && data[i].name === "iplshootmania" ) {
          updateHeroUnit(data[i]);
          return;
        }
      }
    }
    this.loadMainVod(franchiseSlug);
  },
  loadFooter: function(){
    var fetchFooter = $.ajax({
      url: "http://widgets.ign.com/global/page/footer.jsonp?theme=proleague",
      dataType: 'jsonp',
      cache: true,
      jsonpCallback: 'getCachedFooter'
    });
    fetchFooter.success(function(data){
      $("body").append(data);
    });
  }
};
$("body").on('click', ".outbound-link", function(e){
  googleAnalyticsEvent.recordOutboundLink( e, this );
});
$("#match-list").on('click', ".hide", function(e){
  e.preventDefault();
  $("#match-list").toggleClass("offscreen");
});
$("#channels-previews-content").on('submit', ".search", function(e){
  e.preventDefault();
  var channel = $(this).data("channel"),
      query = $(this).find("input").val();
  youtube.search(query, channel, this);
});
$("#channel-previews-list").on('click', ".clear-search", function(e){
  var franchise = $(this).data("franchise"),
    $channelContainer = $("#channel-preview-" + franchise);
  $channelContainer.find(".search-results").fadeOut(300, function(){
    $channelContainer.find(".videos-list").fadeIn(300);
  });
});
$("#description").on("click", "#chat", function(e){
  e.preventDefault();
  var url = $(this).attr("href");
  window.open(url, '','width=425,height=600');
});