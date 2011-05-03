(function() {
  var Edge;
  Edge = (function() {
    function Edge(n1, n2) {
      this.source = n1;
      this.target = n2;
    }
    Edge.prototype.has = function(node) {
      return (this.source === node) || (this.target === node);
    };
    Edge.prototype.other = function(node) {
      if (this.source === node) {
        return this.target;
      } else {
        return this.source;
      }
    };
    Edge.prototype.toString = function() {
      return this.source.name + this.target.name;
    };
    return Edge;
  })();
  this.Edge = Edge;
}).call(this);
