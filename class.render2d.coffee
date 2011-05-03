class Render2D extends EventDriver
	constructor: (canvas, @graph) ->
		if canvas then @set_canvas(canvas)

		@graph.render = this
		@graph.is_3d = false

		@styles = {}
		@styles.node = { fill: "#888", "stroke-color": 0, "stroke" : 0, "stroke-width" : 0, "r": 5, opacity: 1 }
		@styles.label = { opacity: 0.5, "font-family" : "Ubuntu" }
		@styles.edge = { "stroke-opacity": 0.5 }
		@styles.dragging = { fill: "#2C50A3", "r" : 5  }
		@styles.drag_over = { "stroke-width" : 10, "stroke" : "#2CA350", "r": 10 }
		@styles.drag_over_break = { "stroke-width" : 10, "stroke" : "#A3502C", "r": 10 }
		@styles.hover = { opacity: 0.5, r: 10 }

		@bind('resize',@resize)
		@bind('delete_edge', @delete_element )
		@bind('delete_node', @delete_element )

	set_canvas: (canvas) ->
		if typeof canvas is 'string'
			canvas = document.getElementById(canvas)

		if @canvas? then @canvas.clear()
		
		@canvas_dom = canvas
		@canvas_width = canvas.clientWidth - 50
		@canvas_height = canvas.clientHeight - 50
		@canvas = new Raphael( @canvas_dom, @canvas_width + 50, @canvas_height + 50 )

	resize: ->
		@canvas_width = @canvas_dom.clientWidth - 50
		@canvas_height = @canvas_dom.clientHeight - 50
		@canvas.setSize( @canvas_dom.clientWidth, @canvas_dom.clientHeight )

		console.log @canvas_width, @canvas_height, @canvas

	calculate_transform: ->
		[ lx, ly, mx, my ] = [ Infinity, Infinity, -Infinity, -Infinity ]
		[ lx, ly, mx, my ] = [ Math.min(lx,node.x), Math.min(ly,node.y), Math.max(mx,node.x), Math.max(my,node.y) ] for node in @graph.nodes

		@translate = x: 0 - lx, y: 0 - ly
		
		@scale = Math.min( @canvas_width / (mx + @translate.x), @canvas_height / (my + @translate.y) )

		[ node.cx, node.cy ] = [(node.x + @translate.x) * @scale, (node.y + @translate.y) * @scale] for node in @graph.nodes

		return { translate: @translate, scale: @scale }

	draw: ->
		@calculate_transform()
		@draw_edge(edge).element.attr("path", [ "M", edge.source.cx, edge.source.cy, "L", edge.target.cx, edge.target.cy ].join(" ") ).translate(25,25) for edge in @graph.edges
		@draw_node(node).element.attr( { "x": node.cx, "cx": node.cx, "y": node.cy, "cy": node.cy } ).translate(25,25).toFront() for node in @graph.nodes
		@draw_label(node).label.attr( { "x": node.cx, "cx": node.cx, "y": node.cy, "cy": node.cy } ).translate(35,35).toFront() for node in @graph.nodes

	draw_node: (node) ->
		if not node.element?
			node.element = @canvas.circle().attr( @styles.node ).drag(@drag_move, @drag_start, @drag_end)
			node.element.render = this
			node.element.data = node
			node.element.node.element = node.element # lolwut
			node.element.node.render = this

			node.element.node.onmouseover = () -> @render.hover_start(@)
			node.element.node.onmouseout = () -> @render.hover_end(@)
			
		return node
		
	draw_label: (node) ->
		if not node.label?
			node.label = @canvas.text( node.cx, node.cy, node.name ).attr( @styles.label )
		return node

	draw_edge: (edge) ->
		edge.element ?= @canvas.path().attr( @styles.edge )
		return edge

	delete_element: (el) ->
		if el.element? and el.element.remove?
			el.element.remove()
		if el.label?
			el.label.remove()

	hover_start: (o) ->
		if @dragging? and o.element.data.name != @dragging.data.name
			@hover = o
			if @graph.connected o.element.data, @dragging.data
				o.element.attr( @styles.drag_over_break )
			else
				o.element.attr( @styles.drag_over )
		else if not @dragging? and not @dragging
			o.element.attr( @styles.hover )

	hover_end: (o) ->
		@hover = null
		o.element.attr( @styles.node )

	drag_start: ->
		@ox = @attr("cx")
		@oy = @attr("cy")
		@attr( @render.styles.dragging )
		@render.paused = true
		@render.dragging = this

	drag_move: (dx, dy) ->
		[x,y] = [ @ox + dx - 15, @oy + dy - 15] # 15 is mouse offset (so it's not under the mouse, allowing hovering)

		# change dragged node style
		@attr( @render.styles.dragging )

		# if the hovered node (if any) is pretty much under the mouse, put the dragged node directly at it's position
		if @render.hover?
			@attr( { r: 0 } ) # effectively hide the element from the mouse
			x = @render.hover.element.attr("cx") - 25 # 25 is margin-offset
			y = @render.hover.element.attr("cy") - 25
		
		# transcale screen position to in-graph position
		@data.x = (x / @render.scale) - @render.translate.x
		@data.y = (y / @render.scale) - @render.translate.y
	
	drag_end: ->
		# are we hovered over another node?
		if @render.hover?
			# return node to it's original position
			@data.x = ((@ox - 25) / @render.scale) - @render.translate.x
			@data.y = ((@oy - 25) / @render.scale) - @render.translate.y
			
			n_from = @data
			n_to   = @render.hover.element.data

			console.log n_from, n_to

			# connect/disconnect node and hovered node
			if @render.graph.connected n_from, n_to
				@render.graph.disconnect n_from, n_to
			else
				@render.graph.connect n_from, n_to

		# if not force-paused, unpause
		if not(@render.fpaused? and @render.fpaused)
			@render.paused = null
		
		# unset dragging state, reset node style
		@render.dragging = null
		@attr( @render.styles.node )

this.Render2D = Render2D
