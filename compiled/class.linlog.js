(function() {
  var LinLog;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  LinLog = (function() {
    __extends(LinLog, Graph);
    function LinLog() {
      this.repu_exponent = 0.0;
      this.attr_exponent = 3.0;
      this.grav_factor = 0.05;
      this.dims = 3;
      this.bary = {};
    }
    LinLog.prototype.init_energy_factors = function() {
      var attr_sum, repu_sum;
      attr_sum = this.edges.length;
      repu_sum = this.nodes.length;
      if (repu_sum > 0 && attr_sum > 0) {
        this.density = attr_sum / repu_sum / repu_sum;
        this.repu_factor = this.density * Math.pow(repu_sum, 0.5 * (this.attr_exponent - this.repu_exponent));
        return this.grav_factor = this.density * repu_sum * Math.pow(this.grav_factor, this.attr_exponent - this.repu_exponent);
      } else {
        return this.repu_factor = 1;
      }
    };
    LinLog.prototype.layout = function(iterations) {
      var final_attr_exp, final_repu_exp, octtree;
      if (iterations == null) {
        iterations = 100;
      }
      this.init_energy_factors();
      final_attr_exp = this.attr_exponent;
      final_repu_exp = this.repu_exponent;
      this.compute_bary_center();
      octtree = this.build_octtree();
      return console.log(octtree);
    };
    LinLog.prototype.compute_bary_center = function() {
      var n, w, _fn, _i, _len, _ref, _results;
      this.bary = {
        x: 0,
        y: 0,
        z: 0
      };
      w = this.nodes.length;
      _ref = this.nodes;
      _fn = function(n) {};
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        _fn(n);
        this.bary.x += n.x / w;
        this.bary.y += n.y / w;
        _results.push(this.bary.z += n.z / w);
      }
      return _results;
    };
    LinLog.prototype.build_octtree = function() {
      var dx, dy, dz, maxx, maxy, maxz, minx, miny, minz, n, node, result, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4, _ref5;
      minx = miny = minz = Infinity;
      maxx = maxy = maxz = -Infinity;
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        _ref2 = [Math.min(minx, n.x), Math.max(maxx, n.x), Math.min(miny, n.y), Math.max(maxy, n.y), Math.min(minz, n.z), Math.max(maxz, n.z)], minx = _ref2[0], maxx = _ref2[1], miny = _ref2[2], maxy = _ref2[3], minz = _ref2[4], maxz = _ref2[5];
      }
      console.log(minx, maxx, miny, maxy, minz, maxz);
      _ref3 = [(maxx - minx) / 2, (maxy - miny) / 2, (maxz - minz) / 2], dx = _ref3[0], dy = _ref3[1], dz = _ref3[2];
      _ref4 = [minx - dx, maxx + dx, miny - dy, maxy + dy, minz - dz, maxz + dz], minx = _ref4[0], maxx = _ref4[1], miny = _ref4[2], maxy = _ref4[3], minz = _ref4[4], maxz = _ref4[5];
      result = new Octree(Math.max(maxx, maxy, maxz));
      _ref5 = this.nodes;
      for (_j = 0, _len2 = _ref5.length; _j < _len2; _j++) {
        node = _ref5[_j];
        result.insertNode(result.root, 1, result.root, node);
      }
      return result;
    };
    return LinLog;
  })();
  this.LinLog = LinLog;
}).call(this);
