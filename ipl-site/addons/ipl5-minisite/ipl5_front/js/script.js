// Author: James Burroughs

(function($) {

	if(window.frontPage) return;

	var _staticNav;
	var _browserHeight;
	var _staticNav_timer;
	var _staticNav_visible = false;

	var _sliderTimer;

	//On Ready
	$(function() {
		_staticNav = document.getElementById("fp_nav");
		_browserHeight = $(window).height();

		if(_staticNav) {
			$(window).scroll(onScroll);
			$(window).resize(function() {
				_browserHeight = $(window).height();
			});
		}
	});

	function onScroll(e) {
		clearTimeout(_staticNav_timer);
		var y = $(window).scrollTop();
		if(y > 40 && !_staticNav_visible) {
			_staticNav_timer = setTimeout(function() {
				$(_staticNav).fadeIn("fast", function() {
					_staticNav_visible = true;
				});
			},100);
		}
		else if(y <= 40 && _staticNav_visible) {
			_staticNav.style.display = "none";
			_staticNav_visible = false;
		}
	}

	function scrollToContent(selector) {

		clearTimeout(_sliderTimer);

		var duration = 1000;
		var start = new Date().getTime();
		var end = start + duration;

		var currY = $(window).scrollTop();
		var endY = $(selector).offset().top;

		var freq = Math.PI / (2 * duration);

		var total_distance = endY - currY;

		(function animate() {
			var t = new Date().getTime();

			if(t > end) {
				var endY = currY + total_distance;
				$(window).scrollTop(endY);
				return;
			}

			_sliderTimer = setTimeout(animate, 16);

			var p = t - start;
			var curve = Math.abs(Math.sin(p * freq));
			var y = currY + (total_distance * curve);

			$(window).scrollTop(y);
		

		})();
	}


	window.frontPage = {
		scrollToContent: scrollToContent
	};

})(jQuery);





