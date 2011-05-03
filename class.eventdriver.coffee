###	
EventDriver - Richard Lyon, Feb 24 2011

A simple class to allow jQuery-like trigger+bind events

For example:

	a = new EventDriver; (or an object that extends it, as intended)
	b = (function(x,y) { console.log(this,x,y) } )

	a.bind( 'yoyo', b )
	a.trigger( 'yoyo', 3.1412, 42 )

Results in "[Object EventDriver], 3.1412, 42" being logged (or something similar)
###

class EventDriver
	events: {}
	contexts: {}

	bind: ( event, fn, context ) ->
		if not @bound( event )
			@events[event] = []
			@contexts[event] = []

		@events[event].push( fn )
		@contexts[event].push( context )

	unbind: (event) ->
		@events[event] = []
		@contexts[event] = []

	trigger: (event, args...) ->
		if @bound( event )
			for i, f of @events[event]
				do (i,f) =>
				@contexts[event][i] ?= this
				f.apply( @contexts[event][i], args )

	bound: (event) ->
		return @events[event]?	#! return self.events.has(event)

this.EventDriver = EventDriver