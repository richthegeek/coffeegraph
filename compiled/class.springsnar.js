(function() {
  var Spring_snar;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Spring_snar = (function() {
    __extends(Spring_snar, Graph);
    function Spring_snar() {
      this.iterate = __bind(this.iterate, this);;      this.set_vars();
    }
    Spring_snar.prototype.set_vars = function() {
      this.iterations = 500;
      this.iteration = 0;
      this.maxdelta = this.nodes.length;
      this.area = this.nodes.length * this.nodes.length;
      this.coolexp = 1.5;
      this.repulserad = this.area * this.nodes.length;
      return this.k = Math.sqrt(this.nodes.length);
    };
    Spring_snar.prototype.layout = function(iterations, infinite) {
      var i, node, _i, _len, _ref, _ref2;
      this.infinite = infinite != null ? infinite : false;
      this.iteration = 0;
      this.trigger('layout_start');
      this.set_vars();
      if (this.is_3d) {
        _ref = this.nodes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          node = _ref[_i];
          _ref2 = [Math.random(), Math.random(), Math.random()], node.x = _ref2[0], node.y = _ref2[1], node.z = _ref2[2];
        }
      }
      iterations != null ? iterations : iterations = this.iterations;
      if (!this.infinite) {
        for (i = 1; (1 <= iterations ? i <= iterations : i >= iterations); (1 <= iterations ? i += 1 : i -= 1)) {
          this.iterate();
        }
        this.loop = false;
      } else {
        if (typeof this.infinite !== 'number' || this.infinite < 1) {
          this.infinite = 40;
        }
        this.loop = setTimeout(this.iterate, this.infinite);
      }
      return this.trigger('layout_end');
    };
    Spring_snar.prototype.iterate = function() {
      var d, dx, dy, dz, e, j, k, n1, n2, node, rf, tx, ty, tz, xmax, xmin, ymax, ymin, zmax, zmin, _fn, _fn2, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      this.iteration++;
      console.log(this.render);
      if (!((this.render != null) && (this.render.paused != null) && this.render.paused)) {
        _fn = __bind(function(j) {}, this);
        for (j = 0, _ref = this.nodes.length; (0 <= _ref ? j < _ref : j > _ref); (0 <= _ref ? j += 1 : j -= 1)) {
          _fn(j);
          n1 = this.nodes[j];
          _ref2 = n1.edges;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            e = _ref2[_i];
            this.attract(e);
          }
          _fn2 = __bind(function(k) {}, this);
          for (k = _ref3 = j + 1, _ref4 = this.nodes.length; (_ref3 <= _ref4 ? k < _ref4 : k > _ref4); (_ref3 <= _ref4 ? k += 1 : k -= 1)) {
            _fn2(k);
            n1 = this.nodes[j];
            n2 = this.nodes[k];
            dx = n1.x - n2.x;
            dy = n1.y - n2.y;
            dz = n1.z - n2.z;
            d = Math.sqrt((dx * dx) + (dy * dy));
            if (this.is_3d) {
              d = Math.sqrt((dx * dx) + (dy * dy) + (dz * dz));
            }
            dx /= d;
            dy /= d;
            dz /= d;
            rf = this.k * this.k * (1 / d - d * d / this.repulserad);
            n1.force.x += dx * rf;
            n2.force.x -= dx * rf;
            n1.force.y += dy * rf;
            n2.force.y -= dy * rf;
            n1.force.z += dz * rf;
            n2.force.z -= dz * rf;
            if (isNaN(dx || isNaN(dy || isNaN(d || isNaN(rf))))) {
              console.log(n1, n2);
            }
          }
        }
        xmin = ymin = zmin = Infinity;
        xmax = ymax = zmax = -Infinity;
        _ref5 = this.nodes;
        for (_j = 0, _len2 = _ref5.length; _j < _len2; _j++) {
          node = _ref5[_j];
          _ref6 = [Math.min(xmin, node.x), Math.max(xmax, node.x), Math.min(ymin, node.y), Math.max(ymax, node.y), Math.min(zmin, node.z), Math.max(zmax, node.z)], xmin = _ref6[0], xmax = _ref6[1], ymin = _ref6[2], ymax = _ref6[3], zmin = _ref6[4], zmax = _ref6[5];
        }
        tx = 0 - xmin - ((xmax - xmin) * 0.5);
        ty = 0 - ymin - ((zmax - ymin) * 0.5);
        tz = 0 - zmin - ((zmax - zmin) * 0.5);
        _ref7 = this.nodes;
        for (_k = 0, _len3 = _ref7.length; _k < _len3; _k++) {
          node = _ref7[_k];
          this.apply(node, tx, ty, tz);
        }
      }
      this.render.trigger('iteration', this.iteration);
      if (this.loop) {
        return this.loop = setTimeout(this.iterate, 1);
      }
    };
    Spring_snar.prototype.attract = function(edge) {
      var af, d, d2, dx, dy, dz, _ref;
      _ref = this.distance(edge.source, edge.target), d = _ref[0], d2 = _ref[1], dx = _ref[2], dy = _ref[3], dz = _ref[4];
      if (d !== 0) {
        dx /= d;
        dy /= d;
        dz /= d;
      }
      af = d2 / this.k;
      edge.source.force.x += dx * af;
      edge.target.force.x -= dx * af;
      edge.source.force.y += dy * af;
      edge.target.force.y -= dy * af;
      edge.source.force.z += dz * af;
      edge.target.force.z -= dz * af;
      if (isNaN(dx || isNaN(dy || isNaN(d || isNaN(af))))) {
        return console.log(edge.source, edge.target);
      }
    };
    Spring_snar.prototype.apply = function(node, tx, ty, tz) {
      var ded, it, t;
      it = (this.iterations - this.iteration) / this.iterations;
      t = this.maxdelta * Math.pow(it, this.coolexp);
      if ((isNaN(t)) || (t < 0.01)) {
        t = 0.01;
      }
      ded = Math.sqrt(node.force.x * node.force.x + node.force.y * node.force.y);
      if (this.is_3d) {
        ded = Math.sqrt(node.force.x * node.force.x + node.force.y * node.force.y + node.force.z * node.force.z);
      }
      if (ded > t) {
        ded = t / ded;
        node.force.x *= ded;
        node.force.y *= ded;
        node.force.z *= ded;
        this.iteration = Math.max(this.iteration + 1, 0);
      }
      node.x += node.force.x + tx;
      node.y += node.force.y + ty;
      node.z += node.force.z + tz;
      return node.force = {
        x: 0,
        y: 0,
        z: 0
      };
    };
    Spring_snar.prototype.between = function(l, m, h) {
      if (m < l) {
        return parseFloat(l);
      }
      if (m > h) {
        return parseFloat(h);
      }
      return parseFloat(m);
    };
    return Spring_snar;
  })();
  this.Spring_snar = Spring_snar;
}).call(this);
