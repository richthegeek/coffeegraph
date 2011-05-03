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
      this.ncell = Math.ceil(Math.pow(this.nodes.length, 0.4));
      this.cjit = 0.5;
      this.cppr = 0;
      this.cpcr = 18;
      this.cccr = Math.pow(this.ncell, 2);
      return this.k = Math.sqrt(this.volume / this.nodes.length);
    };
    Spring_snar.prototype.layout = function(iterations, infinite) {
      var i;
      this.infinite = infinite != null ? infinite : false;
      this.iteration = 0;
      this.trigger('layout_start');
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
      var edge, ip, j, jx, jy, node, p, p2, t, vcells, vlp, xmax, xmin, xwid, ymax, ymin, ywid, _fn, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      this.iteration++;
      if (!((this.render != null) && (this.render.paused != null) && this.render.paused)) {
        _ref = [Infinity, Infinity, -Infinity, -Infinity], xmin = _ref[0], ymin = _ref[1], xmax = _ref[2], ymax = _ref[3];
        _ref2 = this.nodes;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          node = _ref2[_i];
          _ref3 = [Math.min(xmin, node.x), Math.min(ymin, node.y), Math.max(xmax, node.x), Math.max(ymax, node.y)], xmin = _ref3[0], ymin = _ref3[1], xmax = _ref3[2], ymax = _ref3[3];
        }
        xmin -= 0.0001 * (xmax - xmin);
        ymin -= 0.0001 * (ymax - ymin);
        xmax += 0.0001 * (xmax - xmin);
        ymax += 0.0001 * (ymax - ymin);
        xwid = (xmax - xmin) / this.ncell;
        ywid = (ymax - ymin) / this.ncell;
        vcells = null;
        ip = 1;
        _ref4 = this.nodes;
        _fn = __bind(function(node) {}, this);
        for (j in _ref4) {
          node = _ref4[j];
          _fn(node);
          jx = Math.max(Math.min(node.x + (Math.random() * (xwid * this.cjit * ip)), xmax), xmin);
          jy = Math.max(Math.min(node.y + (Math.random() * (ywid * this.cjit * ip)), ymax), ymin);
          node.cell = Math.floor((jx - xmin) / xwid) + this.ncell * Math.floor((jy - ymin) / ywid);
          p = vcells;
          while ((p != null) && (p.next != null) && p.id !== node.cell) {
            p = p.next;
          }
          if (p === null) {
            vcells = p = {};
          } else if (p.id !== node.cell) {
            p.next = {};
            p = p.next;
          }
          if ((p === null) || (p.id !== node.cell)) {
            p.id = node.cell;
            p.next = null;
            p.memb = null;
            p.count = 0;
            p.xm = 0;
            p.ym = 0;
          }
          p.count++;
          vlp = {
            v: node,
            next: p.memb
          };
          p.memb = vlp;
          p.xm = (p.xm * (p.count - 1) + node.x) / p.count;
          p.ym = (p.ym * (p.count - 1) + node.y) / p.count;
        }
        t = this.maxdelta * Math.pow((this.iterations - this.iteration) / this.iterations, this.coolexp);
        t = Math.max(0, t);
        p = vcells;
        while (p !== null) {
          __bind(function(p) {}, this)(p);
          p2 = p;
          while (p2 !== null) {
            __bind(function(p2) {}, this)(p2);
            this.repulse(p, p2);
            p2 = p2.next;
          }
          p = p.next;
        }
        _ref5 = this.edges;
        for (_j = 0, _len2 = _ref5.length; _j < _len2; _j++) {
          edge = _ref5[_j];
          this.attract(edge);
        }
        _ref6 = this.nodes;
        for (_k = 0, _len3 = _ref6.length; _k < _len3; _k++) {
          node = _ref6[_k];
          this.apply(node, t);
        }
      }
      this.render.trigger('iteration', this.iteration);
      if (this.loop) {
        return this.loop = setTimeout(this.iterate, this.infinite);
      }
    };
    Spring_snar.prototype.repulse = function(p, p2) {
      var celldis, ded, ix, iy, jx, jy, rf, vlp, vlp2, xd, yd, _results, _results2, _results3;
      ix = p.id % this.ncell;
      jx = p2.id % this.ncell;
      iy = Math.floor(p.id / this.ncell);
      jy = Math.floor(p.id / this.ncell);
      celldis = (ix - jx) * (ix - jx) + (iy - jy) * (iy - jy);
      if (celldis <= (this.ccps + 0.001)) {
        console.log("point-point");
        vlp = p.memb;
        _results = [];
        while (vlp !== null) {
          __bind(function(vlp) {}, this)(vlp);
          vlp2 = (p === p2 ? vlp.next : p2.memb);
          while (vlp2 !== null) {
            __bind(function(vlp2) {}, this)(vlp2);
            if ((vlp.v.x === vlp2.v.x) || (vlp.v.y === vlp2.v.y)) {
              vlp2 = vlp2.next;
              continue;
            }
            xd = vlp.v.x - vlp2.v.x;
            yd = vlp.v.y - vlp2.v.y;
            ded = Math.sqrt(xd * xd + yd * yd);
            xd /= ded;
            yd /= ded;
            rf = this.k * this.k * (1 / ded - ded * ded / this.repulserad);
            vlp.v.force.x += xd * rf;
            vlp.v.force.y += yd * rf;
            vlp2.v.force.x -= xd * rf;
            vlp2.v.force.y -= yd * rf;
            vlp2 = vlp2.next;
          }
          _results.push(vlp = vlp.next);
        }
        return _results;
      } else if (celldis <= (this.cpcr + 0.001)) {
        vlp = p.memb;
        while (vlp !== null) {
          __bind(function(vlp) {}, this)(vlp);
          if ((vlp.v.x === p2.xm) || (vlp.v.y === p2.ym)) {
            vlp = vlp.next;
            continue;
          }
          xd = vlp.v.x - p2.xm;
          yd = vlp.v.y - p2.ym;
          ded = Math.sqrt((xd * xd) + (yd * yd));
          xd /= ded;
          yd /= ded;
          rf = this.k * this.k * (1 / ded - ded * ded / this.repulserad);
          vlp.v.force.x += xd * rf * p2.count;
          vlp.v.force.y += yd * rf * p2.count;
          vlp = vlp.next;
        }
        vlp = p2.memb;
        _results2 = [];
        while (vlp !== null) {
          __bind(function(vlp) {}, this)(vlp);
          if ((vlp.v.x === p.xm) || (vlp.v.y === p.ym)) {
            vlp = vlp.next;
            continue;
          }
          xd = vlp.v.x - p.xm;
          yd = vlp.v.y - p.ym;
          ded = Math.sqrt(xd * xd + yd * yd);
          xd /= ded;
          yd /= ded;
          rf = this.k * this.k * (1 / ded - ded * ded / this.repulserad);
          vlp.v.force.x += xd * rf * p.count;
          vlp.v.force.y += yd * rf * p.count;
          _results2.push(vlp = vlp.next);
        }
        return _results2;
      } else if (celldis <= (this.cccr + 0.001)) {
        console.log("cell-cell");
        xd = p.xm - p2.xm;
        yd = p.ym - p2.ym;
        ded = Math.sqrt(xd * xd + yd * yd);
        xd /= ded;
        yd /= ded;
        rf = this.k * this.k * (1 / ded - ded * ded / this.repulserad);
        vlp = p.memb;
        while (vlp !== null) {
          __bind(function(vlp) {}, this)(vlp);
          vlp.v.force.x += xd * rf * p2.count;
          vlp.v.force.y += yd * rf * p2.count;
          vlp.next;
        }
        vlp = p2.memb;
        _results3 = [];
        while (vlp !== null) {
          vlp();
          vlp.v.force.x -= xd * rf * p.count;
          vlp.v.force.y -= yd * rf * p.count;
          _results3.push(vlp.next);
        }
        return _results3;
      }
    };
    Spring_snar.prototype.attract = function(edge) {
      var af, ded, k, l, xd, yd;
      k = edge.source;
      l = edge.target;
      xd = k.x - l.x;
      yd = k.y - l.y;
      ded = Math.sqrt(xd * xd + yd * yd);
      af = 0.1 * ded * ded / this.k;
      k.force.x -= xd * af;
      k.force.y -= yd * af;
      l.force.x += xd * af;
      return l.force.y += yd * af;
    };
    Spring_snar.prototype.apply = function(node, t) {
      var ded;
      ded = Math.sqrt(node.force.x * node.force.x + node.force.y * node.force.y);
      if (ded > t) {
        ded = t / ded;
        node.force.x *= ded;
        node.force.y *= ded;
      }
      node.x += node.force.x;
      node.y += node.force.y;
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
