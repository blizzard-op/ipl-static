$(function() {
	$.ajax({
	  url: "http://esports.ign.com/content/v2/groups",
	  dataType: "jsonp",
	  cache: true
	})
	.done(function(data) {
		var compiled = _.template($('#topbar_nav_template').html());
		var h = '';
		for(var i = 0, len = data.length; i < len; i++) {
			h += compiled(data[i]);
		}
		$('#IGN_topbar_nav').html(h);
	});
});