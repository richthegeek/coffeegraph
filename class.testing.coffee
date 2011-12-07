class Testing
	@detect: false
	
	constructor: () ->
		@graphs = []
		@graph = new Graph()
	
	update_graphs: (i) ->
		if typeof(this.graphs) == "undefined"
			return

		g[0].apply(g[1], [i]) for g in this.graphs

	algorithm: (@algo) ->
		@graph.layout.select(@algo)


	renderer: (@rendermode) ->
		if @graph.render.projector?
			$(@graph.render.projector.canvas_dom).empty()

		@graph.render.select(@rendermode)
		
		@toggle_slow(false)
		@toggle_pause(false)

	detect_resize: ->
		@detect = true
		document.body.onresize = () => @graph.trigger("resize")

	toggle_slow: (swap = true) ->
		if not @graph.slowed?
			@graph.slowed = false

		if not swap
			@graph.slowed = not @graph.slowed

		if @graph.slowed
			@graph.slowed = false
			$(".toggle_slow").removeClass("active")
		else
			@graph.slowed = true
			$(".toggle_slow").addClass("active")

	toggle_pause: (swap = true) ->
		@graph.forced_pause ?= false
		
		if not swap
			@graph.forced_pause = not @graph.forced_pause

		if @graph.forced_pause
			@graph.forced_pause = false
			$(".toggle_pause").removeClass("active")
		else
			@graph.forced_pause = true
			$(".toggle_pause").addClass("active")
		
		@graph.paused = @graph.forced_pause

	toggle_2d: ->
		$(".toggle_2d").addClass("active")
		$(".toggle_3d").removeClass("active")
		@renderer('2d')

	toggle_3d: ->
		$(".toggle_3d").addClass("active")
		$(".toggle_2d").removeClass("active")
		@renderer('3d')

	toggle_spring: ->
		$(".toggle_spring").addClass("active")
		$(".toggle_kamada").removeClass("active")
		@algorithm('spring')

	toggle_kamada: ->
		$(".toggle_spring").removeClass("active")
		$(".toggle_kamada").addClass("active")
		@algorithm('kamada')
	
	toggle_mixed: ->
		@algorithm('mixed')
	
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
		w ?= parseInt prompt "Grid width", 5
		h ?= parseInt prompt "Grid height", w
		d ?= parseInt prompt "Grid depth", h
		
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

		@graph.connect( "n"+(size+offset), "n"+(i+offset) ) for i in [1..size]

		@data_clique size - 1, offset
		
	data_kneser: (n = 5, k = 2) ->
		n ?= parseInt prompt "Set size", 5
		k ?= parseInt prompt "Subset size", 2
		
		@graph.subsets = new Subsets();
		s = @graph.subsets.list(n, k)
			
		for i in [0...s.length]
			for j in [(i+1)...s.length]
				if @graph.subsets.disjoint( s[i], s[j] )
					@graph.connect( s[i].join(), s[j].join() )

	data_random: (n=10, p=0.1) ->
		for i in [0...n]
			for j in [(i+1)...n]
				if Math.random() < p
					@graph.connect("n"+i, "n"+j)

	random_of: (ls) ->
		return ls[ Math.floor( Math.random() * ls.length ) ]

window.Testing = Testing