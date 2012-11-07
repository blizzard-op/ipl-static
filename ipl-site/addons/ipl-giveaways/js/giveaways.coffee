$('a.sponsor-scroll').click ()->
	$actGive = $('div.active-giveaway')
	newTop = ($actGive.offset().top + ($actGive.outerHeight() * .5)) - ($(window).height() * .5)

	$('html,body').animate({
		'scrollTop':newTop
	},
	{
		'queue':false
		'duration':300					
	}
	)

	false