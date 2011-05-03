class KamadaKawai extends Graph

	# this algorithm only has one gear; GO!!!
	layout: (iterations, @infinite = false) ->
		if $? then $("#sidebar li b:contains('energy')").click()

		# scale graph by graph-size..
		s = Math.sqrt(Math.sqrt(@nodes.length))
		[n.x, n.y, n.z] = [n.x * s, n.y * s, n.z * s] for n in @nodes

		# compute shortest paths (O(n^3))
		@shortest_paths()

		@tolerance = 0.001
		@k = 1

		@update_springs()
				
		# get first p/delta_p
		@delta_p = -Infinity
		@partials = {}
		for n in @nodes
			do(n) ->
			@partials[n.name] = @compute_partial_derivatives(n)
			delta = @calculate_delta(@partials[n.name])

			if delta > @delta_p
				@p = n
				@delta_p = delta
		
		@last_energy = Infinity
		# @main() while not @done(true)
		@iteration = 0
		@it = document.getElementById('iteration')
		
		if @infinite
			@inf_loop(@infinite)
		else
			@main() for i in [1..iterations]

	update_springs: () ->
		# compute l and k (springs and distances?) (O(n^2))
		@springs = {}
		@springs[u.name] = {} for u in @nodes

		for i, u of @nodes
			do(i,u) ->
			for v in @nodes[++i..] # yes, i know, horrible look
				do(u,v) ->
				dij = @paths[u.name][v.name]
				if dij == Infinity then return false
				@springs[u.name][v.name] = @springs[v.name][u.name] = @k / (dij*dij)	

	inf_loop: (t) ->
		# if not @done(true)
		@main()
		# console.log "loop"		
		
		@render.draw()
		@it.innerHTML = @iteration

		f = () => @inf_loop(t)
		@loop = setTimeout( f, t )

	main: () ->
		if @paused or @render.dragging
			return

		@iteration++
		
		# update p_partials - partials from each each node to p
		@p_partials = {}
		@p_partials[n.name] = @compute_partial_derivative(n, @p) for n in @nodes

		# compute differentials and move candidate node about
		@inner_loop()

		# select new p by updating each pd and delta
		@select_new_p()

	inner_loop: () ->
		# best approximation of do-while possible
		i = 0
		@last_local_energy = Infinity
		while i < 100 and not @done(false)
			do() ->
			i++

			# compute elements of jacobian
			mat = { xx: 0, yy: 0, xy: 0, yx: 0}
			dim = ['x','y']
			
			if @is_3d
				mat[a] = 0 for a in [ 'zz', 'xz', 'xz', 'yz', 'zy' ]
				dim.push 'z'

			spr = @springs[@p.name]
			pat = @paths[@p.name]

			d = {}
			for n in @nodes when not (n is @p)
				do() ->
				[d2, d.x, d.y, d.z] = @distance(@p, n)

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
		for n in @nodes
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
		if @is_3d
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
			[d2, dx, dy, dz] = @distance( m, i )
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

		result = add_results( result, @compute_partial_derivative(m,i) ) for i in @nodes
		return result


	calculate_delta: (partial) ->
		if @is_3d
			return Math.sqrt(partial.x*partial.x + partial.y*partial.y + partial.z*partial.z)
		return Math.sqrt(partial.x*partial.x + partial.y*partial.y)


	done: (glob) ->
		name = (if glob != false then 'last_energy' else 'last_local_energy')
		
		if this[name] == Infinity
			this[name] = @delta_p
			return false

		diff = Math.abs(this[name] - @delta_p)
		done = ((@delta_p == 0) or (diff / this[name] < @tolerance))
		this[name] = @delta_p
		return done

this.KamadaKawai = KamadaKawai