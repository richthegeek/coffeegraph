# Handles the render abstraction, making sure that events don't go to "dead" render
# objects (prior to garbage collection, through some odd chain of switching, or some
# other random bug).
#
# Also removes the requirements from render objects to extend the EventDriver but
# adds a requirement to have various methods if it is required that elements are
# deleted from the canvas (in the case of iteration-persistent renders, eg Raphael)
#
#
# To add a new render mode see the "select" method
class Render
	constructor: (graph) ->
		@graph = graph
		@frameskip = 10
		
		@graph.bind("iteration", @draw)
		
		# pass through events
		@graph.bind('resize', () => @projector.resize )
		@graph.bind("add_node", (n) => if @projector.add_node? then @projector.add_node(n))
		@graph.bind("add_edge", (e) => if @projector.add_edge? then @projector.add_edge(e))
		@graph.bind("delete_node", (n) => if @projector.delete_node? then @projector.delete_node(n))
		@graph.bind("delete_edge", (n) => if @projector.delete_edge? then @projector.delete_edge(n))
		
	
	# switch the renderer between 2D/3D
	select: (name) ->
		name = name.toLowerCase()
		
		# if there are nodes, and the nodes have elements (where the canvas object is stored) and 
		# these objects have a "remove" method, then execute it on everything. This can be used
		# for renderers other than Raphael (Render2D) if required.
		if @graph.nodes.length and @graph.nodes[0].element? and @graph.nodes[0].element.remove?
			(n.element.remove(); delete n.element) for n in @graph.nodes when n.element?
			(n.label.remove(); delete n.label) for n in @graph.nodes when n.label?			
			(e.element.remove(); delete e.element) for e in @graph.edges when e.element?
		
		# if this is grown substantially use a switch.
		if name == "2d" or name == "raphael"
			@graph.is_3d = false
			@projector = new Render2D(@canvas, @graph)
		else
			@graph.is_3d = true
			@projector = new Render3D(@canvas, @graph)
	
	set_canvas: (name) ->
		@canvas = name	

	# pass the request to render to the projector.	
	draw: =>
		# only render 1/@frameskip frames, unless we are slowed in which case
		# draw all frames
		if @graph.slowed or @graph.paused or @graph.dragging or (@graph.iteration % @frameskip == 0)
			@projector.draw()

this.Render = Render