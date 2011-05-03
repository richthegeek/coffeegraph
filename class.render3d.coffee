class Render3D extends EventDriver
	iteration: 0
	constructor: (canvas, @graph) ->
		if canvas then @set_canvas(canvas)

		@graph.render = this
		@graph.is_3d = true

		@data = { radius: 600, t: 45, ot: 45, p: 45, op: 45, ox: 0, oy: 0, oe: false }


		@scene = new THREE.Scene();

		@renderer = new THREE.CanvasRenderer()
		@renderer.setSize( @canvas_width, @canvas_height )
		@canvas_dom.appendChild( @renderer.domElement )

		@materials = {
			node: new THREE.ParticleCircleMaterial( {color: 0x444444, opacity: 1} )
			targ: new THREE.ParticleCircleMaterial( {color: 0x000000, opacity: 0.05} )
			edge: new THREE.LineBasicMaterial( {color: 0x888888, opacity: 0.5, linewidth: 1 } )
		}

		@target = new THREE.Particle( @materials.targ )
		@target.scale.x = @target.scale.y = 5
		@target.matrixAutoUpdate = true
		@scene.addObject @target

		@camera = new THREE.Camera( 60, @canvas_width/@canvas_height, 1, 10000, @target )
		@camera_update()

		@canvas_dom.addEventListener( 'mousedown', @mousedown, false )
		@canvas_dom.addEventListener( 'mouseup', @mouseup, false )		
		@canvas_dom.addEventListener( 'mousemove', @mousemove, false )
		
		document.addEventListener( 'mousewheel', @zoom, false )
		document.addEventListener( 'DOMMouseScroll', @zoom, false )
		
		@bind('resize',@resize)
		@bind('delete_edge', @delete_edge )
		@bind('delete_node', @delete_node )

	resize: (e) =>
		@set_canvas( @canvas )
		@camera = new THREE.Camera( 60, @canvas_width / @canvas_height, 1, 10000, @target )
		
		@renderer.setSize( @canvas_width, @canvas_height )
		@canvas_dom.appendChild( @renderer.domElement )

		@camera_update()

	delete_edge: (e) =>
		if typeof(e) != "undefined" and typeof(@objects) != "undefined" and typeof(@objects[ e.source.name + "_" + e.target.name + "l" ]) != "undefined"
			@scene.removeObject( @objects[ e.source.name + "_" + e.target.name + "l" ])

	delete_node: (e) =>
		if typeof(e) != "undefined" and typeof(@objects) != "undefined" and typeof(@objects[ e.name ]) != "undefined"
			@scene.removeObject( @objects[ e.name ] )
		

	mousedown: (e) =>
		e.preventDefault()
		[ @data.oe, @data.ot, @data.op, @data.ox, @data.oy ] = [ true, @data.t, @data.p, e.clientX, e.clientY ]

	mouseup: (e) =>
		@data.oe = false

	mousemove: (e) =>
		e.preventDefault()

		if @data.oe
			@data.t = 0 - ( (e.clientX - @data.ox) * 0.5 ) + @data.ot
			
			@data.p = ( (e.clientY - @data.oy) *0.5 ) + @data.op
			if @data.p > 180 then @data.p -= 300
			if @data.p < -180 then @data.p += 300

			@draw()

	zoom: (e) =>
		e.preventDefault()
		d = (if e.wheelDelta? then e.wheelDelta else e.detail * 40 )
		@data.radius = Math.max( @data.radius - d, 100 )
		@camera_update()
		@camera.updateMatrix()
		
		@draw()

	render: ->
		@camera_update()
		@renderer.render( @scene, @camera )

	set_canvas: (@canvas) ->
		if typeof @canvas is 'string'
			@canvas = document.getElementById(canvas)

		if @canvas? then $(@canvas_dom).empty()
		
		@canvas_dom = @canvas
		@canvas_width = @canvas.clientWidth
		@canvas_height = @canvas.clientHeight

	camera_update: ->
		# convert phi/theta to degrees using mp3
		mp3 = Math.PI / 360

		if @objects?
			# set the target
			[xa,ya,za,c] = [0,0,0, @graph.nodes.length]

			for n in @graph.nodes
				do(n) =>
				o = @objects[ n.name ]
				if typeof(o) == "undefined" then continue
				o = o.position
				[xa,ya,za] = [xa + (o.x/c), ya + (o.y/c), za + (o.z/c)]

			[@target.position.x, @target.position.y, @target.position.z] = [xa,ya,za]

		@camera.position.x = @data.radius * Math.sin( @data.t * mp3 ) * Math.cos( @data.p * mp3 )
		@camera.position.y = @data.radius * Math.sin( @data.p * Math.PI / 360 )
		@camera.position.z = @data.radius * Math.cos( @data.t * mp3 ) * Math.cos( @data.p * mp3 )

		@camera.target.updateMatrix()
		@camera.updateMatrix()


	draw: ->
		# holds all objects
		@objects ?= {}

		for n in @graph.nodes
			do(n) =>
			if not @objects[n.name]
				par = new THREE.Particle( @materials.node )
				par.matrixAutoUpdate = true
				@objects[n.name] = par
				@scene.addObject   par
			else
				par = @objects[n.name]
			
			[ par.position.x, par.position.y, par.position.z ] = [ n.x, n.y, n.z ]
			par.position.multiplyScalar 40
			
			par.scale.x = par.scale.y = par.scale.z = Math.sqrt(@data.radius) / 12

			par.updateMatrix()

		@iteration ?= 0
		@i ?= 1

		@cube ?= new Cube(1,1,1)
		for e in @graph.edges
			do(e) =>

			par1 = @objects[e.source.name]
			par2 = @objects[e.target.name]
		
			en = e.source.name+"_"+e.target.name
			enl = en + "l"
			# if the edge has not previously been added to the graph, create the object
			if not @objects[en]?
				geo = new THREE.Geometry()
				geo.vertices.push new THREE.Vertex par1.position
				geo.vertices.push new THREE.Vertex par2.position
				@objects[en] = geo

				line = new THREE.Line( geo, @materials.edge )
				line.matrixAutoUpdate = true
				@objects[enl] = line
				@scene.addObject line

			# update the geometry objects (and thus the line) positions
			geo = @objects[en]
			[ geo.vertices[0].position.x, geo.vertices[0].position.y, geo.vertices[0].position.z ] = [ par1.position.x, par1.position.y, par1.position.z ]
			[ geo.vertices[1].position.x, geo.vertices[1].position.y, geo.vertices[1].position.z ] = [ par2.position.x, par2.position.y, par2.position.z ]

		# console.log "draw"
		@render()

window.Render3D = Render3D