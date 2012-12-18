loadHeadlines = (per_page = 5) ->
  return unless $("#latest_articles_template").length
  source = $("#latest_articles_template").html()
  tmpl = Handlebars.compile source
  queryParams = 
    franchise: franchise
    per_page: per_page
  params = articleLoader.setQueryParams(queryParams)
  fetchingHeadlines = $.ajax 
    url: "http://apis.ign.com/article/v3/articles/search?q=" + params + "&format=js"
    dataType: "jsonp"
    cache: true
    jsonpCallback: "getCachedHeadlines"
  fetchingHeadlines.done (headlines)->
    $("#latest_articles").append tmpl headlines.data

loadHeadlines()