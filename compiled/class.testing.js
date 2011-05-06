(function() {
  var Testing;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Testing = (function() {
    Testing.detect = false;
    function Testing() {
      this.graphs = [];
      this.graph = new Graph();
    }
    Testing.prototype.update_graphs = function(i) {
      var g, _i, _len, _ref, _results;
      if (typeof this.graphs === "undefined") {
        return;
      }
      _ref = this.graphs;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        g = _ref[_i];
        _results.push(g[0].apply(g[1], [i]));
      }
      return _results;
    };
    Testing.prototype.algorithm = function(algo) {
      this.algo = algo;
      return this.graph.layout.select(this.algo);
    };
    Testing.prototype.renderer = function(rendermode) {
      this.rendermode = rendermode;
      if (this.graph.render.projector != null) {
        $(this.graph.render.projector.canvas_dom).empty();
      }
      this.graph.render.select(this.rendermode);
      this.toggle_slow(false);
      return this.toggle_pause(false);
    };
    Testing.prototype.detect_resize = function() {
      this.detect = true;
      return document.body.onresize = __bind(function() {
        return this.graph.trigger("resize");
      }, this);
    };
    Testing.prototype.toggle_slow = function(swap) {
      if (swap == null) {
        swap = true;
      }
      if (!(this.graph.slowed != null)) {
        this.graph.slowed = false;
      }
      if (!swap) {
        this.graph.slowed = !this.graph.slowed;
      }
      if (this.graph.slowed) {
        this.graph.slowed = false;
        return $(".toggle_slow").removeClass("active");
      } else {
        this.graph.slowed = true;
        return $(".toggle_slow").addClass("active");
      }
    };
    Testing.prototype.toggle_pause = function(swap) {
      var _base, _ref;
      if (swap == null) {
        swap = true;
      }
      (_ref = (_base = this.graph).forced_pause) != null ? _ref : _base.forced_pause = false;
      if (!swap) {
        this.graph.forced_pause = !this.graph.forced_pause;
      }
      if (this.graph.forced_pause) {
        this.graph.forced_pause = false;
        $(".toggle_pause").removeClass("active");
      } else {
        this.graph.forced_pause = true;
        $(".toggle_pause").addClass("active");
      }
      return this.graph.paused = this.graph.forced_pause;
    };
    Testing.prototype.toggle_2d = function() {
      $(".toggle_2d").addClass("active");
      $(".toggle_3d").removeClass("active");
      return this.renderer('2d');
    };
    Testing.prototype.toggle_3d = function() {
      $(".toggle_3d").addClass("active");
      $(".toggle_2d").removeClass("active");
      return this.renderer('3d');
    };
    Testing.prototype.toggle_spring = function() {
      $(".toggle_spring").addClass("active");
      $(".toggle_kamada").removeClass("active");
      return this.algorithm('spring');
    };
    Testing.prototype.toggle_kamada = function() {
      $(".toggle_spring").removeClass("active");
      $(".toggle_kamada").addClass("active");
      return this.algorithm('kamada');
    };
    Testing.prototype.clear_graph = function() {
      return this.graph.clear();
    };
    Testing.prototype.cliqueify = function() {
      var i, n1, n2, _fn, _ref, _results;
      _ref = this.graph.nodes;
      _fn = function(n1) {};
      _results = [];
      for (i in _ref) {
        n1 = _ref[i];
        _fn(n1);
        _results.push((function() {
          var _i, _len, _ref, _results;
          _ref = this.graph.nodes.slice(i);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            n2 = _ref[_i];
            _results.push(this.graph.connect(n1, n2));
          }
          return _results;
        }).call(this));
      }
      return _results;
    };
    Testing.prototype.add_random_edge = function(r1) {
      var i, j, ls, ti;
      ls = this.graph.nodes;
      i = this.graph.nodes.length;
      if (this.graph.edges.length >= (i * (i - 1) * 0.5)) {
        return;
      }
      while (i-- > 0) {
        __bind(function() {}, this)();
        j = Math.floor(Math.random() * (i + 1));
        ti = ls[i];
        ls[i] = ls[j];
        ls[j] = ti;
      }
      r1 = ls[0];
      j = 1;
      while ((typeof ls[j] !== void 0) && this.graph.connected(r1, ls[j])) {
        j++;
      }
      if ((ls[j] != null) && typeof ls[j] !== "undefined") {
        return this.graph.connect(r1, ls[j]);
      }
    };
    Testing.prototype.delete_random_edge = function() {
      if (this.graph.edges.length === 0) {
        return true;
      }
      return this.graph.disconnect_edge(this.random_of(this.graph.edges));
    };
    Testing.prototype.add_random_node = function(e) {
      var n;
      n = new Node("rn" + Math.random());
      return this.add_random_edge(this.graph.add(n));
    };
    Testing.prototype.delete_random_node = function() {
      return this.graph.remove_node(this.random_of(this.graph.nodes));
    };
    Testing.prototype.data_reset = function() {
      var node, x, _i, _len, _ref, _ref2, _results;
      x = function() {
        return Math.random() * 5;
      };
      _ref = this.graph.nodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        _results.push((_ref2 = [x(), x(), x()], node.x = _ref2[0], node.y = _ref2[1], node.z = _ref2[2], _ref2));
      }
      return _results;
    };
    Testing.prototype.data_loop = function(num, offset) {
      var i;
      if (num == null) {
        num = null;
      }
      if (offset == null) {
        offset = 0;
      }
      num != null ? num : num = parseInt(prompt("Number of nodes in loop [3-inf]", 10));
      num = num + offset - 2;
      for (i = offset; (offset <= num ? i <= num : i >= num); (offset <= num ? i += 1 : i -= 1)) {
        this.graph.connect("a" + i, "a" + (i + 1));
      }
      return this.graph.connect("a" + i, "a" + offset);
    };
    Testing.prototype.data_grid = function(w, h) {
      var x, y, _fn, _results;
      if (w == null) {
        w = null;
      }
      if (h == null) {
        h = null;
      }
      w != null ? w : w = parseInt(prompt("Grid width", 10));
      h != null ? h : h = parseInt(prompt("Grid height", w));
      this.graph.add("x1y1");
      _fn = function(x) {};
      _results = [];
      for (x = 1; (1 <= w ? x <= w : x >= w); (1 <= w ? x += 1 : x -= 1)) {
        _fn(x);
        _results.push((function() {
          var _fn, _results;
          _fn = function(y) {};
          _results = [];
          for (y = 1; (1 <= h ? y <= h : y >= h); (1 <= h ? y += 1 : y -= 1)) {
            _fn(y);
            if (x < w) {
              this.graph.connect("x" + x + "y" + y, "x" + (x + 1) + "y" + y);
            }
            _results.push(y < h ? this.graph.connect("x" + x + "y" + y, "x" + x + "y" + (y + 1)) : void 0);
          }
          return _results;
        }).call(this));
      }
      return _results;
    };
    Testing.prototype.data_grid_3d = function(w, h, d) {
      var x, y, z, _fn, _results;
      if (w == null) {
        w = null;
      }
      if (h == null) {
        h = null;
      }
      if (d == null) {
        d = null;
      }
      w != null ? w : w = parseInt(prompt("Grid width", 10));
      h != null ? h : h = parseInt(prompt("Grid height", w));
      d != null ? d : d = parseInt(prompt("Grid depth", w));
      _fn = function(x) {};
      _results = [];
      for (x = 1; (1 <= w ? x <= w : x >= w); (1 <= w ? x += 1 : x -= 1)) {
        _fn(x);
        _results.push((function() {
          var _fn, _results;
          _fn = function(y) {};
          _results = [];
          for (y = 1; (1 <= h ? y <= h : y >= h); (1 <= h ? y += 1 : y -= 1)) {
            _fn(y);
            _results.push((function() {
              var _fn, _results;
              _fn = function(z) {};
              _results = [];
              for (z = 1; (1 <= d ? z <= d : z >= d); (1 <= d ? z += 1 : z -= 1)) {
                _fn(z);
                if (x < w) {
                  this.graph.connect("p" + x + y + z, "p" + (x + 1) + y + z);
                }
                if (y < h) {
                  this.graph.connect("p" + x + y + z, "p" + x + (y + 1) + z);
                }
                _results.push(z < d ? this.graph.connect("p" + x + y + z, "p" + x + y + (z + 1)) : void 0);
              }
              return _results;
            }).call(this));
          }
          return _results;
        }).call(this));
      }
      return _results;
    };
    Testing.prototype.data_cube = function() {
      var a, b, c, v, _fn, _results;
      c = {
        "a": ["b", "d", "e"],
        "b": ["c", "f"],
        "c": ["d", "g"],
        "h": ["d", "g"],
        "e": ["f", "h"],
        "f": ["g"]
      };
      _fn = __bind(function(a) {}, this);
      _results = [];
      for (a in c) {
        v = c[a];
        _fn(a);
        _results.push((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = v.length; _i < _len; _i++) {
            b = v[_i];
            _results.push(this.graph.connect(a, b));
          }
          return _results;
        }).call(this));
      }
      return _results;
    };
    Testing.prototype.data_clique = function(size, offset) {
      var i;
      if (size == null) {
        size = null;
      }
      if (offset == null) {
        offset = 0;
      }
      size != null ? size : size = parseInt(prompt("Clique size", 6));
      if (size === 1) {
        return true;
      }
      for (i = 1; (1 <= size ? i <= size : i >= size); (1 <= size ? i += 1 : i -= 1)) {
        this.graph.connect("a" + (size + offset), "a" + (i + offset));
      }
      return this.data_clique(size - 1, offset);
    };
    Testing.prototype.data_kneser = function(n, k) {
      var i, j, s, _ref, _results;
      if (n == null) {
        n = 5;
      }
      if (k == null) {
        k = 2;
      }
      n != null ? n : n = parseInt(prompt("Set size", 5));
      k != null ? k : k = parseInt(prompt("Subset size", 2));
      this.graph.subsets = new Subsets();
      s = this.graph.subsets.list(n, k);
      _results = [];
      for (i = 0, _ref = s.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        _results.push((function() {
          var _ref, _ref2, _results;
          _results = [];
          for (j = _ref = i + 1, _ref2 = s.length; (_ref <= _ref2 ? j < _ref2 : j > _ref2); (_ref <= _ref2 ? j += 1 : j -= 1)) {
            _results.push(this.graph.subsets.disjoint(s[i], s[j]) ? this.graph.connect(s[i].join(), s[j].join()) : void 0);
          }
          return _results;
        }).call(this));
      }
      return _results;
    };
    Testing.prototype.random_of = function(ls) {
      return ls[Math.floor(Math.random() * ls.length)];
    };
    return Testing;
  })();
  window.Testing = Testing;
}).call(this);
