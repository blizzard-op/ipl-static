/*********** User Voice *************/
var uservoiceOptions = {
  /* required */
  key: 'ign',
  host: 'ign.uservoice.com',
  forum: 101861,
  showTab: true, /* optional */
  alignment: 'right',
  background_color:'#b21b00',
  text_color: 'white',
  hover_color: '#000',
  lang: 'en'
};
function _loadUserVoice() {
  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', ("https:" == document.location.protocol ? "https://" : "http://") + "cdn.uservoice.com/javascripts/widgets/tab.js");
  document.getElementsByTagName('head')[0].appendChild(s);
}
_loadSuper = window.onload;
window.onload = (typeof window.onload != 'function') ? _loadUserVoice : function() { _loadSuper(); _loadUserVoice(); };
/************ /User Voice **************/