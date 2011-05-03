(function() {
  var Spring_clique;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  Spring_clique = (function() {
    function Spring_clique() {
      Spring_clique.__super__.constructor.apply(this, arguments);
    }
    __extends(Spring_clique, Graph);
    Spring_clique.prototype.detect_cliques = function() {
      var c, clique, cliques, cmax, i, incl, j, node1, node2, rcl, _fn, _fn2, _fn3, _i, _j, _k, _len, _len2, _len3, _ref, _ref2;
      cmax = 0;
      cliques = [];
      incl = [];
      clique = [];
      console.profile();
      _ref = this.nodes;
      _fn = function(node1) {};
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node1 = _ref[_i];
        _fn(node1);
        _ref2 = node1.nodes;
        _fn2 = function(node2) {};
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          node2 = _ref2[_j];
          _fn2(node2);
          if (this.in_cliques(incl, node1.name, node2.name)) {
            continue;
          }
          clique = this.expand_clique([node1.name, node2.name], node1);
          if (clique.length < 2) {
            continue;
          }
          cliques.push(clique.slice());
          incl = this.add_incl(incl, clique);
        }
      }
      console.profileEnd();
      rcl = [];
      _fn3 = function(c) {};
      for (i in cliques) {
        c = cliques[i];
        _fn3(c);
        rcl[i] = [];
        for (_k = 0, _len3 = c.length; _k < _len3; _k++) {
          j = c[_k];
          rcl[i].push(this.get(j));
        }
      }
      console.log(rcl);
      return rcl;
    };
    Spring_clique.prototype.add_incl = function(incl, clique) {
      var i, j, _fn, _name, _ref, _ref2, _ref3;
      _fn = function(i) {};
      for (i = 0, _ref = clique.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        _fn(i);
        (_ref2 = incl[_name = clique[i]]) != null ? _ref2 : incl[_name] = [];
        for (j = i, _ref3 = clique.length; (i <= _ref3 ? j < _ref3 : j > _ref3); (i <= _ref3 ? j += 1 : j -= 1)) {
          incl[clique[i]][clique[j]] = true;
        }
      }
      return incl;
    };
    Spring_clique.prototype.in_cliques = function(incl, n1, n2) {
      return ((incl[n1] != null) && (incl[n1][n2] != null)) || ((incl[n2] != null) && (incl[n2][n1] != null));
    };
    Spring_clique.prototype.expand_clique = function(common, node1) {
      var count, k2, k3, n2, _fn, _i, _j, _len, _len2, _ref;
      _ref = node1.nodes;
      _fn = function(n2) {};
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n2 = _ref[_i];
        _fn(n2);
        k2 = n2.name;
        if ((__indexOf.call(common, k2) >= 0)) {
          continue;
        }
        count = 0;
        for (_j = 0, _len2 = common.length; _j < _len2; _j++) {
          k3 = common[_j];
          if ((this.connected(this.get(k3), n2)) || (k3 === k2)) {
            count++;
          }
        }
        if (count >= common.length) {
          common.push(k2);
        }
      }
      return common;
    };
    return Spring_clique;
  })();
  this.Spring_clique = Spring_clique;
}).call(this);
