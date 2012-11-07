Handlebars.registerHelper('featuredSC2', function() {
  if(this.name === "ignproleague"){
    return true;
  }
});
Handlebars.registerHelper('featuredLoL', function() {
  if(this.name === "ipllol"){
    return true;
  }
});
Handlebars.registerHelper('timeago', function() {
  return moment(this.publish_at).fromNow();
});
youtube = {
  next_video_url: "",
  prev_video_url: "",
  fetchVideos: function(){
    var fetchingVideos = $.ajax({
      url: "http://esports.ign.com/youtube_videos.json?peek=true&group_by_channel=true",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedYoutubeVideos"
    });
    fetchingVideos.done(function(data){
      var videos = data.videos;
      for(var channel in videos) {
        if(videos.hasOwnProperty(channel)){
          var videosSource = $("#video-list").html();
          var videosTemplate = Handlebars.compile(videosSource);
          $("#channel-preview-" + channel).find(".videos-list").append(videosTemplate(videos[channel]));
        }
      }
    });
  },
  fetchChannels: function(){
    var fetchingChannels = $.ajax({
      url: "http://esports.ign.com/youtube_channels.json",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedYoutubeChannels"
    });
    fetchingChannels.done(function(data){
      var source = $("#channel-list").html();
      var template = Handlebars.compile(source);
      $("#channels").append(template(data));


      var videosSource = $("#video-list-container").html();
      var videosTemplate = Handlebars.compile(videosSource);
      $("#channel-previews-list").append(videosTemplate(data));
      youtube.fetchVideos();
    });
  },
  fetchVideo: function(videoSlug){
    var fetchingVideos = $.ajax({
      url: "http://esports.ign.com/youtube_videos/" + videoSlug + ".json",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedYoutubeVideo"
    });
    fetchingVideos.done(function(data){
      var currentVideo = data.video;
      youtube.createHeroVideo(currentVideo);
      document.getElementsByTagName("title")[0].innerHTML = currentVideo.name + " | IPL - IGN Pro League";
      disqus.loadComments(currentVideo.id, currentVideo.video_slug);
      if(currentVideo.related.prev_video_url && currentVideo.related.next_video_url) {
        youtube.createPlaylistBar(currentVideo);
        youtube.next_video_url = currentVideo.related.next_video_url;
        youtube.prev_video_url = currentVideo.related.prev_video_url;
      }
    });
  },
  fetchSeries: function(franchise, series, page, per_page){
    if(page == null) {
      page = 1;
    }
    if(per_page == null) {
      per_page = 10
    }
    var jsonURL = series ? "http://esports.ign.com/shows/" + series + "/youtube_videos.json?peek=true&page=" + page + "&per_page=" + per_page : "http://esports.ign.com/franchises/" + franchise + "/youtube_videos.json?peek=true&page=" + page + "&per_page=" + per_page;
    var fetchingSeriesVideos = $.ajax({
      url: jsonURL,
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedYoutubeVideos"
    });
    fetchingSeriesVideos.done(function(data){
      var currentVideo = data.videos[0].video;
      youtube.createHeroVideo(currentVideo);
      var videosSource = $("#series-video-list").html();
      var videosTemplate = Handlebars.compile(videosSource);
      $(".channel-videos-list").append(videosTemplate(data.videos));
      if (currentVideo.show !== null){
        if (series) {
         document.getElementsByTagName("title")[0].innerHTML = currentVideo.show.name + " | IPL - IGN Pro League";
          $("#video").find("h5").html(currentVideo.show.franchise.name + " videos");
          $("#banner").find("h3").html(currentVideo.show.name);
        } else {
          document.getElementsByTagName("title")[0].innerHTML = currentVideo.show.franchise.name + " | IPL - IGN Pro League";
        }
      }
      if(data.count > per_page) {
        $("#video").append(youtube.createPaginationList(data.count, page, per_page));
      }
      if(currentVideo.related.prev_video_url && currentVideo.related.next_video_url) {
        youtube.createPlaylistBar(currentVideo);
        youtube.next_video_url = currentVideo.related.next_video_url;
        youtube.prev_video_url = currentVideo.related.prev_video_url;
      }
    });
  },
  createHeroVideo: function(video){
    youtube.HTML(video.video_id, "ytplayer");
    var $description = $("#description");
    $description.find(".title").html(video.name);
    $description.find("time").html(moment(video.publish_at).fromNow());
    if(video.yt_channel && video.yt_channel.name) {
      $description.find(".ytSubscribe").replaceWith(sharing.loadYt(video.yt_channel.name));
    }
  },
  createPlaylistBar: function(videoObj) {
    var playlistBar = $("#playlist-bar-template").html();
    var playlistTemplate = Handlebars.compile(playlistBar);
    var $matchList = $("#match-list");
    $matchList.append(playlistTemplate(videoObj));
    $matchList.find(".es-carousel-wrapper").elastislide({
      imageW    : 246,
      margin    : 10,
      current: videoObj.related.related_index-1
    }).find(".es-carousel > ul").addClass("setup");
    $matchList.find("li").eq(videoObj.related.related_index-1).addClass("playing");
  },
  search: function(query, channel) {
    channel = channel || "ignproleague";
    encodedQuery = encodeURIComponent(query);
    var $channelContainer = $("#channel-preview-" + channel), resultsHTML = '';
    if (query !== $channelContainer.find(".search-term").text()){
      var searchUrl = 'http://esports.ign.com/videos.json?q=' + encodedQuery + '&author=' + channel;
      var fetchVideos = $.ajax({
        url: searchUrl,
        cache: true,
        dataType: 'jsonp',
        jsonpCallback: 'getCachedVideos'
      });

      fetchVideos.success(function(data) {
        var title, url, published_at, thumbnail, franchise, show;
        if (data.length) {
          resultsHTML = "<h3 class='heading'>Search Results for '<span class='search-term'>" + query + "</span>'</h3><span class='clear-search' data-franchise='" + channel +"'>x</span><ol class='channel-videos-list'>";
          for (var i = 0; i < data.length; i++) {
            var vid = data[i].video;
            title = vid.name;
            url = vid.url;
            published_at = moment(new Date(vid.publish_at)).fromNow();
            thumbnail = vid.thumbnails[4].thumbnail.url;
            franchise = vid.franchise;
            show = vid.show;
            resultsHTML += "<li>";
            resultsHTML += "<a href='" + url +"' target='blank' title='" + title + "''><span class='video-thumb'><span class='video-thumb-clip'><span class='video-thumb-clip-inner'><img src='" + thumbnail + "' alt='" + title + "'' /></span></span></span></a>";
            resultsHTML += "<h3 class='title'><a href='" + url + "' target='blank' title='" + title + "'>" + title +"</a></h3>";
            if (show && franchise) {
              resultsHTML += "<span><a href='/ipl/" + franchise.slug + "/videos/" + show.slug +"' target='blank' title='" + show.name + "'>" + show.short_name +"</a></span>";
            }
            resultsHTML += "<span>" + published_at +"</span>";
            resultsHTML += "</li>";
          }
          resultsHTML += "</ol>";
        } else {
          resultsHTML = "<h3 class='no-results'>No results found</h3><span class='clear-search' data-franchise='" + channel +"'>x</span>";
        }
      });
      fetchVideos.fail(function(jqXHR, textStatus, errorThrown){
        resultsHTML = "<h3>Something went wrong with your search. <a href='mailto:esports-engineering@ign.com'>Let us know</a> and we'll fix it - IPL Engineering</h3><span class='clear-search' data-franchise='" + channel +"'>x</span>";
      });
      fetchVideos.always(function(){
        $channelContainer.find(".videos-list").fadeOut(500, function(){
          $channelContainer.find(".search-results").html(resultsHTML).fadeIn(500);
        });
      });
    } else if ($channelContainer.find(".videos-list").not(":visible")) {
        $channelContainer.find(".videos-list").fadeOut(500, function(){
          $channelContainer.find(".search-results").fadeIn(500);
        });
    }
  },
  HTML: function(id, container) {
    var params = { allowScriptAccess: "always", allowFullScreen: "true", wmode: "transparent" };
    var atts = { id: "ytplayer" };
    swfobject.embedSWF("http://www.youtube.com/v/" + id + "?wmode=transparent&enablejsapi=1&playerapiid=ytplayer&version=3&autoplay=1", "ytplayer", "100%", "100%", "8", null, null, params, atts);
    //_gaq.push(['_trackEvent', 'Video Play', "#{@video.franchise ? @video.franchise.slug : 'all'}", "#{@video.slug}"]);

  },
  playNext: function(newState){
    if(newState === 0) {
      console.log(youtube.next_video_url);
      if(youtube.next_video_url) {
        window.location = youtube.next_video_url;
      }
    }
  },
  createPaginationList: function(total, page, per_page) {
    var pageCounter, pages, paginationHTML;
    pages = Math.ceil(total / per_page);
    page = parseInt(page, 10);
    paginationHTML = "<nav class='pagination'>";
    if (page !== 1) {
      paginationHTML += "<span clas='first'><a href='/ipl/all/news'>First</a></span><span class='prev'><a href='?page=" + (page - 1) + "'>Prev</a></span>";
    }
    pageCounter = 1;
    while (pageCounter <= pages && pageCounter <= 20) {
      if (pageCounter === page) {
        paginationHTML += "<span class='page current'>" + pageCounter + "</span>";
      } else {
        paginationHTML += "<span class='page'><a href='?page=" + pageCounter + "'>" + pageCounter + "</a></span>";
      }
      pageCounter += 1;
    }
    if (page !== pages) {
      paginationHTML += "<span class='next'><a href='?page=" + (page + 1) + "'>Next</a></span><span class='last'><a href='?page=" + pages + "'>Last</a></span>";
    }
    return paginationHTML += "</nav>";
  }
};

function onYouTubePlayerReady(playerId) {
  ytplayer.addEventListener("onStateChange", "youtube.playNext");
}