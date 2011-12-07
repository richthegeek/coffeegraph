class KamadaKawai extends Graph

	constructor: (graph) ->
		@graph = graph
		@paths = {}
		@springs = {}

	select_dist: ->
		if @graph.is_3d
			@dist = @graph.distance_3d
		else
			@dist = @graph.distance_2d

	prepare: () ->
		@select_dist()

		# scale graph by graph-size..
		s = Math.sqrt(Math.sqrt(@graph.nodes.length))
		[n.x, n.y, n.z] = [n.x * s, n.y * s, n.z * s] for n in @graph.nodes

		# compute shortest paths (O(n^3))
		@shortest_paths()

		@tolerance = 0.1
		@k = 1


		@update_springs()
				
		# get first p/delta_p
		@delta_p = -Infinity
		@partials = {}
		for n in @graph.nodes
			do(n) ->
			@partials[n.name] = @compute_partial_derivatives(n)
			delta = @calculate_delta(@partials[n.name])

			if delta > @delta_p
				@p = n
				@delta_p = delta


	update_springs: () ->
		# compute l and k (ideal lengths and spring-strengths) (O(n^2))
		@springs = {}
		@springs[u.name] = {} for u in @graph.nodes

		for i, u of @graph.nodes
			do(i,u) ->
			for v in @graph.nodes[++i..] # yes, i know, horrible look
				do(u,v)->
				dij = @paths[u.name][v.name]
				if dij == Infinity then return false
				kd = @k / (dij*dij)
				@springs[u.name][v.name] = kd
				@springs[v.name][u.name] = kd

	# using the Floyd-Warshall algorithm 'cos I'm hardcore like that
	# ported from networkX code
	# O(n2) + O(n3) - luckily only run once
	# tested + working on a cube
	shortest_paths: ->
		@paths = {}

		lim = Math.ceil(Math.sqrt(@graph.nodes.length))
		for u in @graph.nodes
			p = {}
			p[v.name] = lim + 1 for v in @graph.nodes
			p[u.name] = 0

			e = {}
			e[u.name] = true
			q = [u]
			qo = 0

			while q.length > 0
				n = q.reverse().pop()
				q = q.reverse();
				for m in n.nodes when not e[m.name]?
					p[m.name] = p[n.name] + 1
					e[m.name] = true

					# if p[m.name] <= lim
					q.push(m)
			
			@paths[u.name] = p

		return @paths

		# A haiku:
		# 	accurate APSP of O(n3)
		# 	takes too long
		# 	to use
		#
		# for u in @graph.nodes
		# 	do(u) ->
		# 	@paths[u.name] = {}
		# 	@paths[u.name][v.name] = Infinity for v in @graph.nodes # distance to nodes in general = Inf (calculated in cube loop)
		# 	@paths[u.name][v.name] = 1 for v in u.nodes # distance to nodes directly connected to u = 1
		# 	@paths[u.name][u.name] = 0 # distance to self = 0

		# # here comes the paaaiiinnn	
		# for w in @graph.nodes
		# 	for u in @graph.nodes when w != u
		# 		for v in @graph.nodes when w != v and u != v
		# 			@paths[u.name][v.name] = Math.min(@paths[u.name][v.name], (@paths[u.name][w.name] + @paths[w.name][v.name]))

		return @paths

	iterate: () ->
		@select_dist()

		if @graph.nodes.length == 0 then return
		# adds 2n to iteration, could probably be improved... ensures we have springs and paths
		for n in @graph.nodes
			if (not @paths) or (not @springs) or (not @partials) or (not @paths[n.name]?) or (not @springs[n.name]?) or (not @partials[n.name])
				@prepare(); break
		
		# update p_partials - partials from each each node to p
		@p_partials = {}
		@p_partials[n.name] = @compute_partial_derivative(n, @p) for n in @graph.nodes

		# compute differentials and move candidate node about
		@inner_loop()

		# select new p by updating each pd and delta
		@select_new_p()
		@graph.last_energy = @delta_p

	inner_loop: () ->
		iter = 0 # iter is to make sure the algorithm doesn't get stuck
		@last_local_energy = Infinity
		while iter < 500 and not @done(false)
			iter++
			
			# compute elements of jacobian
			mat = { xx: 0, yy: 0, xy: 0, yx: 0}
			dim = ['x','y']
			
			if @graph.is_3d
				mat[a] = 0 for a in [ 'zz', 'xz', 'xz', 'yz', 'zy' ]
				dim.push 'z'

			spr = @springs[@p.name]
			pat = @paths[@p.name]

			d = {}
			for n in @graph.nodes when not (n is @p)
				do() ->
				[d2, d.x, d.y, d.z] = @dist(@p, n)

				k = spr[n.name]
				lid3 = pat[n.name] * (1 / (d2*Math.sqrt(d2)))

				for i in dim
					for j in dim
						mat[ i+j ] += (if i == j then (k * (1 + (lid3 * (d[i] * d[i] - d2)))) else (k * lid3 * d[i] * d[j]))

			# solve the linear equations using Cramer's law
			delta = @linear_solver(mat, @partials[@p.name])

			# move p by delta
			@p.x += delta.x
			@p.y += delta.y
			@p.z += delta.z

			#update partials and delta p
			@partials[@p.name] = @compute_partial_derivatives(@p)
			@delta_p = @calculate_delta(@partials[@p.name])


	select_new_p: () ->
		op = @p
		for n in @graph.nodes
			do(n) ->
			odp = @p_partials[n.name]
			opp = @compute_partial_derivative(n, op)

			@partials[n.name].x += opp.x - odp.x
			@partials[n.name].y += opp.y - odp.y
			@partials[n.name].z += opp.z - odp.z

			delta = @calculate_delta(@partials[n.name])

			if delta > @delta_p
				@p = n
				@delta_p = delta

	
	linear_solver: (mat, rhs) ->
		if @graph.is_3d
			# minor reduction in number of calculations
			[c1, c2, c3] = [ (mat.yy * mat.zz - mat.yz * mat.yz), (mat.xy * mat.zz - mat.yz * mat.xz), (mat.xy * mat.yz - mat.yy * mat.xz) ]

			denom = 1 / (mat.xx * c1 - mat.xy * c2 + mat.xz * c3)
			x_num = rhs.x  * c1 - rhs.y  * c2 + rhs.z  * c3
			#denom = mat.xx * (mat.yy * mat.zz - mat.yz * mat.yz) - mat.xy * (mat.xy * mat.zz - mat.yz * mat.xz) + mat.xz * (mat.xy * mat.yz - mat.yy * mat.xz)
			#x_num = rhs.x  * (mat.yy * mat.zz - mat.yz * mat.yz) - rhs.y  * (mat.xy * mat.zz - mat.yz * mat.xz) + rhs.z  * (mat.xy * mat.yz - mat.yy * mat.xz)
			y_num  = mat.xx * (rhs.y  * mat.zz - rhs.z  * mat.yz) - mat.xy * (rhs.x  * mat.zz - rhs.z  * mat.xz) + mat.xz * (rhs.x  * mat.yz - rhs.y  * mat.xz)
			z_num  = mat.xx * (mat.yy * rhs.z  - mat.yz * rhs.y)  - mat.xy * (mat.xy * rhs.z  - mat.yz * rhs.x ) + mat.xz * (mat.xy * rhs.y  - mat.yy * rhs.x)
		else
			denom = 1 / (mat.xx * mat.yy - mat.xy * mat.xy)
			x_num = rhs.x  * mat.yy - rhs.y  * mat.xy
			y_num = mat.xx * rhs.y  - mat.xy * rhs.x
			z_num = 0

		return { x: x_num * denom, y: y_num * denom, z: z_num * denom }		


	# compute contribution from first derivative (dE/dx)
	compute_partial_derivative: (m, i) ->
		result = { x: 0, y: 0, z: 0 }

		if not (i is m)
			[d2, dx, dy, dz] = @dist( m, i )
			k = @springs[m.name][i.name]
			l = @paths[m.name][i.name] / Math.sqrt(d2)

			result.x = k * (dx - l*dx)
			result.y = k * (dy - l*dy)
			result.z = k * (dz - l*dz)

		return result


	# sum section of dE/dx type eqautions
	compute_partial_derivatives: (m) ->
		result = { x: 0, y: 0, z:0 }
		add_results = (a,b) -> (a.x += b.x; a.y += b.y; a.z += b.z; return a)

		result = add_results( result, @compute_partial_derivative(m,i) ) for i in @graph.nodes
		return result


	calculate_delta: (partial) ->
		if @graph.is_3d
			return Math.sqrt(partial.x*partial.x + partial.y*partial.y + partial.z*partial.z)
		else
			return Math.sqrt(partial.x*partial.x + partial.y*partial.y)


	# checks wether the change in energy is small enough to move on
	done: () ->
		if @last_local_energy == Infinity || @last_local_energy < @delta_p
				@last_local_energy = @delta_p
				return false
		
		diff = 1 - (Math.abs(@last_local_energy - @delta_p) / @last_local_energy)
		done = ((@delta_p == 0) or (diff < @tolerance))
		@last_local_energy = @delta_p
		return done

this.KamadaKawai = KamadaKawai