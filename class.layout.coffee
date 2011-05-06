# Handles the layout-algorithms, makes sure that the correct layouter is
# called in the event of a switch.
#
# Also handles the looping of the layouter either indefinitely or for a
# fixed number of iterations. It also updates the iteration counter.
class Layout

	constructor: (graph) ->
		@graph = graph
		@algorithm = false
		@interval = 20
		@it = document.getElementById('iteration')		
		
	# switch algorithms when required.
	select: (name) ->
		name = name.toLowerCase()
		if name == "spring"
			@algorithm = new Spring(@graph)
		else if name == "kamadakawai" || name == "kamada"
			@algorithm = new KamadaKawai(@graph)


	# execute a fixed number of iterations either in bulk (as fast as possible)
	# or with a set interval to allow the renderer to draw.
	finite: (i, prep = true, bulk = false) ->
		if @graph.iteration == i then return
		
		if prep
			@graph.iteration = 0
			@algorithm.prepare()
		
		if bulk
			@iterate() for j in [1..i]
		else
			@iterate()
			f = () => @finite(i, false, false)
			setTimeout(f, @interval)

	# execute the graph layout ad inifinitum.	
	loop: (prep = true) ->
		if prep
			@graph.iteration = 0
			@algorithm.prepare()
			
		@iterate()
		
		f = () => @loop(false)
		i = `this.graph.slowed ? this.interval * 10 : this.interval`
		setTimeout(f, i)
	
	iterate: ->
		if not (@graph.paused or @graph.dragging)
			@algorithm.iterate()
			@it.innerHTML = ++@graph.iteration
			
		@graph.trigger("iteration", @graph.iteration)
		
this.Layout = Layout