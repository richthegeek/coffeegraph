(function() {
  var Render;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Render = (function() {
    function Render(graph) {
      this.draw = __bind(this.draw, this);;      this.graph = graph;
      this.frameskip = 10;
      this.projector = false;
    }
    Render.prototype.select = function(name) {
      var e, n, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3;
      if ((!(this.projector != null)) || (this.projector === false)) {
        this.graph.bind("iteration", this.draw);
        this.graph.bind('resize', __bind(function() {
          return this.projector.resize;
        }, this));
        this.graph.bind("add_node", __bind(function(n) {
          if (this.projector.add_node != null) {
            return this.projector.add_node(n);
          }
        }, this));
        this.graph.bind("add_edge", __bind(function(e) {
          if (this.projector.add_edge != null) {
            return this.projector.add_edge(e);
          }
        }, this));
        this.graph.bind("delete_node", __bind(function(n) {
          if (this.projector.delete_node != null) {
            return this.projector.delete_node(n);
          }
        }, this));
        this.graph.bind("delete_edge", __bind(function(n) {
          if (this.projector.delete_edge != null) {
            return this.projector.delete_edge(n);
          }
        }, this));
      }
      name = name.toLowerCase();
      if (this.graph.nodes.length && (this.graph.nodes[0].element != null) && (this.graph.nodes[0].element.remove != null)) {
        _ref = this.graph.nodes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          n = _ref[_i];
          if (n.element != null) {
                        n.element.remove();
            delete n.element;;
          }
        }
        _ref2 = this.graph.nodes;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          n = _ref2[_j];
          if (n.label != null) {
                        n.label.remove();
            delete n.label;;
          }
        }
        _ref3 = this.graph.edges;
        for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
          e = _ref3[_k];
          if (e.element != null) {
                        e.element.remove();
            delete e.element;;
          }
        }
      }
      if (name === "2d" || name === "raphael") {
        this.graph.is_3d = false;
        return this.projector = new Render2D(this.canvas, this.graph);
      } else {
        this.graph.is_3d = true;
        return this.projector = new Render3D(this.canvas, this.graph);
      }
    };
    Render.prototype.set_canvas = function(name) {
      return this.canvas = name;
    };
    Render.prototype.draw = function() {
      if (this.graph.slowed || this.graph.paused || this.graph.dragging || (this.graph.iteration % this.frameskip === 0)) {
        return this.projector.draw();
      }
    };
    return Render;
  })();
  this.Render = Render;
}).call(this);
