(function() {
  var Mixed;
  Mixed = (function() {
    function Mixed(graph) {
      this.graph = graph;
      this.kamada = new KamadaKawai(graph);
      this.spring = new Spring(graph);
    }
    Mixed.prototype.prepare = function() {
      this.spring.prepare();
      return this.kamada.prepare();
    };
    Mixed.prototype.iterate = function() {
      var i;
      if (this.graph.iteration < this.graph.nodes.length) {
        for (i = 1; i <= 10; i++) {
          this.kamada.iterate();
        }
      }
      return this.spring.iterate();
    };
    return Mixed;
  })();
  this.Mixed = Mixed;
}).call(this);
