var t = graph = render = null;
var debug = true;
var fns = {}

var inf = function()
{

	t = new Testing()
	t.graph.render.canvas = 'canvas'
	
	t.toggle_3d()
	t.toggle_kamada()
	t.detect_resize()

	// console.log("Implanted/expected:", Math.ceil(Math.log(x)*2), Math.ceil(Math.log(x)))

	f = function()
	{
		div = ' > div'

		id1 = add_sidebar_box('Graph: Energy', 'graph') + div
		id2 = add_sidebar_box('Graph: Distribution', 'graph') + div
		id3 = add_sidebar_box('Graph: Edge Lengths', 'graph') + div
		id4 = add_sidebar_box('Graph: FPS', 'graph') + div


		register_graph(t, 'energy', id1, 10)
		register_graph(t, 'distribution', id2, 10)
		register_graph(t, 'edge_lengths', id3, 10)
		register_graph(t, 'fps', id4, 10)		
	}
	setTimeout(f,100)

	t.graph.bind("iteration", function(i) { console.log(i) })
	
	t.graph.bind("iteration", function( i )
	{
		if(t.graph.nodes.length == 0) return;
		if(i % 50) return;
		$.post( "draw.php", { graph: t.graph.format.asJSON(), i: i } )
	})
	
	t.graph.layout.loop()
	return;

	if( false )
	{
		console.profile()
		t.graph.layout.finite(50, true, true)
		console.profileEnd()

	}
	else if( false )
	{
		t.toggle_2d()
		t.graph.render.frameskip = 1
		t.graph.layout.loop(false)
	}

	test_clique = function(n,p)
	{

		t.graph.clear()

		t.data_random(n,p)

		cli = new Clique(t.graph)
		cliques = cli.detect_cliques()

		console.log(cliques.max.length)

		f = function() { cli.test(cliques.max.length+1); /*cli.test(cliques.max.length+1)*/ }
		setTimeout(f,50)

		return;

		t.toggle_2d()
		t.graph.layout.finite(n*30)
		t.graph.render.draw()


		f = function()
		{
			cols = ["000","0c0","00c","0cc", "c0c", "cc0"]
			for( var i in cliques.all )
			{
				if( i == cols.length ) break;

				for( var j in cliques.all[i] )
				{
					n = cliques.all[i][j]
					if(typeof(n['element']) == "undefined")
					{
						setTimeout(f,100)
						return
					}
					n.element.attr({fill:"#"+cols[i]})
				}
			}
			c = {}
			for( var i in t.graph.nodes ) c[t.graph.nodes[i].name] = false
			for( var i in cliques.max )
			{
				n = cliques.max[i]
				c[n] = true
				t.graph.get(n).element.attr({fill:"#c00"})
			}
			for( var i in t.graph.edges )
			{
				e = t.graph.edges[i]
				if( c[e.source.name] && c[e.target.name] )
					e.element.attr({stroke:"#c00", "stroke-width":2})
			}
		}
		setTimeout(f,10)
	}
	
	test_clique(30,0.5)
}

$(function ()
{
	setTimeout( inf, 500 )
})

