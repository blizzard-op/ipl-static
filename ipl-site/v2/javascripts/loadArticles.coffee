Handlebars.registerHelper 'filteredContent', ->
  text = "<p>" + this.content[0].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\n(\s+)?\n/g, "</p><p>") + "</p>"
  text = text.replace /<p>(\s+)?<\/p>/g, ""
  text = replaceIframe text
  text = replaceYoutube text
  new Handlebars.SafeString text

Handlebars.registerHelper 'filteredSummary', ->
  text = this.promo.summary.replace(/&lt;/g, "<").replace /&gt;/g, ">"
  new Handlebars.SafeString text

Handlebars.registerHelper 'url', ->
  articleLink = "/ipl/all/news/" + this.metadata.slug
  new Handlebars.SafeString articleLink

Handlebars.registerHelper 'formattedDate', ->
  moment(this.metadata.publishDate).format("MMMM Do, YYYY")

Handlebars.registerHelper 'ago', ->
  moment(this.metadata.publishDate).fromNow()

replaceIframe = (text)->
  re = /\[widget path=\"global\/article\/iframe\".+?\]/g
  if text.match(re) isnt null
    params = text.split "parameters=\""
    query = params[params.length-1]
    src = query.match /(src=)([\w:\/\/\.%]+)/
    srcWidth = query.match /(width=)([\w:\/\/\.%]+)/
    srcHeight = query.match /(height=)([\w:\/\/\.%]+)/
    isSplurgy = src[2].match /http:\/\/esports.ign.com\/splurgy/
    if isSplurgy isnt null
      splurgySPlit = src[2].split("/")
      splurgyID = splurgySPlit[splurgySPlit.length-1]
      text = """
<!-- Splurgy Registration start - should only appear once! --><script type="text/javascript">
(function(id) {var jsSrc="//zen.splurgi.com/all-3.js";var js;if(document.getElementById(id)){return;}js=document.createElement('script');js.id= id;js.type="text/javascript";js.src = jsSrc;js.async = true;(document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(js);}('splurgy-embed-js'));
window._splurgy_config = window._splurgy_config || []
window._splurgy_config.push({
    // find this token in your admin dashboard where you got this snippet
    token: "#{splurgyID}"
});
</script><!-- Splurgy Registration end -->
<!-- start Splurgy Embed widget --><script type="text/javascript">
window._splurgy_frames = window._splurgy_frames || [];
window._splurgy_frames.push({
    offer_id: null, // set this value to a specific offer ID to hard code what is shown
    test_mode: false // set to true to enable diagnostic mode
}); // this embed will expand into the area containing it
</script><div class="splurgy-frame-un"></div><!-- end Splurgy Embed widget -->
"""
      return text
    if srcHeight is null || !srcHeight[2]?
      srcHeight = []
      srcHeight[2] = "371px"
    if srcWidth is null || !srcWidth[2]?
      srcWidth = []
      srcWidth[2] = "610px"

    text = text.replace re, '<iframe allowtransparency="true" src="' + src[2] + '" frameborder="0" style="width:' + srcWidth[2] + '; height:' + srcHeight[2] + '; border:none;" scrolling="no"></iframe>'
  text

replaceYoutube = (text)->
  youtubeRegex = /(\[youtube clip_id=\")(.+?)(\"\])/g
  matchArray = text.match(youtubeRegex)
  if matchArray?.length
    for item in matchArray
      modifiedItem = item.replace("[", "\\[").replace("]", "\\]").replace('"', '\\"').replace("'", "\\'")
      videoRegex = new RegExp modifiedItem
      ytId = item.split('="')[1].split('"]')[0]
      text = text.replace videoRegex, '<iframe width="610" height="371" src="http://www.youtube.com/embed/' + ytId + '?&amp;hl=en_US" frameborder="0" allowfullscreen></iframe>'
  text


createPaginationList = (obj, page, per_page, pageLimit)->
  pages = Math.ceil(obj.total/per_page)
  page = parseInt(page, 10)
  paginationHTML = "<nav class='pagination'>"
  paginationHTML += "<span clas='pagination_page first'><a href='/ipl/all/news'>First</a></span><span class='pagination_page prev'><a href='?page=" + (page - 1) + "'>Prev</a></span>" unless page is 1
  pageStart = if page-parseInt(pageLimit/2)-1<1 then 1 else page-parseInt(pageLimit/2)-1
  pageEnd = pageStart + pageLimit
  pageCounter = if pageEnd <= pages then pageStart else pages - pageLimit
  pageEnd = if pageEnd > pages then pages else pageEnd

  while pageCounter <= pageEnd
    if pageCounter is page
      paginationHTML += "<span class='pagination_page current'>" + pageCounter + "</span>"
    else
      paginationHTML += "<span class='pagination_page'><a href='?page=" + pageCounter + "'>" + pageCounter + "</a></span>"
    pageCounter += 1
  paginationHTML += "<span class='pagination_page next'><a href='?page=" + (page + 1) + "'>Next</a></span><span class='pagination_page last'><a href='?page=" + pages + "'>Last</a></span>" unless page is pages

  paginationHTML += "</nav>"

setQueryParams = (queryParams)->
  unless queryParams.toDate?
    toDate = (new Date).toISOString()
  unless queryParams.fromDate?
    fromDate = "2011-01-01T00:00:00+0000"
  startIndex = (queryParams.page - 1) * queryParams.per_page

  params =
    "matchRule": "matchAll"
    "count": parseInt(queryParams.per_page, 10)
    "startIndex": parseInt(startIndex, 10)
    "networks":"ign"
    "states":"published"
    "sortBy":"metadata.publishDate"
    "sortOrder": "desc"
    "fromDate": fromDate
    "toDate": toDate
    "rules": [
        "field":"categories.slug"
        "condition":"containsOne"
        "value":"ipl"
      ,
        "field":"metadata.articleType"
        "condition":"is"
        "value":"article"
    ]
  if queryParams.franchise and queryParams.franchise isnt "all"
    params.rules.push 
      "field": "tags" 
      "condition": "containsOne"
      "value": queryParams.franchise

  if queryParams.tag?
    params.rules.push 
      "field": "tags"
      "condition": "containsOne"
      "value": queryParams.tag

  JSON.stringify(params)

addLeadingZero = (num)->
  if num < 10 then "0" + num else num

loadAllArticles = (page = 1, per_page = 10, franchise = "all")->
  queryParams =
    page: page
    per_page: per_page
    franchise: franchise
  params = setQueryParams(queryParams)
  fetchingAllAritcles = $.ajax 
    url: "http://apis.ign.com/article/v3/articles/search?q=" + params + "&format=js"
    dataType: "jsonp"
    cache: true
    jsonpCallback: "getCachedArticles"

  fetchingAllAritcles.done (articleFeed)-> 
    $posts = $("#posts")
    source = $("#article-list").html()
    tmpl = Handlebars.compile source
    $posts.find("ul").html tmpl(articleFeed.data)
    $posts.append createPaginationList(articleFeed, page, per_page, 9)

fetchArticles = (params, cb)->
  queryParams =
    page: params.page || 1
    per_page: params.per_page || 10
    franchise: params.franchiseSlug || "all"
    tag: params.tag || null
  params = setQueryParams(queryParams)
  return $.ajax 
    url: "http://apis.ign.com/article/v3/articles/search?q=" + params + "&format=js"
    dataType: "jsonp"
    cache: true
    jsonpCallback: cb


loadArticle = (slug) ->
  fetchingArticle = $.ajax 
    url: "http://apis.ign.com/article/v3/articles/slug/" + slug + "?format=js"
    dataType: "jsonp"
    cache: true
    jsonpCallback: "getCachedArticle"
  fetchingArticle.done (article)->
    articleID = article.articleId
    source = $("#article-show").html()
    tmpl = Handlebars.compile source
    $("#posts").prepend tmpl(article)
    $("title").html(article.metadata.headline + " | IPL - IGN Pro League")
    if new Date(article.metadata.publishDate) < new Date(2012, 8, 1)
      gettingOldArticle = $.ajax 
        url: "http://esports.ign.com/posts/" + slug + ".json"
        dataType: "jsonp"
        cache: true
        jsonpCallback: "getCachedOldArticle"
      gettingOldArticle.done (oldArticleData)->
        if oldArticleData? and oldArticleData.id?
          articleID = oldArticleData.id
    disqus.loadComments(articleID, article.metadata.slug)


window.articleLoader = 
  loadAllArticles: loadAllArticles
  loadArticle: loadArticle
  setQueryParams: setQueryParams
  fetchArticles: fetchArticles