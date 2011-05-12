(function() {
  var Graph;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Graph = (function() {
    __extends(Graph, EventDriver);
    Graph.prototype.nodes = [];
    Graph.prototype.edges = [];
    function Graph() {
      this.format = new Exporters(this);
      this.energy = new Energy(this);
      this.layout = new Layout(this);
      this.render = new Render(this);
      this.paused = false;
      this.dragging = false;
    }
    Graph.prototype.clear = function() {
      var n, q, _i, _j, _len, _len2, _ref;
      q = [];
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        q.push(n.name);
      }
      for (_j = 0, _len2 = q.length; _j < _len2; _j++) {
        n = q[_j];
        this.remove(n);
      }
      this.nodes = [];
      return this.edges = [];
    };
    Graph.prototype.add = function(name) {
      var n;
      this.iteration = 0;
      if (typeof name === "object") {
        if (typeof name.name === "undefined") {
          throw name;
        }
        return this.add_node(name);
      }
      if (!this.exists(name)) {
        n = new Node(name);
        this.nodes.push(n);
        this.trigger("add_node", n);
        return n;
      }
      return this.get(name);
    };
    Graph.prototype.add_node = function(node) {
      if (!this.exists(node.name)) {
        this.nodes.push(node);
        return node;
      }
      return node;
    };
    Graph.prototype.remove = function(name) {
      var be, bn, e, i, n, node, _i, _len, _ref, _ref2, _results;
      if (typeof name === "object") {
        node = name;
        name = name.name;
      } else {
        node = this.get(name);
      }
      this.trigger("delete_node", node);
      be = this.edges.length;
      bn = this.nodes.length;
      _ref = node.edges.concat();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        this.disconnect_edge(e);
      }
      _ref2 = this.nodes;
      _results = [];
      for (i in _ref2) {
        n = _ref2[i];
        if (n === node) {
          _results.push(this.nodes.splice(i, 1));
        }
      }
      return _results;
    };
    Graph.prototype.remove_node = function(node) {
      return this.remove(node.name);
    };
    Graph.prototype.connect = function(n1, n2) {
      var e;
      if (n1 === n2) {
        return;
      }
      n1 = this.add(n1);
      n2 = this.add(n2);
      if (!this.connected(n1, n2)) {
        e = new Edge(n1, n2);
        this.edges.push(e);
        n1.edges.push(e);
        n1.nodes.push(n2);
        n2.edges.push(e);
        n2.nodes.push(n1);
        this.trigger("add_edge", e);
        return e;
      }
    };
    Graph.prototype.disconnect = function(n1, n2) {
      var edge, _i, _len, _ref, _results;
      _ref = n1.edges;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        edge = _ref[_i];
        if ((edge != null) && edge.has(n2)) {
          _results.push(this.disconnect_edge(edge));
        }
      }
      return _results;
    };
    Graph.prototype.disconnect_edge = function(edge) {
      var e, i, _ref, _results;
      this.trigger("delete_edge", edge);
      edge.source.delete_edge(edge);
      edge.target.delete_edge(edge);
      _ref = this.edges;
      _results = [];
      for (i in _ref) {
        e = _ref[i];
        if ((e.has(edge.source) && e.has(edge.target)) || e === edge) {
          _results.push(this.edges.splice(i, 1));
        }
      }
      return _results;
    };
    Graph.prototype.get = function(name) {
      var node, _i, _len, _ref;
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        if (node.name === name) {
          return node;
        }
      }
    };
    Graph.prototype.exists = function(name) {
      return this.nodes.some(function(node) {
        return node.name === name;
      });
    };
    Graph.prototype.connected = function(n1, n2) {
      return n2.nodes.some(function(node) {
        return node === n1;
      });
    };
    Graph.prototype.distance = function(n1, n2) {
      var _ref;
      if (!(n1 != null) || !(n2 != null)) {
        return;
      }
      (_ref = this.is_3d) != null ? _ref : this.is_3d = false;
      return (this.is_3d ? this.distance_3d : this.distance_2d)(n1, n2);
    };
    Graph.prototype.distance_3d = function(n1, n2, rand) {
      var d2, dx, dy, dz;
      if (rand == null) {
        rand = true;
      }
      dx = n2.x - n1.x;
      dy = n2.y - n1.y;
      dz = n2.z - n1.z;
      d2 = (dx * dx) + (dy * dy) + (dz * dz);
      if (d2 < 0.01 && rand) {
        dx = (Math.random() * 0.1) + 0.1;
        dy = (Math.random() * 0.1) + 0.1;
        dz = (Math.random() * 0.1) + 0.1;
        d2 = (dx * dx) + (dy * dy) + (dz * dz);
      }
      return [d2, dx, dy, dz];
    };
    Graph.prototype.distance_2d = function(n1, n2) {
      var d2, dx, dy;
      dx = n2.x - n1.x;
      dy = n2.y - n1.y;
      d2 = (dx * dx) + (dy * dy);
      if (d2 < 0.01) {
        dx = (Math.random() * 0.1) + 0.1;
        dy = (Math.random() * 0.1) + 0.1;
        d2 = dx * dx + dy * dy;
      }
      return [d2, dx, dy, 1];
    };
    return Graph;
  })();
  this.Graph = Graph;
}).call(this);
