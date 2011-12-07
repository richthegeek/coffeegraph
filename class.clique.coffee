class Clique

	constructor: (graph) ->
		@graph = graph


	test: (k) ->
		s = new Subsets()
		sets = s.list(@graph.nodes.length, k)
		console.log("Hard-test for " + k + " with " + sets.length + " possibilities")

		for set in sets
			connected = true
			for j in [0...set.length]
				for k in [(j+1)...set.length]
					n1 = @graph.nodes[set[j]-1]
					n2 = @graph.nodes[set[k]-1]
					
					con = false
					for e in n1.edges
						if (e.source.name == n2.name) or (e.target.name == n2.name)
							con = true
					
					if not con
						connected = false
				
				if not connected
					break
			if connected
				console.log("found",set)
				return true

		console.log( "No cliques of size "+k+" found" )
		return false


	detect_cliques: ->

		cmax = 0
		cliques = []
		incl = []
		clique = []

		console.time(@graph.edges.length)

		for node1 in @graph.nodes
			for node2 in node1.nodes
				# if node1 and node2 are currently in a clique together, skip to next node2
				if @in_cliques( incl, node1.name, node2.name)
					continue;

				# old ... while the clique has grown this generation...
				clique = @expand_clique( [node1.name, node2.name ], node1) # while c != clique.length

				# if somehow the clique is tiny, nay bother
				if clique.length < 2
					continue;
				
				# add this clique to th clique list
				cliques.push(clique.slice())
				#cmax = Math.max( clique.length, cmax )

				# add the clique members to incl list - reduces checking complexity from O(N^2) to O(N) or less
				incl = @add_incl(incl, clique)
		
		console.timeEnd(@graph.edges.length)
		# cs = [ c.length for c in cliques ]
		# console.log cmax, cliques.length, cs.join()

		rcl = []
		ms = 0
		mc = false
		for i, c of cliques
			if c.length <= 2 then continue
			rcl[i] = []
			rcl[i].push(@graph.get(j)) for j in c
			if c.length > ms
				ms = c.length
				mc = c

		rcl.sort( (a,b) -> (if a.length < b.length then 1 else -1) )
		return { max: mc, all: rcl }

	add_incl: ( incl, clique ) ->
		for i in [0...clique.length]
			do(i) ->
			incl[ clique[i] ] ?= []
			incl[ clique[i] ][ clique[j] ] = true for j in [i...clique.length]
		return incl

	in_cliques: (incl, n1, n2) ->
		# the "or" here allows the add_incl list to only add to incl[n1], reducing time by a factor of upto n
		return (incl[n1]? and incl[n1][n2]?) or (incl[n2]? and incl[n2][n1]?)

	expand_clique: (common, node1) ->
		#common = clique.concat()

		for n2 in node1.nodes
			do(n2) ->
			k2 = n2.name

			if (k2 in common)
				continue
			
			count = 0
			(if (@graph.connected(@graph.get(k3),n2)) or (k3 == k2) then count++) for k3 in common

			if count >= common.length
				common.push k2

		return common

this.Clique = Clique