var t = graph = render = null;
var debug = true;
var fns = {}

var inf = function()
{

	t = new Testing()
	t.graph.render.canvas = 'canvas'
	
	t.toggle_spring()
	t.toggle_2d()
	t.detect_resize()


	// t.data_grid_3d(5,5,5)
	// t.data_cube()
	// t.data_clique(5)

	t.data_kneser(5,2)

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
	
	t.graph.layout.loop()
}

$(function ()
{
	setTimeout( inf, 500 )
})

