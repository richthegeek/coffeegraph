class Mixed

	constructor: (graph) ->
		@graph = graph
		@kamada = new KamadaKawai(graph)
		@spring = new Spring(graph)

	prepare: () ->
		@spring.prepare()
		@kamada.prepare()

	iterate: () ->
		if @graph.iteration < (@graph.nodes.length)
			@kamada.iterate() for i in [1..10]
		@spring.iterate()

this.Mixed = Mixed