(function() {
  var Clique;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  Clique = (function() {
    function Clique(graph) {
      this.graph = graph;
    }
    Clique.prototype.test = function(k) {
      var con, connected, e, j, n1, n2, s, set, sets, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4;
      s = new Subsets();
      sets = s.list(this.graph.nodes.length, k);
      console.log("Hard-test for " + k + " with " + sets.length + " possibilities");
      for (_i = 0, _len = sets.length; _i < _len; _i++) {
        set = sets[_i];
        connected = true;
        for (j = 0, _ref = set.length; 0 <= _ref ? j < _ref : j > _ref; 0 <= _ref ? j++ : j--) {
          for (k = _ref2 = j + 1, _ref3 = set.length; _ref2 <= _ref3 ? k < _ref3 : k > _ref3; _ref2 <= _ref3 ? k++ : k--) {
            n1 = this.graph.nodes[set[j] - 1];
            n2 = this.graph.nodes[set[k] - 1];
            con = false;
            _ref4 = n1.edges;
            for (_j = 0, _len2 = _ref4.length; _j < _len2; _j++) {
              e = _ref4[_j];
              if ((e.source.name === n2.name) || (e.target.name === n2.name)) {
                con = true;
              }
            }
            if (!con) {
              connected = false;
            }
          }
          if (!connected) {
            break;
          }
        }
        if (connected) {
          console.log("found", set);
          return true;
        }
      }
      console.log("No cliques of size " + k + " found");
      return false;
    };
    Clique.prototype.detect_cliques = function() {
      var c, clique, cliques, cmax, i, incl, j, mc, ms, node1, node2, rcl, _i, _j, _k, _len, _len2, _len3, _ref, _ref2;
      cmax = 0;
      cliques = [];
      incl = [];
      clique = [];
      console.time(this.graph.edges.length);
      _ref = this.graph.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node1 = _ref[_i];
        _ref2 = node1.nodes;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          node2 = _ref2[_j];
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
      console.timeEnd(this.graph.edges.length);
      rcl = [];
      ms = 0;
      mc = false;
      for (i in cliques) {
        c = cliques[i];
        if (c.length <= 2) {
          continue;
        }
        rcl[i] = [];
        for (_k = 0, _len3 = c.length; _k < _len3; _k++) {
          j = c[_k];
          rcl[i].push(this.graph.get(j));
        }
        if (c.length > ms) {
          ms = c.length;
          mc = c;
        }
      }
      rcl.sort(function(a, b) {
        if (a.length < b.length) {
          return 1;
        } else {
          return -1;
        }
      });
      return {
        max: mc,
        all: rcl
      };
    };
    Clique.prototype.add_incl = function(incl, clique) {
      var i, j, _fn, _name, _ref, _ref2, _ref3;
      _fn = function(i) {};
      for (i = 0, _ref = clique.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        _fn(i);
                if ((_ref2 = incl[_name = clique[i]]) != null) {
          _ref2;
        } else {
          incl[_name] = [];
        };
        for (j = i, _ref3 = clique.length; i <= _ref3 ? j < _ref3 : j > _ref3; i <= _ref3 ? j++ : j--) {
          incl[clique[i]][clique[j]] = true;
        }
      }
      return incl;
    };
    Clique.prototype.in_cliques = function(incl, n1, n2) {
      return ((incl[n1] != null) && (incl[n1][n2] != null)) || ((incl[n2] != null) && (incl[n2][n1] != null));
    };
    Clique.prototype.expand_clique = function(common, node1) {
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
          if ((this.graph.connected(this.graph.get(k3), n2)) || (k3 === k2)) {
            count++;
          }
        }
        if (count >= common.length) {
          common.push(k2);
        }
      }
      return common;
    };
    return Clique;
  })();
  this.Clique = Clique;
}).call(this);
