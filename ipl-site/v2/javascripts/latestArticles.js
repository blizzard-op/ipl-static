// Generated by CoffeeScript 1.4.0
(function() {
  var loadHeadlines;

  loadHeadlines = function(per_page) {
    var fetchingHeadlines, params, queryParams, source, tmpl;
    if (per_page == null) {
      per_page = 5;
    }
    if (!$("#latest_articles_template").length) {
      return;
    }
    source = $("#latest_articles_template").html();
    tmpl = Handlebars.compile(source);
    queryParams = {
      franchise: franchise,
      per_page: per_page
    };
    params = articleLoader.setQueryParams(queryParams);
    fetchingHeadlines = $.ajax({
      url: "http://apis.ign.com/article/v3/articles/search?q=" + params + "&format=js",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedHeadlines"
    });
    return fetchingHeadlines.done(function(headlines) {
      return $("#latest_articles").append(tmpl(headlines.data));
    });
  };

  loadHeadlines();

}).call(this);
