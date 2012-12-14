(function(){
  var fetchFooter = $.ajax({
    url: "http://widgets.ign.com/global/page/footer.jsonp?theme=proleague",
    dataType: 'jsonp',
    cache: true,
    jsonpCallback: 'getCachedFooter'
  });
  fetchFooter.done(function(data){
    $(".content").append(data);
  });
})();