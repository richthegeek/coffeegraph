class Node
	constructor: (name) -> 
		@name = name
		@reset_position()
		@reset_forces()
		@nodes = []
		@edges = []
			
	reset_position: ->
		[ @x, @y, @z ] = [ Math.random() * 3, Math.random() * 3, Math.random() * 3 ]

	reset_forces: ->
		@fx = 0
		@fy = 0
		@fz = 0

	apply_plus: ( fx, fy, fz ) ->
		@fx += fx
		@fy += fy
		@fz += fz
	
	apply_minus: ( fx, fy, fz ) ->
		@fx += 0 - fx
		@fy += 0 - fy
		@fz += 0 - fz

	add_edge: (edge) ->
		if not (edge in @edges)
			@edges.push( edge )
			@nodes.push( edge.other(this) )

	delete_edge: (edge) ->
		node = edge.other(this)

		be = @edges.length
		bn = @nodes.length

		@nodes.splice(i,1) for i,n of @nodes when n is node
		@edges.splice(i,1) for i,e of @edges when e is edge


this.Node = Node