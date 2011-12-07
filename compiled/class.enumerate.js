(function() {
  var Subsets;
  Subsets = (function() {
    function Subsets() {
      this.cache = {};
    }
    Subsets.prototype.list = function(n, k) {
      var i, r, result;
      i = 0;
      r = [];
      this.precache_choose(n, k);
      while ((result = this.generate_subset(n, k, i++))) {
        if (result.length === k && result[0] > 0) {
          r.push(result);
        }
      }
      return r;
    };
    Subsets.prototype.choose = function(n, k) {
      var c;
      k = Math.min(k, n - k);
      if (k < 0) {
        return false;
      }
      if (k === 0) {
        return 1;
      }
      if (k === 1) {
        return n;
      }
      c = [n, k].join(",");
      if (typeof this.cache[c] === "undefined") {
        this.cache[c] = this.choose(n - 1, k) + this.choose(n - 1, k - 1);
      }
      return this.cache[c];
    };
    Subsets.prototype.precache_choose = function(n, k) {
      var ki, ni, _ref, _results;
      if (k === null || k === false || k === void 0) {
        k = n + 1;
      }
      _results = [];
      for (ki = 1, _ref = n + 2; 1 <= _ref ? ki <= _ref : ki >= _ref; 1 <= _ref ? ki++ : ki--) {
        _results.push((function() {
          var _ref2, _results2;
          _results2 = [];
          for (ni = ki, _ref2 = n + 2; ki <= _ref2 ? ni <= _ref2 : ni >= _ref2; ki <= _ref2 ? ni++ : ni--) {
            _results2.push(this.choose(ni, ki));
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    Subsets.prototype.generate_subset = function(n, k, i) {
      var b, high, low, offset, upper, zeros, _results;
      b = false;
      offset = 0;
      _results = [];
      while (true) {
        if (!b) {
          b = [];
        }
        upper = this.choose(n, k);
        if (i >= upper) {
          return false;
        }
        zeros = 0;
        low = 0;
        high = this.choose(n - 1, k - 1);
        while (i >= high) {
                    zeros++;
          low = high;
          high += this.choose(n - zeros - 1, k - 1);;
        }
        if (zeros + k > n) {
          return false;
        }
        b.push(offset + zeros + 1);
        if (k === 1) {
          return b.sort();
        }
        n -= zeros + 1;
        i -= low;
        offset += zeros + 1;
        _results.push(k--);
      }
      return _results;
    };
    Subsets.prototype.disjoint = function(a, b) {
      var i, j, _ref, _ref2;
      for (i = 0, _ref = a.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        for (j = 0, _ref2 = b.length; 0 <= _ref2 ? j < _ref2 : j > _ref2; 0 <= _ref2 ? j++ : j--) {
          if (a[i] === b[j]) {
            return false;
          }
        }
      }
      return true;
    };
    return Subsets;
  })();
  this.Subsets = Subsets;
}).call(this);
