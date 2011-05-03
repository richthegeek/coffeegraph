class Testing extends EventDriver
	@detect: false
	
	constructor: () ->
		@graphs = []
	
	update_graphs: (i) ->
		if typeof(this.graphs) == "undefined"
			return

		g[0].apply(g[1], [i]) for g in this.graphs

	algorithm: (@algo) ->
		if @graph? and @graph.nodes? and @graph.nodes.length > 0
			jso = @graph.asJSON(true)
			t = @graph.is_3d.valueOf()

		switch @algo
			when 'spring' then @graph = new Spring()
			when 'kamada' then @graph = new KamadaKawai()
			when 'siman' then @graph = new SimulatedAnnealing()

			else alert("not a valid algorithm choice :(")

		if jso?
			@graph.fromJSON(jso)

			console.log(t)

			if t == true
				f = () => @toggle_3d()
			else
				f = () => @toggle_2d()
			setTimeout(f,100)

		@graph.unbind('iteration')
		@graph.bind('iteration', this.update_graphs, this)

	renderer: (name) ->
		if (not @canvas?) or (not @graph?)
			return alert('no canvas and/or algorithm chosen...')


		if @render?
			$(@render.canvas_dom).empty()
			if @looping? and @looping
				clearInterval(@render.loop)
				clearTimeout(@render.loop)
				@render.loop = false
				@graph.loop = false
			@render.events = @render.contexts = {}
			if @detect then @detect_resize()

			delete n.element for n in @graph.nodes
			delete e.element for e in @graph.edges


		switch name
			when '2d' then @render = new Render2D(@canvas, @graph)
			when 'raphael' then @render = new Render2D(@canvas, @graph)

			when '3d' then @render = new Render3D(@canvas, @graph)
			when 'three' then @render = new Render3D(@canvas, @graph)

			else alert('not a valid renderer choice :(')

		@toggle_slow(false)
		@toggle_pause(false)
		@graph.iteration = 0
		@graph.bind('iteration', @update_graphs)		

	detect_resize: ->
		@detect = true
		document.body.onresize = () => @render.trigger("resize")

	toggle_slow: (swap = true) ->
		if not @slowed?
			@slowed = false

		if not swap
			@slowed = (if @slowed then false else true)

		if @slowed
			@slowed = false
			$(".toggle_slow").removeClass("active")
		else
			@slowed = true
			$(".toggle_slow").addClass("active")

		if @graph? then @graph.slowed = @slowed
		if @render? then @render.slowed = @slowed

	toggle_pause: (swap = true) ->
		@forced_pause ?= false
		
		if not swap
			@forced_pause = (if @forced_pause then false else true)

		if @forced_pause
			@forced_pause = false
			$(".toggle_pause").removeClass("active")
		else
			@forced_pause = true
			$(".toggle_pause").addClass("active")
		
		if @graph? then @graph.paused = @forced_pause
		if @render?
			@render.paused = @forced_pause
			@render.fpaused = @forced_pause

	toggle_2d: ->
		$(".toggle_2d").addClass("active")
		$(".toggle_3d").removeClass("active")
		@renderer('2d')
		if @looping? and @looping
			@loop_indefinitely( @pfn, @frameskip, @fps )

	toggle_3d: ->
		$(".toggle_3d").addClass("active")
		$(".toggle_2d").removeClass("active")
		@renderer('3d')
		if @looping? and @looping
			@loop_indefinitely( null, @frameskip, @fps )

	toggle_spring: ->
		$(".toggle_spring").addClass("active")
		$(".toggle_kamada").removeClass("active")
		@algorithm('spring')

	toggle_kamada: ->
		$(".toggle_spring").removeClass("active")
		$(".toggle_kamada").addClass("active")
		@algorithm('kamada')
	
	loop_indefinitely: (@pfn = null, @frameskip = 10, @fps = 25) ->
		if not @render?
			alert("unable to loop - no renderer...")

		@looping = true

		f = () =>
			if @pfn? and typeof(@pfn) == 'function' then @pfn(this)
			if @slowed or @render.paused or @forced_pause or (@graph.iteration % @frameskip == 0) then @render.draw()
		
		# @render.unbind('iteration')
		@render.bind('iteration', f)

		@graph.layout(null, @fps)


	clear_graph: ->
		@graph.clear()


	cliqueify: ->
		for i, n1 of @graph.nodes
			do(n1) ->
			@graph.connect(n1,n2) for n2 in @graph.nodes[i..]

	# adds a random edge, uses the Fisher-Yates algo
	add_random_edge: (r1) ->
		ls = @graph.nodes
		i = @graph.nodes.length

		if @graph.edges.length >= (i * (i-1) * 0.5)
			return;

		while i-- > 0
			do() =>
			j = Math.floor( Math.random() * (i+1) )
			ti = ls[i]
			ls[i] = ls[j]
			ls[j] = ti

		r1 = ls[0]
		j = 1
		
		j++ while (typeof(ls[j]) != undefined) and @graph.connected( r1, ls[j] )

		if ls[j]? and typeof(ls[j]) != "undefined"
			@graph.connect( r1, ls[j] )


	delete_random_edge: ->
		if @graph.edges.length == 0
			return true
		@graph.disconnect_edge @random_of( @graph.edges )


	add_random_node: (e)->
		n = new Node("rn" + Math.random())
		@add_random_edge @graph.add( n )
		# @graph.trigger('add_node', n ) # why is this being trigerred elsewhere? from where?


	delete_random_node: ->
		@graph.remove_node @random_of(@graph.nodes)

	data_reset: ->
		x = () -> Math.random() * 5
		[node.x,node.y,node.z] = [x(),x(),x()] for node in @graph.nodes

	data_loop: (num = null, offset = 0) ->
		num ?= parseInt(prompt("Number of nodes in loop [3-inf]", 10))
		num = num + offset - 2

		console.log(num)

		@graph.connect "a"+i, "a"+(i+1) for i in [offset..num]
		@graph.connect "a"+i, "a"+offset


	data_grid: (w = null, h = null) ->
		w ?= parseInt prompt "Grid width", 10
		h ?= parseInt prompt "Grid height", w
		
		@graph.add "x1y1"

		for x in [1..w]
			do(x) ->
			for y in [1..h]
				do(y) ->
				if x < w then @graph.connect( "x"+x+"y"+y, "x"+(x+1)+"y"+y )
				if y < h then @graph.connect( "x"+x+"y"+y, "x"+x+"y"+(y+1) )

	data_grid_3d: (w = null, h = null, d = null) ->
		w ?= parseInt prompt "Grid width", 10
		h ?= parseInt prompt "Grid height", w
		d ?= parseInt prompt "Grid depth", w
		
		#@graph.add "p111"

		for x in [1..w]
			do(x) ->
			for y in [1..h]
				do(y) ->
				for z in [1..d]
					do(z) ->
					if x < w then @graph.connect( "p"+x+y+z, "p"+(x+1)+y+z )
					if y < h then @graph.connect( "p"+x+y+z,   "p"+x+(y+1)+z )
					if z < d then @graph.connect( "p"+x+y+z,   "p"+x+y+(z+1) )

	data_cube: ->
		c = { "a": ["b","d","e"], "b": ["c","f"], "c": ["d","g"], "h": ["d","g"], "e": ["f","h"], "f": ["g"] }

		for a, v of c
			do(a) =>
			@graph.connect a, b for b in v

	data_clique: (size = null, offset = 0 ) ->
		size ?= parseInt prompt "Clique size", 6

		if size == 1
			return true

		@graph.connect( "a"+(size+offset), "a"+(i+offset) ) for i in [1..size]

		@data_clique size - 1, offset

	random_of: (ls) ->
		return ls[ Math.floor( Math.random() * ls.length ) ]

window.Testing = Testing