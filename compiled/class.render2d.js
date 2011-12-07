(function() {
  var Render2D;
  Render2D = (function() {
    function Render2D(canvas, graph) {
      this.graph = graph;
      if (canvas) {
        this.set_canvas(canvas);
      }
      this.graph.is_3d = false;
      this.styles = {};
      this.styles.node = {
        fill: "#888",
        "stroke-color": 0,
        "stroke": 0,
        "stroke-width": 0,
        "r": 5,
        opacity: 1
      };
      this.styles.label = {
        opacity: 0.5,
        "font-family": "Ubuntu"
      };
      this.styles.edge = {
        "stroke-opacity": 0.5
      };
      this.styles.dragging = {
        fill: "#2C50A3",
        "r": 5
      };
      this.styles.drag_over = {
        "stroke-width": 10,
        "stroke": "#2CA350",
        "r": 10
      };
      this.styles.drag_over_break = {
        "stroke-width": 10,
        "stroke": "#A3502C",
        "r": 10
      };
      this.styles.hover = {
        opacity: 0.5,
        r: 10
      };
    }
    Render2D.prototype.set_canvas = function(canvas) {
      if (typeof canvas === 'string') {
        canvas = document.getElementById(canvas);
      }
      if (this.canvas != null) {
        this.canvas.clear();
      }
      this.canvas_dom = canvas;
      this.canvas_width = canvas.clientWidth - 50;
      this.canvas_height = canvas.clientHeight - 50;
      return this.canvas = new Raphael(this.canvas_dom, this.canvas_width + 50, this.canvas_height + 50);
    };
    Render2D.prototype.resize = function() {
      this.canvas_width = this.canvas_dom.clientWidth - 50;
      this.canvas_height = this.canvas_dom.clientHeight - 50;
      this.canvas.setSize(this.canvas_dom.clientWidth, this.canvas_dom.clientHeight);
      return console.log(this.canvas_width, this.canvas_height, this.canvas);
    };
    Render2D.prototype.calculate_transform = function() {
      var lx, ly, mx, my, node, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4, _ref5;
      _ref = [Infinity, Infinity, -Infinity, -Infinity], lx = _ref[0], ly = _ref[1], mx = _ref[2], my = _ref[3];
      _ref2 = this.graph.nodes;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        node = _ref2[_i];
        _ref3 = [Math.min(lx, node.x), Math.min(ly, node.y), Math.max(mx, node.x), Math.max(my, node.y)], lx = _ref3[0], ly = _ref3[1], mx = _ref3[2], my = _ref3[3];
      }
      this.translate = {
        x: 0 - lx,
        y: 0 - ly
      };
      this.scale = Math.min(this.canvas_width / (mx + this.translate.x), this.canvas_height / (my + this.translate.y));
      _ref4 = this.graph.nodes;
      for (_j = 0, _len2 = _ref4.length; _j < _len2; _j++) {
        node = _ref4[_j];
        _ref5 = [(node.x + this.translate.x) * this.scale, (node.y + this.translate.y) * this.scale], node.cx = _ref5[0], node.cy = _ref5[1];
      }
      return {
        translate: this.translate,
        scale: this.scale
      };
    };
    Render2D.prototype.draw = function() {
      var edge, node, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _results;
      this.calculate_transform();
      _ref = this.graph.edges;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        edge = _ref[_i];
        this.draw_edge(edge).element.attr("path", ["M", edge.source.cx, edge.source.cy, "L", edge.target.cx, edge.target.cy].join(" ")).translate(25, 25);
      }
      _ref2 = this.graph.nodes;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        node = _ref2[_j];
        this.draw_node(node).element.attr({
          "x": node.cx,
          "cx": node.cx,
          "y": node.cy,
          "cy": node.cy
        }).translate(25, 25).toFront();
      }
      _ref3 = this.graph.nodes;
      _results = [];
      for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
        node = _ref3[_k];
        _results.push(this.draw_label(node).label.attr({
          "x": node.cx,
          "cx": node.cx,
          "y": node.cy,
          "cy": node.cy
        }).translate(35, 35).toFront());
      }
      return _results;
    };
    Render2D.prototype.draw_node = function(node) {
      if (!(node.element != null)) {
        node.element = this.canvas.circle().attr(this.styles.node).drag(this.drag_move, this.drag_start, this.drag_end);
        node.element.render = this;
        node.element.data = node;
        node.element.node.element = node.element;
        node.element.node.render = this;
        node.element.node.onmouseover = function() {
          return this.render.hover_start(this);
        };
        node.element.node.onmouseout = function() {
          return this.render.hover_end(this);
        };
      }
      return node;
    };
    Render2D.prototype.draw_label = function(node) {
      if (!(node.label != null)) {
        node.label = this.canvas.text(node.cx, node.cy, node.name).attr(this.styles.label);
      }
      return node;
    };
    Render2D.prototype.draw_edge = function(edge) {
      var _ref;
            if ((_ref = edge.element) != null) {
        _ref;
      } else {
        edge.element = this.canvas.path().attr(this.styles.edge);
      };
      return edge;
    };
    Render2D.prototype.delete_node = function(n) {
      return this.delete_element(n);
    };
    Render2D.prototype.delete_edge = function(e) {
      return this.delete_edge(e);
    };
    Render2D.prototype.delete_element = function(el) {
      if ((el.element != null) && (el.element.remove != null)) {
        el.element.remove();
      }
      if (el.label != null) {
        return el.label.remove();
      }
    };
    Render2D.prototype.hover_start = function(o) {
      if (!(o.element != null)) {
        this.draw_node(o);
      }
      if ((this.graph.dragging != null) && (this.graph.dragging.data != null) && (o.element != null) && (o.element.data != null) && o.element.data.name !== this.graph.dragging.data.name) {
        this.hover = o;
        if (this.graph.connected(o.element.data, this.graph.dragging.data)) {
          return o.element.attr(this.styles.drag_over_break);
        } else {
          return o.element.attr(this.styles.drag_over);
        }
      } else if (!(this.graph.dragging != null) && !this.graph.dragging) {
        return o.element.attr(this.styles.hover);
      }
    };
    Render2D.prototype.hover_end = function(o) {
      this.hover = null;
      return o.element.attr(this.styles.node);
    };
    Render2D.prototype.drag_start = function() {
      this.ox = this.attr("cx");
      this.oy = this.attr("cy");
      this.attr(this.render.styles.dragging);
      this.render.graph.paused = true;
      return this.render.graph.dragging = this;
    };
    Render2D.prototype.drag_move = function(dx, dy) {
      var x, y, _ref;
      _ref = [this.ox + dx - 15, this.oy + dy - 15], x = _ref[0], y = _ref[1];
      this.attr(this.render.styles.dragging);
      if (this.render.hover != null) {
        this.attr({
          r: 0
        });
        x = this.render.hover.element.attr("cx") - 25;
        y = this.render.hover.element.attr("cy") - 25;
      }
      this.data.x = (x / this.render.scale) - this.render.translate.x;
      return this.data.y = (y / this.render.scale) - this.render.translate.y;
    };
    Render2D.prototype.drag_end = function() {
      var n_from, n_to;
      if (this.render.hover != null) {
        this.data.x = ((this.ox - 25) / this.render.scale) - this.render.translate.x;
        this.data.y = ((this.oy - 25) / this.render.scale) - this.render.translate.y;
        n_from = this.data;
        n_to = this.render.hover.element.data;
        console.log(n_from, n_to);
        if (this.render.graph.connected(n_from, n_to)) {
          this.render.graph.disconnect(n_from, n_to);
        } else {
          this.render.graph.connect(n_from, n_to);
        }
      }
      if (!((this.render.fpaused != null) && this.render.fpaused)) {
        this.render.graph.paused = null;
      }
      this.render.graph.dragging = null;
      return this.attr(this.render.styles.node);
    };
    return Render2D;
  })();
  this.Render2D = Render2D;
}).call(this);
