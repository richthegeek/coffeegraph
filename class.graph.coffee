class Graph extends EventDriver
	nodes: []
	edges: []

	clear: () ->
		# empty the graph properly (delete rendered elements)


		q = []
		q.push(n.name) for n in @nodes
		@remove(n) for n in q

		# empty the graph explicitly (insurance)
		@nodes = []
		@edges = []

	toString: ->
		output = []
		for n in @nodes
			do(n) ->
			nl = { name: n.name, x: n.x, y: n.y, z: n.z, edges: [] }
			edges.push(n2.name) for n2 in n.nodes
			output.push(nl)
		return JSON.stringify(output)

	asDot: ->
		text = []
		text.push("graph g {")
		text.push('\t"'+e.source.name+'" -- "'+e.target.name+'";') for e in @edges
		text.push("}")

		return text.join("\n")

	fromDot: (data) ->
		@clear()

		lines = data.split("\n")
		names = []
		es = []

		for line in lines
			do(line) ->
			m = line.match(/[^a-z0-9]+([a-z0-9\.]*)/gi)

			if (not m?) or m.length < 2
				return;

			n1 = m[0].replace(/(\s|"|-)/gi,"")
			n2 = m[1].replace(/(\s|"|-)/gi,"")

			if n1 == "{" or n1 == "g" or n2 == "{" or n2 == "g"
				continue

			@connect(n1,n2)

		return true

	asJSON: (position = true) ->
		[nl,el] = [[],[]]

		if position then     nl.push({name:node.name, x: node.x, y: node.y, z: node.z}) for node in @nodes
		else                 nl.push(node.name) for node in @nodes
	
		el.push([edge.source.name, edge.target.name]) for edge in @edges
		return JSON.stringify({ nodes: nl, edges: el })

	fromJSON: (data) ->

		if typeof(data) == "string"
			data = JSON.parse(data)
		
		@clear()

		for node in data.nodes
			do(node) ->
			if node.name?
				n = new Node(node.name)
				if(node.x?) 
					n.x = node.x
					n.y = node.y
					n.z = node.z
			else
				n = new Node(node)
			@add_node(n)

		for edge in data.edges
			do(edge) ->
			@connect(edge[0], edge[1])
	
		return true

	fromGraphML: (data) -> return @fromXML(data, 'from', 'to')
	asGraphML: () ->
		data = []
		data.push('<?xml version="1.0" encoding="UTF-8"?>')
		data.push('<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">')
		data.push('<graph id="G" edgedefault="undirected">')
		
		data.push('\t<node id="'+node.name+'" />') for node in @nodes
		data.push('\t<edge id="e'+i+'" from="'+edge.source.name+'" to="'+edge.target.name+'" />') for i, edge of @edges when edge.source?
		
		data.push('</graph>');
		data.push('</graphml>')
		return data.join("\n")


	fromGXL: (data) -> return @fromXML(data, 'source', 'target')
	asGXL: () ->
		data = []
		data.push('<?xml version="1.0" encoding="UTF-8"?>')
		data.push('<!DOCTYPE gxl SYSTEM "http://www.gupro.de/GXL/gxl-1.0.dtd">')
		data.push('<gxl xmlns:xlink=" http://www.w3.org/1999/xlink">')
		data.push('<graph id="G" edgemode="undirected" >');
		
		data.push('\t<node id="'+node.name+'" />') for node in @nodes
		data.push('\t<edge id="e'+i+'" source="'+edge.source.name+'" target="'+edge.target.name+'" />') for i, edge of @edges when edge.source?
		
		data.push('</graph>');
		data.push('</gxl>')
		return data.join("\n")
	

	fromXML: (data,s,t) ->
		if typeof(data) == "string" then data =$(data)
		if not s?
			a = data.find('edge')[0].attributes
			if a.length < 3
				return false
			s = a[1].name
			t = a[2].name
		@clear()
		graph = this
		data.find('node').each( () -> graph.add_node(new Node($(this).attr('id'))) )
		data.find('edge').each( () -> graph.connect($(this).attr(s), $(this).attr(t)) )

		return true

	
	load_energy: () -> @energy ?= new Energy(this); return @energy

	# insert a new node
	add: (name) ->
		# reset iteration counter
		@iteration = 0

		# if we're passed an object, just insert it
		if typeof name == "object"
			if typeof(name.name) == "undefined"
				console.log(name)
				throw name

			return @add_node(name)

		# if the node doesn't exist, add and return it
		if not @exists name			
			n = new Node(name)
			@nodes.push n
			if @render? then @render.trigger("add_node", n)
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

		if @render? then @render.trigger("delete_node", node)

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

			if @render? then @render.trigger("add_edge", e)
		else
			console.log("already connected", n1.name, n2.name)


	disconnect: (n1, n2) -> @disconnect_edge edge for edge in n1.edges when edge? and edge.has(n2)


	disconnect_edge: (edge) ->
		if @render? then @render.trigger("delete_edge", edge)

		edge.source.delete_edge(edge)
		edge.target.delete_edge(edge)
		@edges.splice(i,1) for i,e of @edges when (e.has(edge.source) and e.has(edge.target)) or e is edge


	get: (name) -> (return node for node in @nodes when node.name == name)

	exists: (name) -> (return @nodes.some (node) -> (node.name is name))

	connected: (n1, n2) -> (return n2.nodes.some (node) -> (node is n1))

	distance: (n1, n2) ->
		if not n1? or not n2?
			console.log "not n1/not n2 :("
			return
		
		# set is_3d
		@is_3d ?= false

		# call the relevant function
		return (if @is_3d then @distance_3d else @distance_2d)(n1,n2)

	# rand flag is for use with the renderer
	distance_3d: (n1, n2, rand = true) ->
		[dx, dy, dz] = [ n2.x - n1.x, n2.y - n1.y, n2.z - n1.z ]

		d2 = (dx*dx) + (dy*dy) + (dz*dz)
		
		if d2 < 0.01 and rand == true
			x = () -> Math.random() * 0.1 + 0.1
			[dx, dy, dz] = [ x(), x(), x() ]
			d2 = (dx*dx) + (dy*dy) + (dz*dz)
		
		return [ d2, dx, dy, dz ]

	distance_2d: (n1, n2) ->
		[dx, dy] = [ n2.x - n1.x, n2.y - n1.y ]

		d2 = (dx*dx) + (dy*dy)
		
		if d2 < 0.01
			x = () -> Math.random() * 0.1 + 0.1
			[dx, dy] = [ x(), x() ]
			d2 = dx*dx + dy*dy
		
		return [ d2, dx, dy, 1 ] # dz changed from 0 -> 1, to allow PD in KK

	# using the Floyd-Warshall algorithm 'cos I'm hardcore like that
	# ported from networkX code
	# O(n2) + O(n3) - luckily only run once
	# tested + working on a cube
	shortest_paths: ->
		@paths = {}

		# initialisation
		for u in @nodes
			do(u) ->
			@paths[u.name] = {}
			@paths[u.name][v.name] = Infinity for v in @nodes # distance to nodes in general = Inf (calculated in cube loop)
			@paths[u.name][v.name] = 1 for v in u.nodelist() # distance to nodes directly connected to u = 1
			@paths[u.name][u.name] = 0 # distance to self = 0

		# here comes the paaaiiinnn	
		for w in @nodes
			for u in @nodes when w != u
				for v in @nodes when v != u
					@paths[u.name][v.name] = Math.min(@paths[u.name][v.name], (@paths[u.name][w.name] + @paths[w.name][v.name]))

		return @paths

this.Graph = Graph
