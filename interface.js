$( function()
{
	$("#toolbar li").click( function(e)
	{
		$(this).blur()


		cn = $(this).attr("fn")
		for( var i in t )
			if( i == cn )
				t[i]()
				return

		for( var i in fns )
			if( i == cn )
				fns[cn](t,e)
				return
	})

	$("#sidebar").delegate("li b", "click", function()
	{
		// $(this).parent().children("div").slideToggle(500)
		$(this).parent().toggleClass("closed")
	})

	$("#imex input").click( function()
	{
		format = $("#imex select").val()
		dir    = $(this).attr("class")

		if( dir == "import-button" )
		{
			fn = "from" + format
			data = $("#imex textarea").val()

			w3d = false
			if( t.graph.is_3d )
			{
				t.toggle_2d()
				w3d = true
			}

			t.graph[fn].call(t.graph, data)

			if( w3d ) t.toggle_3d()

		}
		else
		{
			fn = "as" + format

			$("#imex textarea").val( t.graph[fn].call(t.graph) )
		}
	})
})

var graphs = []

function add_sidebar_box(title, content)
{
	id = "b" + Math.ceil(Math.random() * 1000)
	if( content.match(/^graph.*/i) ) content = "<span class='stats'></span><div class='graph'></div>";
	html = "<li><b>" + title + "</b><div id='"+id+"'>" + content + "</div></li>"
	$("#sidebar").append(html)
	return "#" + id
}

function register_graph(t, fn, canvas, frameskip)
{

	f = function(i)
	{	
		if(t.render.paused) i += Math.round(Math.random() * 100)
		if( i % this.frameskip || t.paused ) return;

		if(typeof(t.graph) == "undefined")
			return;

		if(typeof(t.graph.energy) == "undefined")
			t.graph.energy = new Energy(t.graph)

		d = t.graph.energy[fn](this.frameskip)

		if( !d ) return;

		if( $(this.canvas.element).find(":visible").length )
		{
			for( var i in this.stack )
				this.add( this.stack[i][0], this.stack[i][1] )
			
			te = []
			for( var i in d )
			{
				this.add(d[i], i)
				te.push( "<b>"+i+"</b><span>"+(Math.round(d[i]*100)/100).toString()+"</span>" )
			}

			$(this.canvas.element).parent().find(".stats").html(te.join(""))
			
			this.stack = []
			
			this.draw()
		}
		else
		{
			for( var i in d )
				this.stack.push([ d[i], i ])
		}
	}

	if( typeof(frameskip) == 'undefined' || frameskip == null )
		frameskip = 10

	if( typeof(t.graph.energy) == "undefined" )
		t.graph.energy = new Energy(t.graph)

	l = new Linegraph(canvas)
	l.auto_draw = false
	l.frameskip = frameskip

	t.graphs.push([f,l])
	// t.bind('iteration', f, l)
}