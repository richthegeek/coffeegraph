(function() {
  var Spring;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Spring = (function() {
    __extends(Spring, Graph);
    function Spring() {
      this.iterate = __bind(this.iterate, this);;      this.k = 2;
      this.m = 0.01;
      this.d = 0.5;
      this.r = 10;
      this.r2 = 100;
      this.iterations = 500;
      this.iteration = 0;
      this.is_3d = false;
      this.it = document.getElementById('iteration');
      this.attract_scale = 1;
    }
    Spring.prototype.layout = function(iterations, infinite) {
      var i;
      this.infinite = infinite != null ? infinite : false;
      this.iteration = 0;
      this.trigger('layout_start');
      iterations != null ? iterations : iterations = this.iterations;
      if (!this.infinite) {
        i = 0;
        this.loop = false;
        while (i++ < iterations) {
          this.iterate();
        }
      } else {
        if (typeof this.infinite !== 'number' || this.infinite < 1) {
          this.infinite = 40;
        }
        clearTimeout(this.loop);
        clearInterval(this.loop);
        this.loop = setTimeout(this.iterate, this.infinite);
      }
      return this.trigger('layout_end');
    };
    Spring.prototype.iterate = function() {
      var edge, i, j, node, s, t, to, _fn, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4, _ref5;
      if (!this.render.paused && !this.render.dragging) {
        this.k = 8 / Math.log(this.nodes.length);
        this.k2 = this.k * this.k;
        this.sqrt_nl_as = Math.sqrt(this.nodes.length) * this.attract_scale;
        if (this.is_3d) {
          this.dist = this.distance_3d;
        } else {
          this.dist = this.distance_2d;
        }
        this.iteration++;
        _fn = __bind(function(i) {}, this);
        for (i = 0, _ref = this.nodes.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
          _fn(i);
          for (j = _ref2 = i + 1, _ref3 = this.nodes.length; (_ref2 <= _ref3 ? j < _ref3 : j > _ref3); (_ref2 <= _ref3 ? j += 1 : j -= 1)) {
            this.repulse(this.nodes[i], this.nodes[j]);
          }
        }
        _ref4 = this.edges;
        for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
          edge = _ref4[_i];
          this.attract(edge.source, edge.target);
        }
        s = {
          sum: 0,
          abs: 0
        };
        _ref5 = this.nodes;
        for (_j = 0, _len2 = _ref5.length; _j < _len2; _j++) {
          node = _ref5[_j];
                    to = this.apply(node);
          s.sum += to;
          s.abs += Math.abs(to);;
        }
        this.last_energy = s;
      }
      this.it.innerHTML = this.iteration;
//      this.trigger('iteration', this.iteration);
      this.render.trigger('iteration', this.iteration);
      if (this.loop) {
        if (!this.slowed && !this.paused) {
          t = 10;
        } else if ((this.slowed != null) && this.slowed) {
          t = 50 * Math.log(this.nodes.length);
        } else if ((this.paused != null) && this.paused) {
          t = 50;
        }
        return this.loop = setTimeout(this.iterate, t);
      }
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
      if (this.iteration < this.sqrt_nl_as) {
        f *= this.iteration / this.sqrt_nl_as;
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
