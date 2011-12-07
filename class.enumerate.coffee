class Subsets
	constructor: ->
		@cache = {}
		
	list: (n, k) ->
		i = 0
		r = []
		
		@precache_choose(n, k)
		
		while (result = @generate_subset(n, k, i++))
			if(result.length == k && result[0] > 0)
				r.push(result)
		
		return r;
	
	choose: (n, k) ->
		k = Math.min(k, n-k)
		
		if k < 0 then return false
		
		if k == 0 then return 1
		if k == 1 then return n
		
		c = [n,k].join(",")
		
		if typeof(@cache[c]) == "undefined"
			@cache[c] = @choose(n-1, k) + @choose(n-1, k-1)
		
		return @cache[c]
		
	precache_choose: (n, k) ->
		if k == null || k == false || k == undefined
			k = n+1
		
		for ki in [1..(n+2)]
			for ni in [ki..(n+2)]
				@choose(ni, ki)
				
	generate_subset: (n, k, i) ->
		b = false
		offset = 0
		
		while true
			if not b
				b = []
				
			upper = @choose(n, k)
			if i >= upper
				return false;
				
			zeros = 0
			low = 0
			high = @choose(n-1, k-1)
			
			(zeros++; low = high; high += @choose(n - zeros - 1, k-1)) while i >= high
			
			if zeros + k > n
				return false
			
			b.push(offset + zeros + 1)
			
			if k == 1
				return b.sort()
			
			n -= zeros + 1
			i -= low
			offset += zeros + 1
			k--
			
	disjoint: (a, b) ->
		for i in [0...a.length]
			for j in [0...b.length]
				if a[i] == b[j]
					return false
		return true
		
this.Subsets = Subsets