class Exporters
	constructor: (graph) ->
		@graph = graph

	toString: ->
		output = []
		for n in @graph.nodes
			do(n) ->
			nl = { name: n.name, x: n.x, y: n.y, z: n.z, edges: [] }
			edges.push(n2.name) for n2 in n.nodes
			output.push(nl)
		return JSON.stringify(output)

	asDot: ->
		text = []
		text.push("graph g {")
		text.push('\t"'+e.source.name+'" -- "'+e.target.name+'";') for e in @graph.edges
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

			@graph.connect(n1,n2)

		return true

	asJSON: (position = true) ->
		[nl,el] = [[],[]]

		if position then     nl.push({name:node.name, x: node.x, y: node.y, z: node.z}) for node in @graph.nodes
		else                 nl.push(node.name) for node in @graph.nodes
	
		el.push([edge.source.name, edge.target.name]) for edge in @graph.edges
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
			@graph.add_node(n)

		for edge in data.edges
			do(edge) ->
			@graph.connect(edge[0], edge[1])
	
		return true

	fromGraphML: (data) -> return @fromXML(data, 'from', 'to')
	asGraphML: () ->
		data = []
		data.push('<?xml version="1.0" encoding="UTF-8"?>')
		data.push('<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">')
		data.push('<graph id="G" edgedefault="undirected">')
		
		data.push('\t<node id="'+node.name+'" />') for node in @graph.nodes
		data.push('\t<edge id="e'+i+'" from="'+edge.source.name+'" to="'+edge.target.name+'" />') for i, edge of @graph.edges when edge.source?
		
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
		
		data.push('\t<node id="'+node.name+'" />') for node in @graph.nodes
		data.push('\t<edge id="e'+i+'" source="'+edge.source.name+'" target="'+edge.target.name+'" />') for i, edge of @graph.edges when edge.source?
		
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
		data.find('node').each( () -> @graph.add_node(new Node($(this).attr('id'))) )
		data.find('edge').each( () -> @graph.connect($(this).attr(s), $(this).attr(t)) )

		return true
		
this.Exporters = Exporters