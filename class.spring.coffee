# Implements the Fruchterman-Reingold algorithm in 2D & 3D
#
# The algorithm models the graph as a spring network.
# This implementation is undirected & unweighted.
class Spring
	constructor: (graph) ->
		@graph = graph
		@k = 2 # currently ignored from @iterate - related to number of nodes
		@m = 0.01 # multiplier for forces in @apply
		@d = 0.5 # max/min node movement
		@r = 10 # radius at which nodes affect each other in repulsion
		@r2 = @r * @r # calculate this here (optimisation)

		# experimental
		@attract_scale = 1 # this * n = last frame at which attraction is dampened

	prepare: () ->
		@iteration = 0
		
	iterate: () =>
		# experimental
		# this modifies the spring constant so it is related to how many nodes there are.
		# 	less nodes = higher constant.
		# 	effectively reduces scale of graph as it gets larger.
		@k = 8 / Math.log(@graph.nodes.length)
		@k2 = @k * @k
		# experimental p2 - reduces attraction in early stages to encourage big bang
		@sqrt_nl_as = Math.sqrt( @graph.nodes.length ) * @attract_scale
		
		
		# speeds up the iteration by reducing number of ifs from n to 1 on this choice
		@dist = (if @graph.is_3d then @graph.distance_3d else @graph.distance_2d)
		
		# for each pair of nodes, repulse
		for i in [0...@graph.nodes.length]
			do (i) =>
			@repulse @graph.nodes[i], @graph.nodes[j] for j in [(i+1)...@graph.nodes.length]

		# for each edge, attract
		@attract edge.source, edge.target for edge in @graph.edges

		# apply calculated forces for this iteration
		@graph.last_energy = {sum: 0, abs: 0}
		(to = @apply(node); @graph.last_energy.sum += to; @graph.last_energy.abs += Math.abs(to)) for node in @graph.nodes
		
		return true

	# Coulomb repulsion
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

	# Hooke attraction
	attract: (n1, n2) ->
		[ d2, dx, dy, dz ] = @dist n1, n2

		f  = d2 / @k

		# experimental
		# in initial iterations (0..attract_scale), slowly introduce attraction
		if @graph.iteration < @sqrt_nl_as
			f *= @graph.iteration / @sqrt_nl_as

		# n1+, n2-
		dx *= f
		dy *= f
		dz *= f
		n1.apply_plus( dx, dy, dz )
		n2.apply_minus( dx, dy, dz )

	# apply the forces from this iteration
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

	# return a number no less than l and no higher than h, returning m when possible
	between: (l, m, h) ->
		return if l > m then l else (if m > h then h else m)

this.Spring = Spring
