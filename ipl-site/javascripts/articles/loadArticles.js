// Generated by CoffeeScript 1.3.3
(function() {
  var addLeadingZero, createPaginationList, loadAllArticles, loadArticle, loadHeadlines, replaceIframe, replaceYoutube, setQueryParams;

  Handlebars.registerHelper('filteredContent', function() {
    var text;
    text = "<p>" + this.content[0].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\n(\s+)?\n/g, "</p><p>") + "</p>";
    text = text.replace(/<p>(\s+)?<\/p>/g, "");
    text = replaceIframe(text);
    text = replaceYoutube(text);
    return new Handlebars.SafeString(text);
  });

  Handlebars.registerHelper('filteredSummary', function() {
    var text;
    text = this.promo.summary.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    return new Handlebars.SafeString(text);
  });

  Handlebars.registerHelper('url', function() {
    var articleLink;
    articleLink = "/ipl/all/news/" + this.metadata.slug;
    return new Handlebars.SafeString(articleLink);
  });

  Handlebars.registerHelper('formattedDate', function() {
    return moment(this.metadata.publishDate).format("MMMM Do, YYYY");
  });

  Handlebars.registerHelper('ago', function() {
    return moment(this.metadata.publishDate).fromNow();
  });

  replaceIframe = function(text) {
    var isSplurgy, params, query, re, splurgyID, splurgySPlit, src, srcHeight, srcWidth;
    re = /\[widget path=\"global\/article\/iframe\".+?\]/g;
    if (text.match(re) !== null) {
      params = text.split("parameters=\"");
      query = params[params.length - 1];
      src = query.match(/(src=)([\w:\/\/\.%]+)/);
      srcWidth = query.match(/(width=)([\w:\/\/\.%]+)/);
      srcHeight = query.match(/(height=)([\w:\/\/\.%]+)/);
      isSplurgy = src[2].match(/http:\/\/esports.ign.com\/splurgy/);
      if (isSplurgy !== null) {
        splurgySPlit = src[2].split("/");
        splurgyID = splurgySPlit[splurgySPlit.length - 1];
        text = "<!-- Splurgy Registration start - should only appear once! --><script type=\"text/javascript\">\n(function(id) {var jsSrc=\"//zen.splurgi.com/all-3.js\";var js;if(document.getElementById(id)){return;}js=document.createElement('script');js.id= id;js.type=\"text/javascript\";js.src = jsSrc;js.async = true;(document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(js);}('splurgy-embed-js'));\nwindow._splurgy_config = window._splurgy_config || []\nwindow._splurgy_config.push({\n    // find this token in your admin dashboard where you got this snippet\n    token: \"" + splurgyID + "\"\n});\n</script><!-- Splurgy Registration end -->\n<!-- start Splurgy Embed widget --><script type=\"text/javascript\">\nwindow._splurgy_frames = window._splurgy_frames || [];\nwindow._splurgy_frames.push({\n    offer_id: null, // set this value to a specific offer ID to hard code what is shown\n    test_mode: false // set to true to enable diagnostic mode\n}); // this embed will expand into the area containing it\n</script><div class=\"splurgy-frame-un\"></div><!-- end Splurgy Embed widget -->";
        return text;
      }
      if (srcHeight === null || !(srcHeight[2] != null)) {
        srcHeight = [];
        srcHeight[2] = "371px";
      }
      if (srcWidth === null || !(srcWidth[2] != null)) {
        srcWidth = [];
        srcWidth[2] = "610px";
      }
      text = text.replace(re, '<iframe allowtransparency="true" src="' + src[2] + '" frameborder="0" style="width:' + srcWidth[2] + '; height:' + srcHeight[2] + '; border:none;" scrolling="no"></iframe>');
    }
    return text;
  };

  replaceYoutube = function(text) {
    var item, matchArray, modifiedItem, videoRegex, youtubeRegex, ytId, _i, _len;
    youtubeRegex = /(\[youtube clip_id=\")(.+?)(\"\])/g;
    matchArray = text.match(youtubeRegex);
    if (matchArray != null ? matchArray.length : void 0) {
      for (_i = 0, _len = matchArray.length; _i < _len; _i++) {
        item = matchArray[_i];
        modifiedItem = item.replace("[", "\\[").replace("]", "\\]").replace('"', '\\"').replace("'", "\\'");
        videoRegex = new RegExp(modifiedItem);
        ytId = item.split('="')[1].split('"]')[0];
        text = text.replace(videoRegex, '<iframe width="610" height="371" src="http://www.youtube.com/embed/' + ytId + '?&amp;hl=en_US" frameborder="0" allowfullscreen></iframe>');
      }
    }
    return text;
  };

  createPaginationList = function(obj, page, per_page, pageLimit) {
    var pageCounter, pageEnd, pageStart, pages, paginationHTML;
    pages = Math.ceil(obj.total / per_page);
    page = parseInt(page, 10);
    paginationHTML = "<nav class='pagination'>";
    if (page !== 1) {
      paginationHTML += "<span clas='first'><a href='/ipl/all/news'>First</a></span><span class='prev'><a href='?page=" + (page - 1) + "'>Prev</a></span>";
    }
    pageStart = page - parseInt(pageLimit / 2) - 1 < 1 ? 1 : page - parseInt(pageLimit / 2) - 1;
    pageEnd = pageStart + pageLimit;
    pageCounter = pageEnd <= pages ? pageStart : pages - pageLimit;
    pageEnd = pageEnd > pages ? pages : pageEnd;
    console.log(pageEnd - pageCounter);
    while (pageCounter <= pageEnd) {
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
  };

  setQueryParams = function(queryParams) {
    var fromDate, params, startIndex, toDate;
    if (queryParams.toDate == null) {
      toDate = (new Date).toISOString();
    }
    if (queryParams.fromDate == null) {
      fromDate = "2011-01-01T00:00:00+0000";
    }
    startIndex = (queryParams.page - 1) * queryParams.per_page;
    params = {
      "matchRule": "matchAll",
      "count": parseInt(queryParams.per_page, 10),
      "startIndex": parseInt(startIndex, 10),
      "networks": "ign",
      "states": "published",
      "sortBy": "metadata.publishDate",
      "sortOrder": "desc",
      "fromDate": fromDate,
      "toDate": toDate,
      "rules": [
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
    if (queryParams.franchise && queryParams.franchise !== "all") {
      params.rules.push({
        "field": "tags",
        "condition": "containsOne",
        "value": queryParams.franchise
      });
    }
    return JSON.stringify(params);
  };

  addLeadingZero = function(num) {
    if (num < 10) {
      return "0" + num;
    } else {
      return num;
    }
  };

  loadAllArticles = function(page, per_page, franchise) {
    var fetchingAllAritcles, params, queryParams;
    if (page == null) {
      page = 1;
    }
    if (per_page == null) {
      per_page = 10;
    }
    if (franchise == null) {
      franchise = "all";
    }
    queryParams = {
      page: page,
      per_page: per_page,
      franchise: franchise
    };
    params = setQueryParams(queryParams);
    fetchingAllAritcles = $.ajax({
      url: "http://apis.ign.com/article/v3/articles/search?q=" + params + "&format=js",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedArticles"
    });
    return fetchingAllAritcles.done(function(articleFeed) {
      var $posts, source, tmpl;
      $posts = $("#posts");
      source = $("#article-list").html();
      tmpl = Handlebars.compile(source);
      $posts.find("ul").html(tmpl(articleFeed.data));
      return $posts.append(createPaginationList(articleFeed, page, per_page, 15));
    });
  };

  loadArticle = function(slug) {
    var fetchingArticle;
    fetchingArticle = $.ajax({
      url: "http://apis.ign.com/article/v3/articles/slug/" + slug + "?format=js",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedArticle"
    });
    return fetchingArticle.done(function(article) {
      var articleID, gettingOldArticle, source, tmpl;
      articleID = article.articleId;
      source = $("#article-show").html();
      tmpl = Handlebars.compile(source);
      $("#posts").prepend(tmpl(article));
      $("title").html(article.metadata.headline + " | IPL - IGN Pro League");
      if (new Date(article.metadata.publishDate) < new Date(2012, 8, 1)) {
        gettingOldArticle = $.ajax({
          url: "http://esports.ign.com/posts/" + slug + ".json",
          dataType: "jsonp",
          cache: true,
          jsonpCallback: "getCachedOldArticle"
        });
        gettingOldArticle.done(function(oldArticleData) {
          if ((oldArticleData != null) && (oldArticleData.id != null)) {
            return articleID = oldArticleData.id;
          }
        });
      }
      return disqus.loadComments(articleID, article.metadata.slug);
    });
  };

  loadHeadlines = function(franchise, per_page) {
    var fetchingHeadlines, params, queryParams;
    if (per_page == null) {
      per_page = 5;
    }
    queryParams = {
      franchise: franchise,
      per_page: per_page
    };
    params = setQueryParams(queryParams);
    fetchingHeadlines = $.ajax({
      url: "http://apis.ign.com/article/v3/articles/search?q=" + params + "&format=js",
      dataType: "jsonp",
      cache: true,
      jsonpCallback: "getCachedHeadlines"
    });
    return fetchingHeadlines.done(function(headlines) {
      var source, tmpl;
      source = $("#headline-list").html();
      tmpl = Handlebars.compile(source);
      return $("#headlines").html(tmpl(headlines.data));
    });
  };

  window.articleLoader = {
    loadAllArticles: loadAllArticles,
    loadArticle: loadArticle,
    loadHeadlines: loadHeadlines
  };

}).call(this);
