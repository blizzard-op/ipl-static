//Retina LivePoll Dashboard

(function($, io, retina) {

	var _socket;
	var _polls = {};
	var _form;
	var _path = retina.sSocket + "/control";
	var _newPollTarget;
	var _oldPollTarget;
	var _optionASCII = 66;
	var _addOptionBefore;
	var _menuOverlay;

	//DOM Ready
	$(function() {

		_form = gebi("livepoll_form");
		var submitPollBtn = gebi("livepoll_btn_submit");

		_newPollTarget = gebi("livepoll_newPollTarget");
		_oldPollTarget = gebi("livepoll_oldPollTarget");
		_addOptionBefore = gebi("livepoll_addOptionBefore");

		var slugInput = gebi("livepoll_slugInput");
		var slugSelect = gebi("livepoll_slugSelect");
		$(slugSelect).change(function() {
			slugInput.value = slugSelect.value;
		});
		slugInput.value = slugSelect.value;

		var addOption_btn = gebi("livepoll_addOptionButton");
		if(addOption_btn) {
			$(addOption_btn).click(function() {
				var letter = nextLetter();
				var tr = ce("tr");
				var th = ce("th","","","Option " + letter.toUpperCase());
				var td = ce("td");
				var div = ce("div","inputWrapper");
				var input = ce("input");
				var span = ce("span","",""," Remove");
				$(span).click(function() {
					$(tr).remove();
				});

				input.setAttribute("type","text");
				input.setAttribute("name", "option_" + letter);

				tr.appendChild(th);
				tr.appendChild(td);
				td.appendChild(div);
				div.appendChild(input);
				td.appendChild(span);

				$(tr).insertBefore(_addOptionBefore);
			});
		}

		if(submitPollBtn) {
			$(submitPollBtn).click(function(e) {
				e.preventDefault();
				formJSONFromForm();
			});
		}

		//Get socket and hook event handlers
		_socket = io.connect(_path);

		_socket.on("startPoll", startPoll);
		_socket.on("endPoll", endPoll);
		_socket.on("deletePoll", deletePoll);
		_socket.on("allPolls", restore);
		_socket.on("newVote", newVote);

		_socket.emit("getPolls");

	});

	function newVote(data) {
		if(!data) return;
		var poll = _polls[data.id];
		if(!poll) return;

		poll.updateOptions(data.options);
	}

	function nextLetter() {
		return String.fromCharCode(++_optionASCII);
	}

	function formJSONFromForm(data) {
		if(!_form) return;

		var returnData = {
			channel: "",
			author: "IPL Team",
			question: "",
			options: [],
			duration: 1
		};

		for(var i = 0; i < _form.elements.length; i++) {
			var field = _form.elements[i];
			var name = field.name;

			if(returnData.hasOwnProperty(name)) {
				var value = field.value;

				if(!value) {
					$(field).addClass("error");
					if(name !== "author") return;
				}

				$(field).removeClass("error");
				if(field.value) returnData[name] = field.value;
				continue;
			}

			if(name.search(/option_/g) !== -1) {
				returnData.options.push({
					text: field.value
				});
			}
		}

		_socket.emit("newPoll", returnData);
	}

	function startPoll(data, restore) {

		if(!_newPollTarget || !_oldPollTarget) return;
		if(_polls[data.id]) return;

		var poll = _polls[data.id] = new Poll(data);

		if(!restore) $(poll.dom.wrapper).hide();

		if(!data.savedAt) $(_newPollTarget).prepend(poll.dom.wrapper);
		else $(_oldPollTarget).prepend(poll.dom.wrapper);

		if(!restore) $(poll.dom.wrapper).slideDown("fast");
	}

	function endPoll(data) {
		if(!data) return;
		var poll = _polls[data.id];
		if(!poll) return;

		deletePoll(data, function() {
			startPoll(data);
		});
	}

	function deletePoll(data, cb) {
		if(!data) return;
		var poll = _polls[data.id];
		if(!poll) return;

		$(poll.dom.wrapper).slideUp("fast", function() {
			$(poll.dom.wrapper).remove();
			delete _polls[data.id];
			if(cb) cb();
		});
	}

	function Poll(data) {
		this.dom = (function() {
			var options_arr = [];
			var wrapper = ce("div","livepoll_poll");
			var hider = ce("div","livepoll_poll_hider");
			var question = ce("div","livepoll_poll_question","", "Q. " + data.question);
			var options = ce("ol","livepoll_poll_options");
			var details = ce("ul","livepoll_poll_details");
			details.appendChild(ce("li","","","<strong>Stream ID:</strong> " + data.channel));
			details.appendChild(ce("li","","","<strong>Started By:</strong> " + data.author));
			details.appendChild(ce("li","","","<strong>Duration:</strong> " + data.duration));

			for(var i = 0; i < data.options.length; i++) {
				var text = data.options[i].text;
				var votes = data.options[i].votes;
				var percent = data.options[i].percent;

				var li = ce("li");
				var li_lining = ce("div","livepoll_poll_wrapper");
				var bar_wrapper = ce("div","livepoll_poll_bar_wrapper");
				var bar = ce("div","livepoll_poll_bar","");
				var bartext = ce("div","livepoll_poll_bartext");
				var optiontext = ce("div","livepoll_bar_text","", text);

				li.appendChild(li_lining);
				li_lining.appendChild(optiontext);
				li_lining.appendChild(bar_wrapper);
				bar_wrapper.appendChild(bar);
				bar_wrapper.appendChild(bartext);
				options.appendChild(li);

				options_arr.push({
					bartext: bartext,
					bar: bar
				});
			}

			var btn_wrapper = ce("div","livepoll_poll_buttonrow");
			var show_btn = ce("div","subtleButton","","Show on Stream");
			$(show_btn).click(function() {
				_socket.emit("getViews", function(viewData) {
					if(!data) return;
					var frag = document.createDocumentFragment();

					for(var i in viewData) {
						frag.appendChild(ce("div","header","","On Viewport: " + i));
						var ul = ce("ul");

						for(var z = 0; z < viewData[i].length; z++) {
							var li = ce("li","","",viewData[i][z]);

							var closure = function() {
								var viewid = viewData[i][z];
								return function() {
									_socket.emit("assignView", {
											pollid: data.id,
											viewid: viewid
										}, 
										function(response) {
											if(response) alert(response);
											else alert("Error");
										}
									);
								};
							};

							$(li).click(closure());
							ul.appendChild(li);
						}

						frag.appendChild(ul);
					}

					menuOverlay(frag);

				});
			});
			var end_btn = ce("div","subtleButton","","End Poll");
			$(end_btn).click(function() {
				_socket.emit("endPoll", {
					id: data.id
				});
			});

			//OLD POLL STUFF
			if(data.savedAt) {
				$(wrapper).addClass("livepoll_poll_old");
				$(hider).hide();
				$(question).click(function() {
					$(hider).toggle();
				})
			}

			btn_wrapper.appendChild(show_btn);
			if(!data.savedAt) btn_wrapper.appendChild(end_btn);
			else {
				var deleteBtn = ce("div","button","","Delete");
				$(deleteBtn).click(function() {
					_socket.emit("deletePoll", {id: data.id});
				});
				btn_wrapper.appendChild(deleteBtn);
			}


			wrapper.appendChild(question);
			wrapper.appendChild(hider);
			hider.appendChild(details);
			hider.appendChild(options);
			hider.appendChild(btn_wrapper);

			return {
				wrapper: wrapper,
				options: options_arr
			};
		})();

		this.updateOptions(data.options);
	}

	Poll.prototype = {
		updateOptions: function(data) {
			for(var i = 0; i < data.length; i++) {
				var percent = data[i].percent;
				var votes = data[i].votes;
				var bartext = this.dom.options[i].bartext;
				var bar = this.dom.options[i].bar;

				bar.style.width = percent + "%";
				bartext.innerHTML = percent + "% (" + votes + ")";

			}
		}
	}

	function restore(data) {
		if(!data) return;

		for(var channel in data) {
			for(var i = 0, len = data[channel].length; i < len; i++) {
				startPoll(data[channel][i], true);
			}
		}
	}

	function menuOverlay(frag) {
		if(_menuOverlay) $(_menuOverlay).remove();
		var wrapper = ce("div","livepoll_menu");
		var close = ce("div","button","","close");
		$(close).click(function() {
			$(wrapper).fadeOut("fast");
			_menuOverlay = null;
		});
		wrapper.appendChild(frag);
		wrapper.appendChild(close);
		_menuOverlay = wrapper;
		document.body.appendChild(wrapper);
	}



})(jQuery, io, retina);