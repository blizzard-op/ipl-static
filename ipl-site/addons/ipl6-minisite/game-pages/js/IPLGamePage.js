(function($){
	$(document).ready(function(){
		//resizeLanding();
		hookLinks();
	});

	var resizeLanding = function(){
		var newHeight;
		$('section.resize-on-load').each(function(index){
			if(index == 0){
				newHeight = $(window).height()-$('header').outerHeight()-$('nav').height();
				if(newHeight >= $(this).outerHeight()){
					
					$(this).height($(window).height()-$('header').outerHeight()-$('nav').height());
				}
			}else{
				newHeight = $(window).height()-$('nav').height();
				if(newHeight > $(this).height()){
					$(this).height(newHeight);
				}
					
			}
		});
		//$('section.resize-on-load').height($(window).height() -$('nav').outerHeight());
		//$('section.resize-on-load').first().height($(window).height()-$('header').outerHeight()-$('nav').height());
	};

	var hookLinks = function(){
		$('div.left-nav').find("ul a").click(function(event){
			event.preventDefault();
			var newHash = $(this).attr('href');
			var newTop = $(newHash).offset().top;
			$('html,body').animate({
					'scrollTop':newTop
				},
				{
					'queue':false,
					'duration':300,
					'complete': function(){
						window.location.hash = newHash;
					}
				}
			);
		});
	};

})(jQuery);



