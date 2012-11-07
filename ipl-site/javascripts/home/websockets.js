var jug = new Juggernaut({
  secure: ('https:' == document.location.protocol),
  host: "ipl-juggernaut.herokuapp.com",
  port: document.location.port || 80
});
jug.on("connect", function(){
	console.log("connection open");
});
jug.subscribe("tv", function(data){
	try {
		JSON.parse(data);
		var jsonedData = JSON.parse(data);
		if (jsonedData.service) {
			$channel = $("#" + jsonedData._id);
			if (jsonedData.status === "off air") {
				$channel.fadeOut(300, function(){
					$(this).remove();
				});
			}
			if ($channel.length > 0 && jsonedData.description !== $channel.find("a").text()) {
				$channel.fadeOut(300, function(){
					$(this).find("a").text(jsonedData.description);
					$(this).fadeIn(300);
				});
			}
			if ($channel.length === 0 && jsonedData.status === "on air") {
				var html = "<li style='display:none' id ='" + jsonedData._id + "'><a href='http://www.ign.com/ipl/tv?screens=" + jsonedData.slug + "(twitch)'>" + jsonedData.description +"</a></li>";
				$("#streamContainer").append(html);
				$("#" + jsonedData._id).fadeIn(300);
			}
		}
	}
	catch(err) {
		console.log("not a valid json object");
	}
});