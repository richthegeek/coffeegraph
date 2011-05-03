class Energy
	constructor: (graph) ->
		@graph = graph
		@last_time = new Date()
		@last_time = @last_time.getTime()
		@last_fps = 0

	fps: (divisor = 10) ->
		nt = new Date()
		nt = nt.getTime()

		fp = 1000 / (nt - @last_time)
		fp *= divisor
		@last_time = nt

		if( fp > 250 ) then return false

		return { fps: fp }

	energy: ->
		if t.graph.last_energy?
			return t.graph.last_energy
		else
			return false

	# returns info on the angles between edges leading from all nodes
	#  - minimum angle delta
	#  - maximum angle delta
	#  - angle sum (double the /actual/ sum probably, probably)
	#  - number of angles comparisons computed (n(n-1), twice as many as edges I imagine)
	# CHECKED
	edge_angles: ->
		[mina, maxa, total, count] = [360, -360, 0, 0]
		
		slopes = {}
		inners = []

		mp18 = 180 / Math.PI

		for e1 in @graph.edges
			do(e1) =>
				slopes[e1.toString()+"xy"] = (e1.target.y - e1.source.y) / (e1.target.x - e1.source.x)
				if @graph.is_3d
					slopes[e1.toString()+"xz"] = (e1.target.y - e1.source.z) / (e1.target.x - e1.source.x)
					slopes[e1.toString()+"yz"] = (e1.target.y - e1.source.z) / (e1.target.x - e1.source.y)
					s1 = Math.min(slopes[e1.toString()+"yz"], slopes[e1.toString()+"xz"], slopes[e1.toString()+"xy"])
				else
					s1 = slopes[e1.toString()+"xy"]

				for i, s2 of slopes
					inners.push(Math.atan( (s1 - s2) / (1 + (s1*s2)) ) * mp18)
				
				slopes[e1.toString()] = s1

		# for i, e1 of @graph.edges
			# do()->
			# s1 = slopes[e1.toString()]
			# for j, e2 of @graph.edges when (e2.has(e1.source) or e2.has(e1.target)) and j != i
			# inners.push(Math.atan( (s1 - slopes[e2.toString()]) / (1 + (s1*slopes[e2.toString()])) ) * (180/Math.PI))

		for i in inners
			do()->
			i = Math.abs(i)
			[maxa, mina] = [Math.max(maxa,i), Math.min(mina,i)]
			total = total + i
			count = count + 1
		return { min: mina, max: maxa, mean: total/count, total: total, count: count }

	# returns global node->node distances (including unconnected nodes)
	# min, max and mean.
	# distances are all positive
	# CHECKED
	node_node_distances: ->
		[mina, maxa, total, count, nearest] = [9999, 0, 0, 0]

		i = 1
		for n1 in @graph.nodes
			do(n1) ->
			for n2 in @graph.nodes[(i++)..]
				do(n1,n2) ->
				[d2,dx,dy] = @graph.distance(n1,n2)
				d = Math.sqrt(d2)
				[mina, maxa, total, count] = [Math.min(d,mina), Math.max(d,maxa), total + d, count + 1]
		return { min: mina, max: maxa, mean: total/count }

	# measures the min/mean distances between a node and the nearest edge
	# across all nodes and edges
	# min and mean only (max is useless)
	# CHECKED
	node_edge_distances: ->
		min = 99999
		total = 0
		count = 0
		
		for c in @graph.nodes
			do(c) ->
			for e in @graph.edges when not e.has(c)
				do(e) ->
				
				[a,b] = [e.source, e.target]
				
				r_num 	= ((c.x-a.x)*(b.x-a.x)) + ((c.y-a.y)*(b.y-a.y))
				r_den 	= ((b.x-a.x)*(b.x-a.x)) + ((b.y-a.y)*(b.y-a.y))
				r		= r_num / r_den
				px		= a.x + r*(b.x-a.x)
				py		= a.y + r*(b.y-a.y)
				st		= ( ((a.y-c.y)*(b.x-a.x)) - ((a.x-c.x)*(b.y-a.y)) ) / r_den
				
				if r >=0 && r <= 1
					d = Math.abs(st) * Math.sqrt(r_den)
				else
					d1 = Math.pow(c.x-a.x, 2) + Math.pow(c.y-a.y, 2)
					d2 = Math.pow(c.x-b.x, 2) + Math.pow(c.y-b.y, 2)
					d  = Math.sqrt(Math.min(d1,d2)) #! may be max
				
				total += d
				count += 1
				min = Math.min(min,d)
		
		return { min: min, mean: total/count }

	# returns local node->node distances (only joined nodes considered)
	# min, max, and mean
	# distances are all positive
	# CHECKED
	edge_lengths: ->
		[mina, maxa, total] = [Infinity, -Infinity, 0]
		for e in @graph.edges
			do(e) ->
			[d2,dx,dy,dz] = @graph.distance(e.source, e.target)
			# d = Math.sqrt(Math.pow(e.source.x - e.target.x,2) + Math.pow(e.source.y - e.target.y,2))
			d = Math.sqrt(d2)

			maxa = Math.max(d, maxa)
			mina = Math.min(d, mina)
			total += d

		return { min: mina, max: maxa, mean: total/@graph.edges.length }


	# attempts to measure how well-distributed a graph is
	# by measuring the area/volume divided by the number of nodes (thus space used per node)
	# CHECKED
	distribution: ->
		[min,max, count] = [[0,0,0],[0,0,0], 0]
		[min[0],max[0],min[1],max[1], min[2],max[2], count] = [Math.min(min[0],node.x),Math.max(max[0],node.x), Math.min(min[1],node.y),Math.max(max[1],node.y), Math.min(min[2],node.z),Math.max(max[2],node.z), count + 1] for node in @graph.nodes
		area = (max[0] - min[0]) * (max[1] - min[1])

		if @graph.is_3d then area = area * (max[2] - min[2])

		return { value: area / count, area: area }

	# count the number of edge crossings in the graph
	# CHECKED
	edge_crossings: ->
		# no crossings in 3-space
		if @graph.is_3d
			return 0

		ios = (xi, yi, xj, yj, xk, yk) -> if ((xi <= xk || xj <= xk) && (xk <= xi || xk <= xj) && (yi <= yk || yj <= yk) && (yk <= yi || yk <= yj)) then return true else return false
		cdi = (xi, yi, xj, yj, xk, yk) ->
			[a,b] = [(xk-xi)*(yj-yi), (xj-xi)*(yk-yi)]
			if a < b then (return -1) else (if a > b then (return 1) else (return 0))

		cross = {}
		cross[e.source.name+e.target.name] = 0 for e in @graph.edges
		
		for e1 in @graph.edges
			do(e1) ->
			for e2 in @graph.edges when not (e2.has(e1.source) or e2.has(e1.target))
				do(e2)->

				[a, b, c, d] = [e1.source, e1.target, e2.source, e2.target]

				d1 = cdi(c.x,c.y, d.x,d.y, a.x,a.y)
				d2 = cdi(c.x,c.y, d.x,d.y, b.x,b.y)
				d3 = cdi(a.x,a.y, b.x,b.y, c.x,c.y)
				d4 = cdi(a.x,a.y, b.x,b.y, d.x,d.y)				

				if ((((d1 > 0 && d2 < 0)||(d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0)||(d3 < 0 && d4 > 0))) || (d1 == 0 && ios(c.x, c.y, d.x, d.y, a.x, a.y)) || (d2 == 0 && ios(c.x, c.y, d.x, d.y, b.x, b.y)) || (d3 == 0 && ios(a.x, a.y, b.x, b.y, c.x, c.y)) || (d4 == 0 && ios(a.x, a.y, b.x, b.y, d.x, d.y)))
					cross[e1.toString()]++
					cross[e2.toString()]++
		
		count = 0
		count += i/4 for k,i of cross
		return { count: count }

this.Energy = Energy