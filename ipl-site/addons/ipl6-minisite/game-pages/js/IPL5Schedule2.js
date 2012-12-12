var Schedule = function(calendarUrl) {
	var daysOfTheWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
	var scheduleData = {};

	var selected = "thursday";

	$("h6").click(function(event) {
		$("h6.selected").removeClass("selected");

		var newlySelected = $(this).addClass("selected").text().toLowerCase();

		if (selected !== newlySelected) {
			$("#" + selected).fadeOut(100);
			$("#" + newlySelected).fadeIn(100);
			selected = newlySelected;
		}
	});

	$.ajax({
		url: calendarUrl,
		cache: false,
		dataType: "jsonp",
		success: function(data) {
			parseData(data);
		},
		error: function(jqXhr, status, text){
			console.log(jqXhr, status, text);
		}
	});

	function formatAMPM(hours) {
		var ampm = hours >= 12 ? 'pm' : 'am';
		var hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		strTime = hours + ':00 ' + ampm;
		return strTime;
	}

	function parseData(data) {
		$.each(data.items, function(key, value) {
			// get start dateTime

			var date = new Date(moment(value.start.dateTime).toDate());
			// get day of the week
			var day = daysOfTheWeek[date.getDay()];

			// get time in AM/PM format
			//var ampm = formatAMPM(date);
			var hour = date.getHours();

			// get match details from the description and split it based on new lines
			var description = value.description;
			var descriptionSplit = description.split("\n");

			// create object for a single event
			var singleEvent = {};

			// initialize schedule data for the current day, create one if needed
			scheduleData[day] = scheduleData[day] || {};

			// initialize hourly events object for the current day, create one if needed
			var hourlyEvents = scheduleData[day] || {};

			// loop through the description and parse the key/values
			for(var i = 0; i < descriptionSplit.length; ++i) {
				// key is the property name
				// value is the data
				var keyValue = descriptionSplit[i].split(": ");
				singleEvent[keyValue[0]] = keyValue[1];
			}

			// if there is already data in the hourly events, then append the event into the array
			if(hourlyEvents[hour]) {
				hourlyEvents[hour][singleEvent["Match Number"]] = singleEvent;
			}
			// if hourly event is empty, then put the new event in an array and insert it into the hourly event object
			else {
				hourlyEvents[hour] = [];
				hourlyEvents[hour][singleEvent["Match Number"]] = singleEvent;
			}

			// update the schedule data with new hourly events
			scheduleData[day] = hourlyEvents;
		});
		renderData(scheduleData);
	}

	function renderData(scheduleData) {
		$.each(scheduleData, function(day, schedule) {

			var sortedHours = [];
			for (var scheduleKey in schedule){
				if (schedule.hasOwnProperty(scheduleKey)) {
					sortedHours.push(scheduleKey);
				}
			}

			for (var i = 0; i < sortedHours.length; i++)
			{
				var k = sortedHours[i];
				//alert(k + ':' + schedule[k]);

				var ul = $(document.createElement('ul'));
				var li = $(document.createElement('li'));

				// create initial p with the time
				var p = $(document.createElement('p')).append(formatAMPM(k));

				li.append(p);
				ul.append(li);

				// loop to create the match info
				$.each(schedule[k], function(key, value) {
					if (value !== undefined) {
						var li = $(document.createElement('li'));

						// create the bracket info
						var p = $(document.createElement('p')).addClass('bracket').append(value.Series);
						li.append(p);

						// create the round info
						p = $(document.createElement('p')).addClass('team').append(value["Subtitle 1"]);
						li.append(p);

						// create the team info
						p = $(document.createElement('p')).addClass('team').append(value["Player 1"] + " vs " + value["Player 2"]);
						li.append(p);

						// create the match number info
						p = $(document.createElement('p')).append("Match #" + value["Match Number"]);
						li.append(p);

						ul.append(li);
					}
				});

				// create div with class 'schedule'
				var div = $(document.createElement('div')).addClass('hourly-schedule').append(ul);

				$("#" + day.toLowerCase()).append(div);
			}
		});
	}
};