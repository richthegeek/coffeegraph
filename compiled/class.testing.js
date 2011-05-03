(function() {
  var Testing;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Testing = (function() {
    __extends(Testing, EventDriver);
    Testing.detect = false;
    function Testing() {
      this.graphs = [];
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
      var f, jso, t;
      this.algo = algo;
      if ((this.graph != null) && (this.graph.nodes != null) && this.graph.nodes.length > 0) {
        jso = this.graph.asJSON(true);
        t = this.graph.is_3d.valueOf();
      }
      switch (this.algo) {
        case 'spring':
          this.graph = new Spring();
          break;
        case 'kamada':
          this.graph = new KamadaKawai();
          break;
        case 'siman':
          this.graph = new SimulatedAnnealing();
          break;
        default:
          alert("not a valid algorithm choice :(");
      }
      if (jso != null) {
        this.graph.fromJSON(jso);
        console.log(t);
        if (t === true) {
          f = __bind(function() {
            return this.toggle_3d();
          }, this);
        } else {
          f = __bind(function() {
            return this.toggle_2d();
          }, this);
        }
        setTimeout(f, 100);
      }
      this.graph.unbind('iteration');
      return this.graph.bind('iteration', this.update_graphs, this);
    };
    Testing.prototype.renderer = function(name) {
      var e, n, _i, _j, _len, _len2, _ref, _ref2;
      if ((!(this.canvas != null)) || (!(this.graph != null))) {
        return alert('no canvas and/or algorithm chosen...');
      }
      if (this.render != null) {
        $(this.render.canvas_dom).empty();
        if ((this.looping != null) && this.looping) {
          clearInterval(this.render.loop);
          clearTimeout(this.render.loop);
          this.render.loop = false;
          this.graph.loop = false;
        }
        this.render.events = this.render.contexts = {};
        if (this.detect) {
          this.detect_resize();
        }
        _ref = this.graph.nodes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          n = _ref[_i];
          delete n.element;
        }
        _ref2 = this.graph.edges;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          e = _ref2[_j];
          delete e.element;
        }
      }
      switch (name) {
        case '2d':
          this.render = new Render2D(this.canvas, this.graph);
          break;
        case 'raphael':
          this.render = new Render2D(this.canvas, this.graph);
          break;
        case '3d':
          this.render = new Render3D(this.canvas, this.graph);
          break;
        case 'three':
          this.render = new Render3D(this.canvas, this.graph);
          break;
        default:
          alert('not a valid renderer choice :(');
      }
      this.toggle_slow(false);
      this.toggle_pause(false);
      this.graph.iteration = 0;
      return this.graph.bind('iteration', this.update_graphs);
    };
    Testing.prototype.detect_resize = function() {
      this.detect = true;
      return document.body.onresize = __bind(function() {
        return this.render.trigger("resize");
      }, this);
    };
    Testing.prototype.toggle_slow = function(swap) {
      if (swap == null) {
        swap = true;
      }
      if (!(this.slowed != null)) {
        this.slowed = false;
      }
      if (!swap) {
        this.slowed = (this.slowed ? false : true);
      }
      if (this.slowed) {
        this.slowed = false;
        $(".toggle_slow").removeClass("active");
      } else {
        this.slowed = true;
        $(".toggle_slow").addClass("active");
      }
      if (this.graph != null) {
        this.graph.slowed = this.slowed;
      }
      if (this.render != null) {
        return this.render.slowed = this.slowed;
      }
    };
    Testing.prototype.toggle_pause = function(swap) {
      var _ref;
      if (swap == null) {
        swap = true;
      }
      (_ref = this.forced_pause) != null ? _ref : this.forced_pause = false;
      if (!swap) {
        this.forced_pause = (this.forced_pause ? false : true);
      }
      if (this.forced_pause) {
        this.forced_pause = false;
        $(".toggle_pause").removeClass("active");
      } else {
        this.forced_pause = true;
        $(".toggle_pause").addClass("active");
      }
      if (this.graph != null) {
        this.graph.paused = this.forced_pause;
      }
      if (this.render != null) {
        this.render.paused = this.forced_pause;
        return this.render.fpaused = this.forced_pause;
      }
    };
    Testing.prototype.toggle_2d = function() {
      $(".toggle_2d").addClass("active");
      $(".toggle_3d").removeClass("active");
      this.renderer('2d');
      if ((this.looping != null) && this.looping) {
        return this.loop_indefinitely(this.pfn, this.frameskip, this.fps);
      }
    };
    Testing.prototype.toggle_3d = function() {
      $(".toggle_3d").addClass("active");
      $(".toggle_2d").removeClass("active");
      this.renderer('3d');
      if ((this.looping != null) && this.looping) {
        return this.loop_indefinitely(null, this.frameskip, this.fps);
      }
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
    Testing.prototype.loop_indefinitely = function(pfn, frameskip, fps) {
      var f;
      this.pfn = pfn != null ? pfn : null;
      this.frameskip = frameskip != null ? frameskip : 10;
      this.fps = fps != null ? fps : 25;
      if (!(this.render != null)) {
        alert("unable to loop - no renderer...");
      }
      this.looping = true;
      f = __bind(function() {
        if ((this.pfn != null) && typeof this.pfn === 'function') {
          this.pfn(this);
        }
        if (this.slowed || this.render.paused || this.forced_pause || (this.graph.iteration % this.frameskip === 0)) {
          return this.render.draw();
        }
      }, this);
      this.render.bind('iteration', f);
      return this.graph.layout(null, this.fps);
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
      console.log(num);
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
    Testing.prototype.random_of = function(ls) {
      return ls[Math.floor(Math.random() * ls.length)];
    };
    return Testing;
  })();
  window.Testing = Testing;
}).call(this);
