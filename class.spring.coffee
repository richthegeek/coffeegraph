class Spring extends Graph
	constructor: () ->
		@k = 2 # currently ignored from @iterate - related to number of nodes
		@m = 0.01 # multiplier for forces in @apply
		@d = 0.5 # max/min node movement
		@r = 10 # radius at which nodes affect each other in repulsion
		@r2 = 100
		@iterations = 500
		@iteration = 0
		@is_3d = false
		@it = document.getElementById('iteration')

		# experimental
		@attract_scale = 1 # this * n = last frame at which attraction is dampened

	layout: (iterations, @infinite = false) ->
		@iteration = 0
		@trigger('layout_start')
		
		iterations ?= @iterations
		if not @infinite
			i = 0
			@loop = false
			@iterate() while i++ < iterations

		else
			if typeof @infinite != 'number' or @infinite < 1
				@infinite = 40 # 25 fps
			clearTimeout(@loop)
			clearInterval(@loop)
			@loop = setTimeout( @iterate, @infinite )

		@trigger('layout_end')

	iterate: () =>
		# only do something if it's not paused
		if not @render.paused and not @render.dragging
			# experimental
			# this modifies the spring constant so it is related to how many nodes there are.
			# 	less nodes = higher constant.
			# 	effectively reduces scale of graph as it gets larger.
			@k = 8 / Math.log(@nodes.length)
			@k2 = @k * @k

			# experimental p2 - reduces attraction in early stages to encourage big bang
			@sqrt_nl_as = Math.sqrt( @nodes.length ) * @attract_scale
			
			if @is_3d
				@dist = @distance_3d
			else
				@dist = @distance_2d

			@iteration++

			# for each pair of nodes, repulse
			for i in [0...@nodes.length]
				do (i) =>
				@repulse @nodes[i], @nodes[j] for j in [(i+1)...@nodes.length]

			# for each edge, attract
			@attract edge.source, edge.target for edge in @edges

			# apply calculated forces for this iteration
			s = {sum: 0, abs: 0}
			(to = @apply(node); s.sum += to; s.abs += Math.abs(to)) for node in @nodes
			@last_energy = s

		# update iteration counter view
		@it.innerHTML = @iteration

		# trigger the renderer (assuming the renderer has requested to be triggered on each iteration)
		@trigger('iteration', @iteration)
		@render.trigger('iteration', @iteration )

		# if it's looping infinitely, loop.
		if @loop
		 	if not @slowed and not @paused
		 		t = 10
		 	else if (@slowed? and @slowed)
		 		t = 50 * Math.log(@nodes.length)
		 	else if (@paused? and @paused)
		 		t = 50
		 	@loop = setTimeout( @iterate, t )


	repulse: (n1, n2) ->
		[ d2, dx, dy, dz] = @dist n1, n2

		# if d < r, minus the sqaure-root requirement
		# re-arranged for CP30
		if @r2 > d2
			f = @k2 / d2

			# n1-, n2+
			dx *= f
			dy *= f
			dz *= f
			n2.apply_plus( dx, dy, dz )
			n1.apply_minus( dx, dy, dz )

	attract: (n1, n2) ->
		[ d2, dx, dy, dz ] = @dist n1, n2

		# (d2-k)/k = d2/k - 1, skip the one
		f  = d2 / @k

		# experimental
		# in initial iterations (0..attract_scale), slowly introduce attraction

		if @iteration < @sqrt_nl_as
			f *= @iteration / @sqrt_nl_as

		# n1+, n2-
		dx *= f
		dy *= f
		dz *= f
		n1.apply_plus( dx, dy, dz )
		n2.apply_minus( dx, dy, dz )

	apply: (node) ->
		# add onto each dimension the force acting on that dimensions multiplied by
		# the force multiplier @m and limited by the force limiter @d
		d = @d
		nd = 0 - d
		m = @m
		[x, y, z] = [@between( nd, m * node.fx, d ), @between( nd, m * node.fy, d ), @between( nd, m * node.fz, d )]
		node.x += x
		node.y += y
		node.z += z

		node.reset_forces()
		return (x + y + z) / 3


	between: (l, m, h) ->
		return if l > m then l else (if m > h then h else m )

this.Spring = Spring
