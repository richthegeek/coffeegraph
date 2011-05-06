(function() {
  var Spring;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Spring = (function() {
    function Spring(graph) {
      this.iterate = __bind(this.iterate, this);;      this.graph = graph;
      this.k = 2;
      this.m = 0.01;
      this.d = 0.5;
      this.r = 10;
      this.r2 = this.r * this.r;
      this.attract_scale = 1;
    }
    Spring.prototype.prepare = function() {
      return this.iteration = 0;
    };
    Spring.prototype.iterate = function() {
      var edge, i, j, node, to, _fn, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4, _ref5;
      this.k = 8 / Math.log(this.graph.nodes.length);
      this.k2 = this.k * this.k;
      this.sqrt_nl_as = Math.sqrt(this.graph.nodes.length) * this.attract_scale;
      this.dist = (this.graph.is_3d ? this.graph.distance_3d : this.graph.distance_2d);
      _fn = __bind(function(i) {}, this);
      for (i = 0, _ref = this.graph.nodes.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        _fn(i);
        for (j = _ref2 = i + 1, _ref3 = this.graph.nodes.length; (_ref2 <= _ref3 ? j < _ref3 : j > _ref3); (_ref2 <= _ref3 ? j += 1 : j -= 1)) {
          this.repulse(this.graph.nodes[i], this.graph.nodes[j]);
        }
      }
      _ref4 = this.graph.edges;
      for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
        edge = _ref4[_i];
        this.attract(edge.source, edge.target);
      }
      this.graph.last_energy = {
        sum: 0,
        abs: 0
      };
      _ref5 = this.graph.nodes;
      for (_j = 0, _len2 = _ref5.length; _j < _len2; _j++) {
        node = _ref5[_j];
                to = this.apply(node);
        this.graph.last_energy.sum += to;
        this.graph.last_energy.abs += Math.abs(to);;
      }
      return true;
    };
    Spring.prototype.repulse = function(n1, n2) {
      var d2, dx, dy, dz, f, _ref;
      _ref = this.dist(n1, n2), d2 = _ref[0], dx = _ref[1], dy = _ref[2], dz = _ref[3];
      if (this.r2 > d2) {
        f = this.k2 / d2;
        dx *= f;
        dy *= f;
        dz *= f;
        n2.apply_plus(dx, dy, dz);
        return n1.apply_minus(dx, dy, dz);
      }
    };
    Spring.prototype.attract = function(n1, n2) {
      var d2, dx, dy, dz, f, _ref;
      _ref = this.dist(n1, n2), d2 = _ref[0], dx = _ref[1], dy = _ref[2], dz = _ref[3];
      f = d2 / this.k;
      if (this.graph.iteration < this.sqrt_nl_as) {
        f *= this.graph.iteration / this.sqrt_nl_as;
      }
      dx *= f;
      dy *= f;
      dz *= f;
      n1.apply_plus(dx, dy, dz);
      return n2.apply_minus(dx, dy, dz);
    };
    Spring.prototype.apply = function(node) {
      var d, m, nd, x, y, z, _ref;
      d = this.d;
      nd = 0 - d;
      m = this.m;
      _ref = [this.between(nd, m * node.fx, d), this.between(nd, m * node.fy, d), this.between(nd, m * node.fz, d)], x = _ref[0], y = _ref[1], z = _ref[2];
      node.x += x;
      node.y += y;
      node.z += z;
      node.reset_forces();
      return (x + y + z) / 3;
    };
    Spring.prototype.between = function(l, m, h) {
      if (l > m) {
        return l;
      } else {
        if (m > h) {
          return h;
        } else {
          return m;
        }
      }
    };
    return Spring;
  })();
  this.Spring = Spring;
}).call(this);
