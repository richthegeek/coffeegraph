class Linegraph
	# linegraph constructor 
	#	- optional input: canvas element/ID/selector
	#	- optional input: array of data points to init from
	#	- optional input: style structure
	constructor: (canvas, data, style) ->
		@auto_draw = true

		@style = {}
		@style.background = { "stroke": 0 }
		@style.axis = { x: {}, y: {} }
		@style.axis.x.grid  = false #{ stroke: "#000", "stroke-width": 0.1, step: 30 }
		@style.axis.y.grid = { stroke: "#000", "stroke-width": 0.1, step: 30 }
		@style.line = { stroke: "#248", "stroke-width": "2px", min: { stroke: "#842", "stroke-width": "2px" }, max: { stroke: "#000", "stroke-width": "2px" } }

		@data = {}
		@data.points = {}
		@data.points._length = 0
		@data.scale = {}
		@data.info = {}

		@stack = []

		if canvas? then @set_canvas(canvas)
		if data? then (@add(d) for d in data)
		if style? then (@style[k] = v for k,v of style)
		

	# set_canvas - sets the canvas element and updates the width/height
	#	- input can be either a DOM element, a jQuery element, an ID string, or a selector string
	set_canvas: (canvas) ->
		if typeof(canvas) == "string"
			if jQuery?
				canvas = $(canvas)[0]
				w = $(canvas).width()
				h = $(canvas).height()
			else
				canvas = document.getElementById(canvas)
				w = canvas.clientWidth
				h = canvas.clientHeight

		if (not canvas?) or (canvas.length? and canvas.length == 0)
			return false

		@canvas = { element: canvas, width: w, height: h }
		@canvas.raphael = new Raphael(@canvas.element, @canvas.width, @canvas.height)

		return @canvas


	# add a number to an optional dataset
	add: (number, dataset = 0) ->
		if not @data.points[dataset]?
			@data.points[dataset] = [number]
			@data.points._length  += 1
			@data.scale[dataset]  = {x: 5, y:@canvas.height / number}
			@data.info[dataset]   = {max: number, name: "Set " + dataset, min: Math.min(0, number) }
		else
			@data.points[dataset].push(number)
			@data.points[dataset] = @data.points[dataset].slice(0 - (@canvas.width / 5))
			omax = @data.info[dataset].max
			nmax = 0
			nmax = Math.max(y,nmax) for y in @data.points[dataset]
			if Math.abs(nmax - omax) > (nmax / 50) then nmax -= 0.5*(nmax - omax)
			@data.info[dataset].max = nmax
			@data.scale[dataset].y  = 0.95 * @canvas.height / @data.info[dataset].max

		if @auto_draw
			@draw()


	draw: () ->

		if not @graph?
			@draw_outer()

		scale = 99999
		scale = Math.min(v.y, scale) for k, v of @data.scale

		for k,v of @data.points
			do(k,v) ->

			if k == "_length"
				continue

			[x,path] = [0, ["M",0, @canvas.height - (scale * v[0]) ]]
			path.push("L", (x += @data.scale[k].x) - @data.scale[k].x, @canvas.height - (y * scale)) for y in v
			path = path.join(" ")

			if path.match(/NaN/)
				continue

			if @data.info[k].line?
				@data.info[k].line.attr("path",path)
			else
				if @style.line[k]?
					style = @style.line[k]
				else if @style.line.length?
					style = @style.line[0]
				else
					style = @style.line

				@data.info[k].line = @canvas.raphael.path(path).attr(style)
	
	draw_outer: () ->
		# draw background
		@canvas.raphael.rect(0,0, @canvas.width, @canvas.height).attr(@style.background)

		# draw grids
		if @style.axis.x.grid
			[x,p] = [0,[]]
			p.push("M",x,0,"L",x,@canvas.height) while (x += @style.axis.x.grid.step) < @canvas.width
			@canvas.raphael.path(p).attr(@style.axis.x.grid)

		if @style.axis.y.grid
			[y,p] = [0,[]]
			p.push("M",0,y,"L",@canvas.width,y) while (y += @style.axis.y.grid.step) < @canvas.height
			@canvas.raphael.path(p).attr(@style.axis.y.grid)
		
		@graph = true

		return

this.Linegraph = Linegraph