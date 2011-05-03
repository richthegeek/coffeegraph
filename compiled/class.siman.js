(function() {
  var SimulatedAnnealing;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  SimulatedAnnealing = (function() {
    __extends(SimulatedAnnealing, Graph);
    function SimulatedAnnealing() {
      this.iterate = __bind(this.iterate, this);;      this.it = document.getElementById('iteration');
    }
    SimulatedAnnealing.prototype.layout = function(iterations, infinite) {
      var i, n, _i, _len, _ref;
      this.infinite = infinite != null ? infinite : false;
      this.iteration = 0;
      this.trigger('layout_start');
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        n.age = 1;
      }
      this.load_energy();
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
    SimulatedAnnealing.prototype.iterate = function() {
      var i, n, ncost, npos, ocost, opos, phi, radius, theta, _fn, _fn2, _i, _len, _ref;
      if (!this.render.paused && !this.render.dragging) {
        this.k = 8 / Math.log(this.nodes.length);
        this.k2 = this.k * this.k;
        this.iteration++;
        _ref = this.nodes;
        _fn = __bind(function(n) {}, this);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          n = _ref[_i];
          _fn(n);
          n.age++;
          _fn2 = function(i) {};
          for (i = 0; i <= 20; i++) {
            _fn2(i);
            opos = [n.x, n.y, n.z].slice();
            npos = opos.slice();
            ocost = this.cost();
            radius = this.k2;
            if (this.is_3d) {
              theta = i * 17 * Math.PI / 360;
              phi = Math.random() * theta;
              npos[0] += radius * Math.sin(theta) * Math.cos(phi);
              npos[1] += radius * Math.sin(phi);
              npos[2] += radius * Math.cos(theta) * Math.cos(phi);
            } else {
              npos[0] += radius * Math.cos(i * 17 * Math.PI / 180);
              npos[1] += radius * Math.sin(i * 17 * Math.PI / 180);
            }
            n.x = npos[0];
            n.y = npos[1];
            n.z = npos[2];
            ncost = this.cost();
            if (ncost < ocost) {
              console.log("KEEP", ncost, ocost, ncost - ocost);
              break;
            } else {
              console.log("DISCARD", ncost, ocost);
              n.x = opos[0];
              n.y = opos[1];
              n.z = opos[2];
            }
          }
        }
      }
      this.it.innerHTML = this.iteration;
      this.trigger('iteration', this.iteration);
      this.render.trigger('iteration', this.iteration);
      return this.loop = setTimeout(this.iterate, 30);
    };
    SimulatedAnnealing.prototype.cost = function() {
      var co, di, ea, el, nd, ne;
      co = 0;
      ea = this.energy.edge_angles();
      nd = this.energy.node_node_distances();
      el = this.energy.edge_lengths();
      di = this.energy.distribution();
      co += ea.min;
      co += ea.mean;
      co += nd.min * 500;
      co += nd.mean * 100;
      co += el.min * 500;
      co += el.mean * 500;
      co += di.value * 500;
      if (!this.is_3d && false) {
        ne = this.energy.node_edge_distances();
        co += ne.min * 500;
        co += ne.mean * 100;
      }
      return co;
    };
    return SimulatedAnnealing;
  })();
  this.SimulatedAnnealing = SimulatedAnnealing;
}).call(this);
