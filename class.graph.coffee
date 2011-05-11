class Graph extends EventDriver
	nodes: []
	edges: []
	
	constructor: ->
		@format = new Exporters(this)
		@energy = new Energy(this)
		@layout = new Layout(this)
		@render = new Render(this)
		@paused = false
		@dragging = false

	clear: () ->
		# empty the graph properly (delete rendered elements)

		q = []
		q.push(n.name) for n in @nodes
		@remove(n) for n in q

		# empty the graph explicitly (insurance)
		@nodes = []
		@edges = []

	# insert a new node
	add: (name) ->
		# reset iteration counter
		@iteration = 0

		# if we're passed an object, just insert it
		if typeof name == "object"
			if typeof(name.name) == "undefined"
				throw name

			return @add_node(name)

		# if the node doesn't exist, add and return it
		if not @exists name			
			n = new Node(name)
			@nodes.push n
			@trigger("add_node", n)
			return n

		# otherwise return the node that already has this name
		return @get(name)

	add_node: (node) ->
		if not @exists(node.name)
			@nodes.push node
			return node
		return node


	# remove a node based on it's name
	remove: (name) ->
		if typeof name == "object"
			node = name
			name = name.name
		else
			node = @get(name)

		@trigger("delete_node", node)

		be = @edges.length
		bn = @nodes.length

		@disconnect_edge(e) for e in node.edges.concat()
		@nodes.splice(i,1) for i,n of @nodes when n is node


	remove_node: (node) -> @remove(node.name)

	connect: (n1, n2) ->
		if n1 is n2
			return;

		# confirm n1 and n2 exist, this also means this functions accepts both Node and String types
		n1 = @add n1
		n2 = @add n2

		if not @connected n1, n2
			e = new Edge n1, n2
			@edges.push e

			# add other-node and edge to each node
			n1.edges.push e
			n1.nodes.push n2

			n2.edges.push e
			n2.nodes.push n1

			@trigger("add_edge", e)
			
			return e

	disconnect: (n1, n2) -> @disconnect_edge edge for edge in n1.edges when edge? and edge.has(n2)


	disconnect_edge: (edge) ->
		@trigger("delete_edge", edge)

		edge.source.delete_edge(edge)
		edge.target.delete_edge(edge)
		@edges.splice(i,1) for i,e of @edges when (e.has(edge.source) and e.has(edge.target)) or e is edge


	get: (name) -> (return node for node in @nodes when node.name == name)

	exists: (name) -> (return @nodes.some (node) -> (node.name is name))

	connected: (n1, n2) -> (return n2.nodes.some (node) -> (node is n1))

	distance: (n1, n2) ->
		if not n1? or not n2?
			return
		
		# set is_3d
		@is_3d ?= false

		# call the relevant function
		return (if @is_3d then @distance_3d else @distance_2d)(n1,n2)

	# rand flag is for use with the renderer
	distance_3d: (n1, n2, rand = true) ->
		dx = n2.x - n1.x
		dy = n2.y - n1.y
		dz = n2.z - n1.z
		d2 = (dx*dx) + (dy*dy) + (dz*dz)
		
		if d2 < 0.01 and rand
			dx = (Math.random() * 0.1) + 0.1
			dy = (Math.random() * 0.1) + 0.1
			dz = (Math.random() * 0.1) + 0.1
			d2 = (dx*dx) + (dy*dy) + (dz*dz)
		
		return [ d2, dx, dy, dz ] # dz changed from 0 -> 1, to allow PD in KK

	distance_2d: (n1, n2) ->
		dx = n2.x - n1.x
		dy = n2.y - n1.y
		d2 = (dx*dx) + (dy*dy)
		
		if d2 < 0.01
			dx = (Math.random() * 0.1) + 0.1
			dy = (Math.random() * 0.1) + 0.1
			d2 = dx*dx + dy*dy
		
		return [ d2, dx, dy, 1 ] # dz changed from 0 -> 1, to allow PD in KK

this.Graph = Graph
