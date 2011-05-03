(function() {
  var Node;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  Node = (function() {
    function Node(name) {
      this.name = name;
      this.reset_position();
      this.reset_forces();
      this.nodes = [];
      this.edges = [];
    }
    Node.prototype.nodelist = function() {
      return this.nodes;
    };
    Node.prototype.reset_position = function() {
      var _ref;
      return _ref = [Math.random() * 3, Math.random() * 3, Math.random() * 3], this.x = _ref[0], this.y = _ref[1], this.z = _ref[2], _ref;
    };
    Node.prototype.reset_forces = function() {
      this.fx = 0;
      this.fy = 0;
      return this.fz = 0;
    };
    Node.prototype.apply_plus = function(fx, fy, fz) {
      this.fx += fx;
      this.fy += fy;
      return this.fz += fz;
    };
    Node.prototype.apply_minus = function(fx, fy, fz) {
      this.fx += 0 - fx;
      this.fy += 0 - fy;
      return this.fz += 0 - fz;
    };
    Node.prototype.add_edge = function(edge) {
      if (!(__indexOf.call(this.edges, edge) >= 0)) {
        this.edges.push(edge);
        return this.nodes.push(edge.other(this));
      }
    };
    Node.prototype.delete_edge = function(edge) {
      var be, bn, e, i, n, node, _ref, _ref2, _results;
      node = edge.other(this);
      be = this.edges.length;
      bn = this.nodes.length;
      _ref = this.nodes;
      for (i in _ref) {
        n = _ref[i];
        if (n === node) {
          this.nodes.splice(i, 1);
        }
      }
      _ref2 = this.edges;
      _results = [];
      for (i in _ref2) {
        e = _ref2[i];
        if (e === edge) {
          _results.push(this.edges.splice(i, 1));
        }
      }
      return _results;
    };
    return Node;
  })();
  this.Node = Node;
}).call(this);
