(function() {
  var Energy;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Energy = (function() {
    function Energy(graph) {
      this.graph = graph;
      this.last_time = new Date();
      this.last_time = this.last_time.getTime();
      this.last_fps = 0;
    }
    Energy.prototype.fps = function(divisor) {
      var fp, nt;
      if (divisor == null) {
        divisor = 10;
      }
      nt = new Date();
      nt = nt.getTime();
      fp = 1000 / (nt - this.last_time);
      fp *= divisor;
      this.last_time = nt;
      if (fp > 250) {
        return false;
      }
      return {
        fps: fp
      };
    };
    Energy.prototype.energy = function() {
      if (t.graph.last_energy != null) {
        return t.graph.last_energy;
      } else {
        return false;
      }
    };
    Energy.prototype.edge_angles = function() {
      var count, e1, i, inners, maxa, mina, mp18, slopes, total, _fn, _fn2, _i, _j, _len, _len2, _ref, _ref2, _ref3;
      _ref = [360, -360, 0, 0], mina = _ref[0], maxa = _ref[1], total = _ref[2], count = _ref[3];
      slopes = {};
      inners = [];
      mp18 = 180 / Math.PI;
      _ref2 = this.graph.edges;
      _fn = __bind(function(e1) {
        var i, s1, s2;
        slopes[e1.toString() + "xy"] = (e1.target.y - e1.source.y) / (e1.target.x - e1.source.x);
        if (this.graph.is_3d) {
          slopes[e1.toString() + "xz"] = (e1.target.y - e1.source.z) / (e1.target.x - e1.source.x);
          slopes[e1.toString() + "yz"] = (e1.target.y - e1.source.z) / (e1.target.x - e1.source.y);
          s1 = Math.min(slopes[e1.toString() + "yz"], slopes[e1.toString() + "xz"], slopes[e1.toString() + "xy"]);
        } else {
          s1 = slopes[e1.toString() + "xy"];
        }
        for (i in slopes) {
          s2 = slopes[i];
          inners.push(Math.atan((s1 - s2) / (1 + (s1 * s2))) * mp18);
        }
        return slopes[e1.toString()] = s1;
      }, this);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        e1 = _ref2[_i];
        _fn(e1);
      }
      _fn2 = function() {};
      for (_j = 0, _len2 = inners.length; _j < _len2; _j++) {
        i = inners[_j];
        _fn2();
        i = Math.abs(i);
        _ref3 = [Math.max(maxa, i), Math.min(mina, i)], maxa = _ref3[0], mina = _ref3[1];
        total = total + i;
        count = count + 1;
      }
      return {
        min: mina,
        max: maxa,
        mean: total / count,
        total: total,
        count: count
      };
    };
    Energy.prototype.node_node_distances = function() {
      var count, d, d2, dx, dy, i, maxa, mina, n1, n2, nearest, total, _fn, _fn2, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4, _ref5;
      _ref = [9999, 0, 0, 0], mina = _ref[0], maxa = _ref[1], total = _ref[2], count = _ref[3], nearest = _ref[4];
      i = 1;
      _ref2 = this.graph.nodes;
      _fn = function(n1) {};
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        n1 = _ref2[_i];
        _fn(n1);
        _ref3 = this.graph.nodes.slice(i++);
        _fn2 = function(n1, n2) {};
        for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
          n2 = _ref3[_j];
          _fn2(n1, n2);
          _ref4 = this.graph.distance(n1, n2), d2 = _ref4[0], dx = _ref4[1], dy = _ref4[2];
          d = Math.sqrt(d2);
          _ref5 = [Math.min(d, mina), Math.max(d, maxa), total + d, count + 1], mina = _ref5[0], maxa = _ref5[1], total = _ref5[2], count = _ref5[3];
        }
      }
      return {
        min: mina,
        max: maxa,
        mean: total / count
      };
    };
    Energy.prototype.node_edge_distances = function() {
      var a, b, c, count, d, d1, d2, e, min, px, py, r, r_den, r_num, st, total, _fn, _i, _j, _len, _len2, _ref, _ref2, _ref3;
      min = 99999;
      total = 0;
      count = 0;
      _ref = this.graph.nodes;
      _fn = function(c) {};
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        _fn(c);
        _ref2 = this.graph.edges;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          e = _ref2[_j];
          if (!e.has(c)) {
            (function(e) {})(e);
            _ref3 = [e.source, e.target], a = _ref3[0], b = _ref3[1];
            r_num = ((c.x - a.x) * (b.x - a.x)) + ((c.y - a.y) * (b.y - a.y));
            r_den = ((b.x - a.x) * (b.x - a.x)) + ((b.y - a.y) * (b.y - a.y));
            r = r_num / r_den;
            px = a.x + r * (b.x - a.x);
            py = a.y + r * (b.y - a.y);
            st = (((a.y - c.y) * (b.x - a.x)) - ((a.x - c.x) * (b.y - a.y))) / r_den;
            if (r >= 0 && r <= 1) {
              d = Math.abs(st) * Math.sqrt(r_den);
            } else {
              d1 = Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2);
              d2 = Math.pow(c.x - b.x, 2) + Math.pow(c.y - b.y, 2);
              d = Math.sqrt(Math.min(d1, d2));
            }
            total += d;
            count += 1;
            min = Math.min(min, d);
          }
        }
      }
      return {
        min: min,
        mean: total / count
      };
    };
    Energy.prototype.edge_lengths = function() {
      var d, d2, dx, dy, dz, e, maxa, mina, total, _fn, _i, _len, _ref, _ref2, _ref3;
      _ref = [Infinity, -Infinity, 0], mina = _ref[0], maxa = _ref[1], total = _ref[2];
      _ref2 = this.graph.edges;
      _fn = function(e) {};
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        e = _ref2[_i];
        _fn(e);
        _ref3 = this.graph.distance(e.source, e.target), d2 = _ref3[0], dx = _ref3[1], dy = _ref3[2], dz = _ref3[3];
        d = Math.sqrt(d2);
        maxa = Math.max(d, maxa);
        mina = Math.min(d, mina);
        total += d;
      }
      return {
        min: mina,
        max: maxa,
        mean: total / this.graph.edges.length
      };
    };
    Energy.prototype.distribution = function() {
      var area, count, max, min, node, _i, _len, _ref, _ref2, _ref3;
      _ref = [[0, 0, 0], [0, 0, 0], 0], min = _ref[0], max = _ref[1], count = _ref[2];
      _ref2 = this.graph.nodes;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        node = _ref2[_i];
        _ref3 = [Math.min(min[0], node.x), Math.max(max[0], node.x), Math.min(min[1], node.y), Math.max(max[1], node.y), Math.min(min[2], node.z), Math.max(max[2], node.z), count + 1], min[0] = _ref3[0], max[0] = _ref3[1], min[1] = _ref3[2], max[1] = _ref3[3], min[2] = _ref3[4], max[2] = _ref3[5], count = _ref3[6];
      }
      area = (max[0] - min[0]) * (max[1] - min[1]);
      if (this.graph.is_3d) {
        area = area * (max[2] - min[2]);
      }
      return {
        value: area / count,
        area: area
      };
    };
    Energy.prototype.edge_crossings = function() {
      var a, b, c, cdi, count, cross, d, d1, d2, d3, d4, e, e1, e2, i, ios, k, _fn, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4;
      if (this.graph.is_3d) {
        return 0;
      }
      ios = function(xi, yi, xj, yj, xk, yk) {
        if ((xi <= xk || xj <= xk) && (xk <= xi || xk <= xj) && (yi <= yk || yj <= yk) && (yk <= yi || yk <= yj)) {
          return true;
        } else {
          return false;
        }
      };
      cdi = function(xi, yi, xj, yj, xk, yk) {
        var a, b, _ref;
        _ref = [(xk - xi) * (yj - yi), (xj - xi) * (yk - yi)], a = _ref[0], b = _ref[1];
        if (a < b) {
          return -1;
        } else {
          if (a > b) {
            return 1;
          } else {
            return 0;
          }
        }
      };
      cross = {};
      _ref = this.graph.edges;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        cross[e.source.name + e.target.name] = 0;
      }
      _ref2 = this.graph.edges;
      _fn = function(e1) {};
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        e1 = _ref2[_j];
        _fn(e1);
        _ref3 = this.graph.edges;
        for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
          e2 = _ref3[_k];
          if (!(e2.has(e1.source) || e2.has(e1.target))) {
            (function(e2) {})(e2);
            _ref4 = [e1.source, e1.target, e2.source, e2.target], a = _ref4[0], b = _ref4[1], c = _ref4[2], d = _ref4[3];
            d1 = cdi(c.x, c.y, d.x, d.y, a.x, a.y);
            d2 = cdi(c.x, c.y, d.x, d.y, b.x, b.y);
            d3 = cdi(a.x, a.y, b.x, b.y, c.x, c.y);
            d4 = cdi(a.x, a.y, b.x, b.y, d.x, d.y);
            if ((((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) || (d1 === 0 && ios(c.x, c.y, d.x, d.y, a.x, a.y)) || (d2 === 0 && ios(c.x, c.y, d.x, d.y, b.x, b.y)) || (d3 === 0 && ios(a.x, a.y, b.x, b.y, c.x, c.y)) || (d4 === 0 && ios(a.x, a.y, b.x, b.y, d.x, d.y))) {
              cross[e1.toString()]++;
              cross[e2.toString()]++;
            }
          }
        }
      }
      count = 0;
      for (k in cross) {
        i = cross[k];
        count += i / 4;
      }
      return {
        count: count
      };
    };
    return Energy;
  })();
  this.Energy = Energy;
}).call(this);
