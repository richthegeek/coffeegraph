class Edge
	constructor: (n1,n2) ->
		@source = n1
		@target = n2

	has: (node) -> (return (@source is node) or (@target is node))

	other: (node) -> (return (if (@source is node) then @target else @source))

	toString: () -> return @source.name+@target.name

this.Edge = Edge