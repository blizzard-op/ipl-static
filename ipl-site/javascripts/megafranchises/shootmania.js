function loadNews(){
  return $.getJSON('http://pipes.yahoo.com/pipes/pipe.run?_id=1e282989bc7aab5a61a23d0e7e4758a8&_render=json&_callback=?');
}

  setQueryParams = function(startIndex) {
    params = {
      "matchRule": "matchAll",
      "count": 30,
      "startIndex": 0,
      "networks": "ign",
      "states": "published",
      "sortBy": "metadata.publishDate",
      "sortOrder": "desc",
      "rules":
      [
        {
          "field": "tags.slug",
          "condition": "containsOne",
          "value": "shootmania"
        },
        {
          "field": "categories.slug",
          "condition": "containsOne",
          "value": "ipl"
        }, {
          "field": "metadata.articleType",
          "condition": "is",
          "value": "article"
        }
      ]
    };
    return JSON.stringify(params);
  };

  loadSMArticle = function() {
    var params = setQueryParams();
    var addLeadingZero = function(num) {
      if (num < 10) {
        return "0" + num;
      } else {
        return num;
      }
    };
    var fetchingNews = loadNews();
    fetchingAritcle = $.ajax({
      url: "http://apis.ign.com/article/v3/articles/search?q=" + params + "&format=js",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedArticles"
    });
    fetchingAritcle.done(function(article) {

      var curItem = article.data[0];

      var imgHTML = "";
      var promo = curItem.promo;
      var promoImageUrl, articleLink = "http://www.ign.com/ipl/all/news/" + curItem.metadata.slug;
      for (var i = promo.promoImages.length - 1; i >= 0; i--) {
        if (promo.promoImages[i].imageType === "small") {
          promoImageUrl = promo.promoImages[i].url;
        }
      }
      if (promoImageUrl) {
        imgHTML = "<img src='" + promoImageUrl + "' alt='" + promo.title + "' />";
      }
      $('#articleBox .content').append(imgHTML + '<article><h1><a href=' + articleLink + '>' + promo.title + '</a></h1><p>' + promo.summary + '  <a class="moreLink" href=' + articleLink +'>Read More</a></p></article>');
    });
    $.when(fetchingNews, fetchingAritcle).done(function(smArticle, iplArticle){
      for (var i = smArticle[0].value.items.length - 1; i >= 0; i--) {
        var article = smArticle[0].value.items[i];
        var pub = article["y:published"];
        article.metadata = {};
        article.metadata.publishDate = pub.year + "-" + addLeadingZero(pub.month) + "-" + addLeadingZero(pub.day) + "T" + addLeadingZero(pub.hour) + ":" + addLeadingZero(pub.minute) + ":" + addLeadingZero(pub.second) + "+0000";
      }
      var combinedFeeds = smArticle[0].value.items.concat(iplArticle[0].data);
      var sortedArray = _.sortBy(combinedFeeds, function(item){ return item.metadata.publishDate; });
      var listHTML = "";
      var promoImg = "";
      var promoSum = "";
      for (var j = sortedArray.length - 1; j >= sortedArray.length-5; j--) {
        var curItem = sortedArray[j];
        promoImg = "";
        promoSum = "";
        if(curItem.promo!=null && curItem.promo.promoImages[0]){
          promoImg = curItem.promo.promoImages[0].url
        }
        if (curItem.promo != null)
          promoSum = curItem.promo.summary
        if (curItem.comments) {
          //listHTML += '<li><a href="' + curItem.link + '">' + curItem.title + '</a></li>';
          listHTML += '<li class="clearfix"><div class="img-holder"><img src="'+ 'http://media.ign.com/ev/esports/ipl-static/ipl-site/images/shootmania/sm'+(Math.round(Math.random()*5)+1)+'.jpg' +'"></div><article><a href="' + curItem.link + '"><h1>' + curItem.title + '</h1></a><p>'+curItem.description.split(/&#8230;/)[0]+'</p><a class="moreLink" href="' + curItem.link +'">Read More</a></article></li>';
          
        } else {
          curItem.link = "http://www.ign.com/ipl/all/news/" + curItem.metadata.slug;
          if(promoImg!=""&&promoImg!=null)
            listHTML += '<li class="clearfix"><div class="img-holder"><img src="'+ promoImg +'"></div><article><a href="' + curItem.link + '"><h1>' + curItem.promo.title + '</h1></a><p>'+promoSum+'</p><a class="moreLink" href=' + curItem.link +'>Read More</a></article></li>';
          else
            listHTML += '<li class="clearfix"><div class="img-holder"><img src="'+ promoImg +'"></div><article><a href="' + curItem.link + '"><h1>' + curItem.promo.title + '</h1></a><p>'+promoSum+'</p><a class="moreLink" href=' + curItem.link +'>Read More</a></article></li>';
            //listHTML += '<li><article><a href="' + curItem.link + '">' + curItem.promo.title + '</a><a class="moreLink" href=' + curItem.link +'>Read More</a></p></article></li>';
          //<article><h1><a href=' + articleLink + '>' + promo.title + '</a></h1><p>' + promo.summary + '  <a class="moreLink" href=' + articleLink +'>Read More</a></p></article>
        }
      }
      $('#articles-list').append(listHTML);
    });
  };

//get youtube videos
function getYTVideos(orderBy){

  //load
  var shootmaniaFeed = $.getJSON('http://gdata.youtube.com/feeds/api/users/maniaplanet/uploads?alt=json&orderby=' + orderBy + '&fields=entry/id,entry/title,entry/content,entry/published&max-results=4&callback=?');
  var iplshootmaniaFeed = $.getJSON('http://gdata.youtube.com/feeds/api/users/iplshootmania/uploads?alt=json&orderby=' + orderBy + '&fields=entry/id,entry/title,entry/content,entry/published&max-results=4&callback=?');

  $.when(shootmaniaFeed, iplshootmaniaFeed).done(function(smFeedData, iplFeedData) {
    var json = smFeedData[0].feed.entry.concat(iplFeedData[0].feed.entry);
    var sortedArray = json;
    if (orderBy === "published") {
      sortedArray = _.sortBy(json, function(item){ return item.published.$t; }).reverse();
    }
    sortedArray.length = 4;
    var replaceVideoId = function(video){
      var videoId = video.id.$t;
      videoId = videoId.replace("http://gdata.youtube.com/feeds/api/videos/","");
      return videoId;
    };
    var videoListHTML = '';
    $.each(sortedArray, function(index, value) {
      var videoId = replaceVideoId(value);
      videoListHTML += '<li><a href="http://www.youtube.com/watch?v='+videoId+'"><img src="http://img.youtube.com/vi/' + videoId + '/mqdefault.jpg"></li>';
    });
    $("#video-list").append(videoListHTML);
  });
}

function loadFb(){
  $('<iframe src="//www.facebook.com/plugins/likebox.php?href=http%3A%2F%2Fwww.facebook.com%2FShootMania&amp;width=296&amp;height=395&amp;colorscheme=light&amp;show_faces=false&amp;border_color&amp;stream=true&amp;header=false" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:300px; height:395px;" allowtransparency="true"></iframe>').appendTo('#facebook-widget')
}

loadNews();
loadFb();
loadSMArticle();
getYTVideos("published");