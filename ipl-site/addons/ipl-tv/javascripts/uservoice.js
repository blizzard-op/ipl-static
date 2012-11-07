/*********** User Voice *************/
var uvOptions = {
  /* required */
  key: 'ign',
  host: 'ign.uservoice.com',
  forum: 101861,
  showTab: false, /* optional */
  lang: 'en'
};

(function() {
  var uv = document.createElement('script'); uv.type = 'text/javascript'; uv.async = true;
  uv.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'widget.uservoice.com/oaSMgbBt6CxMRIJgotI74g.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(uv, s);
})();
/************ /User Voice **************/