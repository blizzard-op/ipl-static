class window.Ipl6
	constructor: (@$container)->
		@mouseX = 0
		@mouseY = 0
		@maxXRot = 35
		@maxYRot = 35
		@fps = 30

		window.setInterval( @update, 1000/@fps )
		$('body').css('-webkit-perspective' ,1500)
		$(window).mousemove (e)=>
			@mouseX = e.pageX
			@mouseY = e.pageY

	update: (e)=>
		@$container.css('-webkit-transform', 'rotateY('+ @maxXRot*@mouseDistFromCenterX()/1000 +'deg) rotateX(' + @maxYRot*-@mouseDistFromCenterY()/1000 +'deg)')
		# console.log 'rotateY('+ @maxXRot*@mouseDistFromCenterX()/600
	mouseDistFromCenterX: ()=>
		@mouseX - (@$container.offset().left + @$container.outerWidth() *.5)
	mouseDistFromCenterY: ()=>
		@mouseY - (@$container.offset().top - 100 + @$container.outerHeight() *.5) 