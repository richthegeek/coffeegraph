(function() {
  var KamadaKawai;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  KamadaKawai = (function() {
    __extends(KamadaKawai, Graph);
    function KamadaKawai(graph) {
      this.graph = graph;
      this.paths = {};
      this.springs = {};
    }
    KamadaKawai.prototype.prepare = function(iterations, infinite) {
      var delta, n, _fn, _i, _len, _ref;
      this.infinite = infinite != null ? infinite : false;
      this.shortest_paths();
      this.tolerance = 0.001;
      this.k = 1;
      this.update_springs();
      this.delta_p = -Infinity;
      this.partials = {};
      _ref = this.graph.nodes;
      _fn = function(n) {};
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        _fn(n);
        this.partials[n.name] = this.compute_partial_derivatives(n);
        delta = this.calculate_delta(this.partials[n.name]);
        if (delta > this.delta_p) {
          this.p = n;
          this.delta_p = delta;
        }
      }
      return this.last_energy = Infinity;
    };
    KamadaKawai.prototype.update_springs = function() {
      var dij, i, u, v, _fn, _fn2, _i, _j, _len, _len2, _ref, _ref2, _ref3, _results;
      this.springs = {};
      _ref = this.graph.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        u = _ref[_i];
        this.springs[u.name] = {};
      }
      _ref2 = this.graph.nodes;
      _fn = function(i, u) {};
      _results = [];
      for (i in _ref2) {
        u = _ref2[i];
        _fn(i, u);
        _ref3 = this.graph.nodes.slice(++i);
        _fn2 = function(u, v) {};
        for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
          v = _ref3[_j];
          _fn2(u, v);
          dij = this.paths[u.name][v.name];
          if (dij === Infinity) {
            return false;
          }
          this.springs[u.name][v.name] = this.springs[v.name][u.name] = this.k / (dij * dij);
        }
      }
      return _results;
    };
    KamadaKawai.prototype.shortest_paths = function() {
      var u, v, w, _fn, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _len6, _m, _n, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      this.paths = {};
      _ref = this.nodes;
      _fn = function(u) {};
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        u = _ref[_i];
        _fn(u);
        this.paths[u.name] = {};
        _ref2 = this.graph.nodes;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          v = _ref2[_j];
          this.paths[u.name][v.name] = Infinity;
        }
        _ref3 = u.nodes;
        for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
          v = _ref3[_k];
          this.paths[u.name][v.name] = 1;
        }
        this.paths[u.name][u.name] = 0;
      }
      _ref4 = this.nodes;
      for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
        w = _ref4[_l];
        _ref5 = this.nodes;
        for (_m = 0, _len5 = _ref5.length; _m < _len5; _m++) {
          u = _ref5[_m];
          if (w !== u) {
            _ref6 = this.nodes;
            for (_n = 0, _len6 = _ref6.length; _n < _len6; _n++) {
              v = _ref6[_n];
              if ((v !== u) && (v !== w)) {
                this.paths[u.name][v.name] = Math.min(this.paths[u.name][v.name], this.paths[u.name][w.name] + this.paths[w.name][v.name]);
              }
            }
          }
        }
      }
      return this.paths;
    };
    KamadaKawai.prototype.iterate = function() {
      var n, _i, _j, _len, _len2, _ref, _ref2;
      if (this.graph.nodes.length === 0) {
        return;
      }
      _ref = this.graph.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        if ((!this.paths) || (!this.springs) || (!this.partials) || (!(this.paths[n.name] != null)) || (!(this.springs[n.name] != null)) || (!this.partials[n.name])) {
          this.prepare();
          break;
        }
      }
      this.p_partials = {};
      _ref2 = this.graph.nodes;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        n = _ref2[_j];
        this.p_partials[n.name] = this.compute_partial_derivative(n, this.p);
      }
      this.inner_loop();
      return this.select_new_p();
    };
    KamadaKawai.prototype.inner_loop = function() {
      var a, d, d2, delta, dim, i, j, k, lid3, mat, n, pat, spr, _i, _j, _k, _l, _len, _len2, _len3, _len4, _ref, _ref2, _ref3, _results;
      i = 0;
      this.last_local_energy = Infinity;
      _results = [];
      while (i < 300 && !this.done(false)) {
        i++;
        mat = {
          xx: 0,
          yy: 0,
          xy: 0,
          yx: 0
        };
        dim = ['x', 'y'];
        if (this.graph.is_3d) {
          _ref = ['zz', 'xz', 'xz', 'yz', 'zy'];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            a = _ref[_i];
            mat[a] = 0;
          }
          dim.push('z');
        }
        spr = this.springs[this.p.name];
        pat = this.paths[this.p.name];
        d = {};
        _ref2 = this.graph.nodes;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          n = _ref2[_j];
          if (!(n === this.p)) {
            (function() {})();
            _ref3 = this.distance(this.p, n), d2 = _ref3[0], d.x = _ref3[1], d.y = _ref3[2], d.z = _ref3[3];
            k = spr[n.name];
            lid3 = pat[n.name] * (1 / (d2 * Math.sqrt(d2)));
            for (_k = 0, _len3 = dim.length; _k < _len3; _k++) {
              i = dim[_k];
              for (_l = 0, _len4 = dim.length; _l < _len4; _l++) {
                j = dim[_l];
                mat[i + j] += (i === j ? k * (1 + (lid3 * (d[i] * d[i] - d2))) : k * lid3 * d[i] * d[j]);
              }
            }
          }
        }
        delta = this.linear_solver(mat, this.partials[this.p.name]);
        this.p.x += delta.x;
        this.p.y += delta.y;
        this.p.z += delta.z;
        this.partials[this.p.name] = this.compute_partial_derivatives(this.p);
        _results.push(this.delta_p = this.calculate_delta(this.partials[this.p.name]));
      }
      return _results;
    };
    KamadaKawai.prototype.select_new_p = function() {
      var delta, n, odp, op, opp, _fn, _i, _len, _ref, _results;
      op = this.p;
      _ref = this.graph.nodes;
      _fn = function(n) {};
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        _fn(n);
        odp = this.p_partials[n.name];
        opp = this.compute_partial_derivative(n, op);
        this.partials[n.name].x += opp.x - odp.x;
        this.partials[n.name].y += opp.y - odp.y;
        this.partials[n.name].z += opp.z - odp.z;
        delta = this.calculate_delta(this.partials[n.name]);
        _results.push(delta > this.delta_p ? (this.p = n, this.delta_p = delta) : void 0);
      }
      return _results;
    };
    KamadaKawai.prototype.linear_solver = function(mat, rhs) {
      var c1, c2, c3, denom, x_num, y_num, z_num, _ref;
      if (this.graph.is_3d) {
        _ref = [mat.yy * mat.zz - mat.yz * mat.yz, mat.xy * mat.zz - mat.yz * mat.xz, mat.xy * mat.yz - mat.yy * mat.xz], c1 = _ref[0], c2 = _ref[1], c3 = _ref[2];
        denom = 1 / (mat.xx * c1 - mat.xy * c2 + mat.xz * c3);
        x_num = rhs.x * c1 - rhs.y * c2 + rhs.z * c3;
        y_num = mat.xx * (rhs.y * mat.zz - rhs.z * mat.yz) - mat.xy * (rhs.x * mat.zz - rhs.z * mat.xz) + mat.xz * (rhs.x * mat.yz - rhs.y * mat.xz);
        z_num = mat.xx * (mat.yy * rhs.z - mat.yz * rhs.y) - mat.xy * (mat.xy * rhs.z - mat.yz * rhs.x) + mat.xz * (mat.xy * rhs.y - mat.yy * rhs.x);
      } else {
        denom = 1 / (mat.xx * mat.yy - mat.xy * mat.xy);
        x_num = rhs.x * mat.yy - rhs.y * mat.xy;
        y_num = mat.xx * rhs.y - mat.xy * rhs.x;
        z_num = 0;
      }
      return {
        x: x_num * denom,
        y: y_num * denom,
        z: z_num * denom
      };
    };
    KamadaKawai.prototype.compute_partial_derivative = function(m, i) {
      var d2, dx, dy, dz, k, l, result, _ref;
      result = {
        x: 0,
        y: 0,
        z: 0
      };
      if (!(i === m)) {
        _ref = this.distance(m, i), d2 = _ref[0], dx = _ref[1], dy = _ref[2], dz = _ref[3];
        k = this.springs[m.name][i.name];
        l = this.paths[m.name][i.name] / Math.sqrt(d2);
        result.x = k * (dx - l * dx);
        result.y = k * (dy - l * dy);
        result.z = k * (dz - l * dz);
      }
      return result;
    };
    KamadaKawai.prototype.compute_partial_derivatives = function(m) {
      var add_results, i, result, _i, _len, _ref;
      result = {
        x: 0,
        y: 0,
        z: 0
      };
      add_results = function(a, b) {
        a.x += b.x;
        a.y += b.y;
        a.z += b.z;
        return a;
      };
      _ref = this.graph.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        result = add_results(result, this.compute_partial_derivative(m, i));
      }
      return result;
    };
    KamadaKawai.prototype.calculate_delta = function(partial) {
      if (this.graph.is_3d) {
        return Math.sqrt(partial.x * partial.x + partial.y * partial.y + partial.z * partial.z);
      }
      return Math.sqrt(partial.x * partial.x + partial.y * partial.y);
    };
    KamadaKawai.prototype.done = function(glob) {
      var diff, done, name;
      name = (glob !== false ? 'last_energy' : 'last_local_energy');
      if (this[name] === Infinity) {
        this[name] = this.delta_p;
        return false;
      }
      diff = Math.abs(this[name] - this.delta_p);
      done = (this.delta_p === 0) || (diff / this[name] < this.tolerance);
      this[name] = this.delta_p;
      return done;
    };
    return KamadaKawai;
  })();
  this.KamadaKawai = KamadaKawai;
}).call(this);
