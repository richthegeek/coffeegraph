(function() {
  var Graph;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Graph = (function() {
    function Graph() {
      Graph.__super__.constructor.apply(this, arguments);
    }
    __extends(Graph, EventDriver);
    Graph.prototype.nodes = [];
    Graph.prototype.edges = [];
    Graph.prototype.clear = function() {
      var n, q, _i, _j, _len, _len2, _ref;
      q = [];
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        q.push(n.name);
      }
      for (_j = 0, _len2 = q.length; _j < _len2; _j++) {
        n = q[_j];
        this.remove(n);
      }
      this.nodes = [];
      return this.edges = [];
    };
    Graph.prototype.toString = function() {
      var n, n2, nl, output, _fn, _i, _j, _len, _len2, _ref, _ref2;
      output = [];
      _ref = this.nodes;
      _fn = function(n) {};
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        _fn(n);
        nl = {
          name: n.name,
          x: n.x,
          y: n.y,
          z: n.z,
          edges: []
        };
        _ref2 = n.nodes;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          n2 = _ref2[_j];
          edges.push(n2.name);
        }
        output.push(nl);
      }
      return JSON.stringify(output);
    };
    Graph.prototype.asDot = function() {
      var e, text, _i, _len, _ref;
      text = [];
      text.push("graph g {");
      _ref = this.edges;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        text.push('\t"' + e.source.name + '" -- "' + e.target.name + '";');
      }
      text.push("}");
      return text.join("\n");
    };
    Graph.prototype.fromDot = function(data) {
      var es, line, lines, m, n1, n2, names, _fn, _i, _len;
      this.clear();
      lines = data.split("\n");
      names = [];
      es = [];
      _fn = function(line) {};
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        _fn(line);
        m = line.match(/[^a-z0-9]+([a-z0-9\.]*)/gi);
        if ((!(m != null)) || m.length < 2) {
          return;
        }
        n1 = m[0].replace(/(\s|"|-)/gi, "");
        n2 = m[1].replace(/(\s|"|-)/gi, "");
        if (n1 === "{" || n1 === "g" || n2 === "{" || n2 === "g") {
          continue;
        }
        this.connect(n1, n2);
      }
      return true;
    };
    Graph.prototype.asJSON = function(position) {
      var edge, el, nl, node, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4;
      if (position == null) {
        position = true;
      }
      _ref = [[], []], nl = _ref[0], el = _ref[1];
      if (position) {
        _ref2 = this.nodes;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          node = _ref2[_i];
          nl.push({
            name: node.name,
            x: node.x,
            y: node.y,
            z: node.z
          });
        }
      } else {
        _ref3 = this.nodes;
        for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
          node = _ref3[_j];
          nl.push(node.name);
        }
      }
      _ref4 = this.edges;
      for (_k = 0, _len3 = _ref4.length; _k < _len3; _k++) {
        edge = _ref4[_k];
        el.push([edge.source.name, edge.target.name]);
      }
      return JSON.stringify({
        nodes: nl,
        edges: el
      });
    };
    Graph.prototype.fromJSON = function(data) {
      var edge, n, node, _fn, _fn2, _i, _j, _len, _len2, _ref, _ref2;
      if (typeof data === "string") {
        data = JSON.parse(data);
      }
      this.clear();
      _ref = data.nodes;
      _fn = function(node) {};
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        _fn(node);
        if (node.name != null) {
          n = new Node(node.name);
          if ((node.x != null)) {
            n.x = node.x;
            n.y = node.y;
            n.z = node.z;
          }
        } else {
          n = new Node(node);
        }
        this.add_node(n);
      }
      _ref2 = data.edges;
      _fn2 = function(edge) {};
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        edge = _ref2[_j];
        _fn2(edge);
        this.connect(edge[0], edge[1]);
      }
      return true;
    };
    Graph.prototype.fromGraphML = function(data) {
      return this.fromXML(data, 'from', 'to');
    };
    Graph.prototype.asGraphML = function() {
      var data, edge, i, node, _i, _len, _ref, _ref2;
      data = [];
      data.push('<?xml version="1.0" encoding="UTF-8"?>');
      data.push('<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">');
      data.push('<graph id="G" edgedefault="undirected">');
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        data.push('\t<node id="' + node.name + '" />');
      }
      _ref2 = this.edges;
      for (i in _ref2) {
        edge = _ref2[i];
        if (edge.source != null) {
          data.push('\t<edge id="e' + i + '" from="' + edge.source.name + '" to="' + edge.target.name + '" />');
        }
      }
      data.push('</graph>');
      data.push('</graphml>');
      return data.join("\n");
    };
    Graph.prototype.fromGXL = function(data) {
      return this.fromXML(data, 'source', 'target');
    };
    Graph.prototype.asGXL = function() {
      var data, edge, i, node, _i, _len, _ref, _ref2;
      data = [];
      data.push('<?xml version="1.0" encoding="UTF-8"?>');
      data.push('<!DOCTYPE gxl SYSTEM "http://www.gupro.de/GXL/gxl-1.0.dtd">');
      data.push('<gxl xmlns:xlink=" http://www.w3.org/1999/xlink">');
      data.push('<graph id="G" edgemode="undirected" >');
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        data.push('\t<node id="' + node.name + '" />');
      }
      _ref2 = this.edges;
      for (i in _ref2) {
        edge = _ref2[i];
        if (edge.source != null) {
          data.push('\t<edge id="e' + i + '" source="' + edge.source.name + '" target="' + edge.target.name + '" />');
        }
      }
      data.push('</graph>');
      data.push('</gxl>');
      return data.join("\n");
    };
    Graph.prototype.fromXML = function(data, s, t) {
      var a, graph;
      if (typeof data === "string") {
        data = $(data);
      }
      if (!(s != null)) {
        a = data.find('edge')[0].attributes;
        if (a.length < 3) {
          return false;
        }
        s = a[1].name;
        t = a[2].name;
      }
      this.clear();
      graph = this;
      data.find('node').each(function() {
        return graph.add_node(new Node($(this).attr('id')));
      });
      data.find('edge').each(function() {
        return graph.connect($(this).attr(s), $(this).attr(t));
      });
      return true;
    };
    Graph.prototype.load_energy = function() {
      var _ref;
      (_ref = this.energy) != null ? _ref : this.energy = new Energy(this);
      return this.energy;
    };
    Graph.prototype.add = function(name) {
      var n;
      this.iteration = 0;
      if (typeof name === "object") {
        if (typeof name.name === "undefined") {
          console.log(name);
          throw name;
        }
        return this.add_node(name);
      }
      if (!this.exists(name)) {
        n = new Node(name);
        this.nodes.push(n);
        if (this.render != null) {
          this.render.trigger("add_node", n);
        }
        return n;
      }
      return this.get(name);
    };
    Graph.prototype.add_node = function(node) {
      if (!this.exists(node.name)) {
        this.nodes.push(node);
        return node;
      }
      return node;
    };
    Graph.prototype.remove = function(name) {
      var be, bn, e, i, n, node, _i, _len, _ref, _ref2, _results;
      if (typeof name === "object") {
        node = name;
        name = name.name;
      } else {
        node = this.get(name);
      }
      if (this.render != null) {
        this.render.trigger("delete_node", node);
      }
      be = this.edges.length;
      bn = this.nodes.length;
      _ref = node.edges.concat();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        this.disconnect_edge(e);
      }
      _ref2 = this.nodes;
      _results = [];
      for (i in _ref2) {
        n = _ref2[i];
        if (n === node) {
          _results.push(this.nodes.splice(i, 1));
        }
      }
      return _results;
    };
    Graph.prototype.remove_node = function(node) {
      return this.remove(node.name);
    };
    Graph.prototype.connect = function(n1, n2) {
      var e;
      if (n1 === n2) {
        return;
      }
      n1 = this.add(n1);
      n2 = this.add(n2);
      if (!this.connected(n1, n2)) {
        e = new Edge(n1, n2);
        this.edges.push(e);
        n1.edges.push(e);
        n1.nodes.push(n2);
        n2.edges.push(e);
        n2.nodes.push(n1);
        if (this.render != null) {
          return this.render.trigger("add_edge", e);
        }
      } else {
        return console.log("already connected", n1.name, n2.name);
      }
    };
    Graph.prototype.disconnect = function(n1, n2) {
      var edge, _i, _len, _ref, _results;
      _ref = n1.edges;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        edge = _ref[_i];
        if ((edge != null) && edge.has(n2)) {
          _results.push(this.disconnect_edge(edge));
        }
      }
      return _results;
    };
    Graph.prototype.disconnect_edge = function(edge) {
      var e, i, _ref, _results;
      if (this.render != null) {
        this.render.trigger("delete_edge", edge);
      }
      edge.source.delete_edge(edge);
      edge.target.delete_edge(edge);
      _ref = this.edges;
      _results = [];
      for (i in _ref) {
        e = _ref[i];
        if ((e.has(edge.source) && e.has(edge.target)) || e === edge) {
          _results.push(this.edges.splice(i, 1));
        }
      }
      return _results;
    };
    Graph.prototype.get = function(name) {
      var node, _i, _len, _ref;
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        if (node.name === name) {
          return node;
        }
      }
    };
    Graph.prototype.exists = function(name) {
      return this.nodes.some(function(node) {
        return node.name === name;
      });
    };
    Graph.prototype.connected = function(n1, n2) {
      return n2.nodes.some(function(node) {
        return node === n1;
      });
    };
    Graph.prototype.distance = function(n1, n2) {
      var _ref;
      if (!(n1 != null) || !(n2 != null)) {
        console.log("not n1/not n2 :(");
        return;
      }
      (_ref = this.is_3d) != null ? _ref : this.is_3d = false;
      return (this.is_3d ? this.distance_3d : this.distance_2d)(n1, n2);
    };
    Graph.prototype.distance_3d = function(n1, n2, rand) {
      var d2, dx, dy, dz, x, _ref, _ref2;
      if (rand == null) {
        rand = true;
      }
      _ref = [n2.x - n1.x, n2.y - n1.y, n2.z - n1.z], dx = _ref[0], dy = _ref[1], dz = _ref[2];
      d2 = (dx * dx) + (dy * dy) + (dz * dz);
      if (d2 < 0.01 && rand === true) {
        x = function() {
          return Math.random() * 0.1 + 0.1;
        };
        _ref2 = [x(), x(), x()], dx = _ref2[0], dy = _ref2[1], dz = _ref2[2];
        d2 = (dx * dx) + (dy * dy) + (dz * dz);
      }
      return [d2, dx, dy, dz];
    };
    Graph.prototype.distance_2d = function(n1, n2) {
      var d2, dx, dy, x, _ref, _ref2;
      _ref = [n2.x - n1.x, n2.y - n1.y], dx = _ref[0], dy = _ref[1];
      d2 = (dx * dx) + (dy * dy);
      if (d2 < 0.01) {
        x = function() {
          return Math.random() * 0.1 + 0.1;
        };
        _ref2 = [x(), x()], dx = _ref2[0], dy = _ref2[1];
        d2 = dx * dx + dy * dy;
      }
      return [d2, dx, dy, 1];
    };
    Graph.prototype.shortest_paths = function() {
      var u, v, w, _fn, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _len6, _m, _n, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      this.paths = {};
      _ref = this.nodes;
      _fn = function(u) {};
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        u = _ref[_i];
        _fn(u);
        this.paths[u.name] = {};
        _ref2 = this.nodes;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          v = _ref2[_j];
          this.paths[u.name][v.name] = Infinity;
        }
        _ref3 = u.nodelist();
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
              if (v !== u) {
                this.paths[u.name][v.name] = Math.min(this.paths[u.name][v.name], this.paths[u.name][w.name] + this.paths[w.name][v.name]);
              }
            }
          }
        }
      }
      return this.paths;
    };
    return Graph;
  })();
  this.Graph = Graph;
}).call(this);
