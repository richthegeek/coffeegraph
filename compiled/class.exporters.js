(function() {
  var Exporters;
  Exporters = (function() {
    function Exporters(graph) {
      this.graph = graph;
    }
    Exporters.prototype.toString = function() {
      var n, n2, nl, output, _fn, _i, _j, _len, _len2, _ref, _ref2;
      output = [];
      _ref = this.graph.nodes;
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
    Exporters.prototype.asDot = function() {
      var e, text, _i, _len, _ref;
      text = [];
      text.push("graph g {");
      _ref = this.graph.edges;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        text.push('\t"' + e.source.name + '" -- "' + e.target.name + '";');
      }
      text.push("}");
      return text.join("\n");
    };
    Exporters.prototype.fromDot = function(data) {
      var es, line, lines, m, n1, n2, names, _fn, _i, _len;
      this.graph.clear();
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
        this.graph.connect(n1, n2);
      }
      return true;
    };
    Exporters.prototype.asJSON = function(position) {
      var edge, el, nl, node, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4;
      if (position == null) {
        position = true;
      }
      _ref = [[], []], nl = _ref[0], el = _ref[1];
      if (position) {
        _ref2 = this.graph.nodes;
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
        _ref3 = this.graph.nodes;
        for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
          node = _ref3[_j];
          nl.push(node.name);
        }
      }
      _ref4 = this.graph.edges;
      for (_k = 0, _len3 = _ref4.length; _k < _len3; _k++) {
        edge = _ref4[_k];
        el.push([edge.source.name, edge.target.name]);
      }
      return JSON.stringify({
        nodes: nl,
        edges: el
      });
    };
    Exporters.prototype.fromJSON = function(data) {
      var edge, n, node, _fn, _fn2, _i, _j, _len, _len2, _ref, _ref2;
      if (typeof data === "string") {
        data = JSON.parse(data);
      }
      this.graph.clear();
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
        this.graph.add_node(n);
      }
      _ref2 = data.edges;
      _fn2 = function(edge) {};
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        edge = _ref2[_j];
        _fn2(edge);
        this.graph.connect(edge[0], edge[1]);
      }
      return true;
    };
    Exporters.prototype.fromGraphML = function(data) {
      return this.fromXML(data, 'from', 'to');
    };
    Exporters.prototype.asGraphML = function() {
      var data, edge, i, node, _i, _len, _ref, _ref2;
      data = [];
      data.push('<?xml version="1.0" encoding="UTF-8"?>');
      data.push('<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">');
      data.push('<graph id="G" edgedefault="undirected">');
      _ref = this.graph.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        data.push('\t<node id="' + node.name + '" />');
      }
      _ref2 = this.graph.edges;
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
    Exporters.prototype.fromGXL = function(data) {
      return this.fromXML(data, 'source', 'target');
    };
    Exporters.prototype.asGXL = function() {
      var data, edge, i, node, _i, _len, _ref, _ref2;
      data = [];
      data.push('<?xml version="1.0" encoding="UTF-8"?>');
      data.push('<!DOCTYPE gxl SYSTEM "http://www.gupro.de/GXL/gxl-1.0.dtd">');
      data.push('<gxl xmlns:xlink=" http://www.w3.org/1999/xlink">');
      data.push('<graph id="G" edgemode="undirected" >');
      _ref = this.graph.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        data.push('\t<node id="' + node.name + '" />');
      }
      _ref2 = this.graph.edges;
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
    Exporters.prototype.fromXML = function(data, s, t) {
      var a;
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
      this.graph.clear();
      data.find('node').each(function() {
        return this.graph.add_node(new Node($(this).attr('id')));
      });
      data.find('edge').each(function() {
        return this.graph.connect($(this).attr(s), $(this).attr(t));
      });
      return true;
    };
    return Exporters;
  })();
  this.Exporters = Exporters;
}).call(this);
