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
    KamadaKawai.prototype.select_dist = function() {
      if (this.graph.is_3d) {
        return this.dist = this.graph.distance_3d;
      } else {
        return this.dist = this.graph.distance_2d;
      }
    };
    KamadaKawai.prototype.prepare = function() {
      var delta, n, s, _fn, _i, _j, _len, _len2, _ref, _ref2, _ref3, _results;
      this.select_dist();
      s = Math.sqrt(Math.sqrt(this.graph.nodes.length));
      _ref = this.graph.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        _ref2 = [n.x * s, n.y * s, n.z * s], n.x = _ref2[0], n.y = _ref2[1], n.z = _ref2[2];
      }
      this.shortest_paths();
      this.tolerance = 0.1;
      this.k = 1;
      this.update_springs();
      this.delta_p = -Infinity;
      this.partials = {};
      _ref3 = this.graph.nodes;
      _fn = function(n) {};
      _results = [];
      for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
        n = _ref3[_j];
        _fn(n);
        this.partials[n.name] = this.compute_partial_derivatives(n);
        delta = this.calculate_delta(this.partials[n.name]);
        _results.push(delta > this.delta_p ? (this.p = n, this.delta_p = delta) : void 0);
      }
      return _results;
    };
    KamadaKawai.prototype.update_springs = function() {
      var dij, i, kd, u, v, _fn, _fn2, _i, _j, _len, _len2, _ref, _ref2, _ref3, _results;
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
          kd = this.k / (dij * dij);
          this.springs[u.name][v.name] = kd;
          this.springs[v.name][u.name] = kd;
        }
      }
      return _results;
    };
    KamadaKawai.prototype.shortest_paths = function() {
      var e, lim, m, n, p, q, qo, u, v, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3;
      this.paths = {};
      lim = Math.ceil(Math.sqrt(this.graph.nodes.length));
      console.log("Calculating approximate APSP to depth " + lim);
      _ref = this.graph.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        u = _ref[_i];
        p = {};
        _ref2 = this.graph.nodes;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          v = _ref2[_j];
          p[v.name] = lim + 1;
        }
        p[u.name] = 0;
        e = {};
        e[u.name] = true;
        q = [u];
        qo = 0;
        while (q.length > 0) {
          n = q.reverse().pop();
          q = q.reverse();
          _ref3 = n.nodes;
          for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
            m = _ref3[_k];
            if (!(e[m.name] != null)) {
              p[m.name] = p[n.name] + 1;
              e[m.name] = true;
              q.push(m);
            }
          }
        }
        this.paths[u.name] = p;
      }
      return this.paths;
      return this.paths;
    };
    KamadaKawai.prototype.iterate = function() {
      var n, _i, _j, _len, _len2, _ref, _ref2;
      this.select_dist();
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
      this.select_new_p();
      return this.graph.last_energy = this.delta_p;
    };
    KamadaKawai.prototype.inner_loop = function() {
      var a, d, d2, delta, dim, i, iter, j, k, lid3, mat, n, pat, spr, _i, _j, _k, _l, _len, _len2, _len3, _len4, _ref, _ref2, _ref3, _results;
      iter = 0;
      this.last_local_energy = Infinity;
      _results = [];
      while (iter < 500 && !this.done(false)) {
        iter++;
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
            _ref3 = this.dist(this.p, n), d2 = _ref3[0], d.x = _ref3[1], d.y = _ref3[2], d.z = _ref3[3];
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
        _ref = this.dist(m, i), d2 = _ref[0], dx = _ref[1], dy = _ref[2], dz = _ref[3];
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
      } else {
        return Math.sqrt(partial.x * partial.x + partial.y * partial.y);
      }
    };
    KamadaKawai.prototype.done = function() {
      var diff, done;
      if (this.last_local_energy === Infinity || this.last_local_energy < this.delta_p) {
        this.last_local_energy = this.delta_p;
        return false;
      }
      diff = 1 - (Math.abs(this.last_local_energy - this.delta_p) / this.last_local_energy);
      done = (this.delta_p === 0) || (diff < this.tolerance);
      this.last_local_energy = this.delta_p;
      return done;
    };
    return KamadaKawai;
  })();
  this.KamadaKawai = KamadaKawai;
}).call(this);
