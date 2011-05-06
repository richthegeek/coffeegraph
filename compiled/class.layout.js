(function() {
  var Layout;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Layout = (function() {
    function Layout(graph) {
      this.graph = graph;
      this.algorithm = false;
      this.interval = 20;
      this.it = document.getElementById('iteration');
    }
    Layout.prototype.select = function(name) {
      name = name.toLowerCase();
      if (name === "spring") {
        return this.algorithm = new Spring(this.graph);
      } else if (name === "kamadakawai" || name === "kamada") {
        return this.algorithm = new KamadaKawai(this.graph);
      }
    };
    Layout.prototype.finite = function(i, prep, bulk) {
      var f, j, _results;
      if (prep == null) {
        prep = true;
      }
      if (bulk == null) {
        bulk = false;
      }
      if (this.graph.iteration === i) {
        return;
      }
      if (prep) {
        this.graph.iteration = 0;
        this.algorithm.prepare();
      }
      if (bulk) {
        _results = [];
        for (j = 1; (1 <= i ? j <= i : j >= i); (1 <= i ? j += 1 : j -= 1)) {
          _results.push(this.iterate());
        }
        return _results;
      } else {
        this.iterate();
        f = __bind(function() {
          return this.finite(i, false, false);
        }, this);
        return setTimeout(f, this.interval);
      }
    };
    Layout.prototype.loop = function(prep) {
      var f, i;
      if (prep == null) {
        prep = true;
      }
      if (prep) {
        this.graph.iteration = 0;
        this.algorithm.prepare();
      }
      this.iterate();
      f = __bind(function() {
        return this.loop(false);
      }, this);
      i = this.graph.slowed ? this.interval * 10 : this.interval;
      return setTimeout(f, i);
    };
    Layout.prototype.iterate = function() {
      if (!(this.graph.paused || this.graph.dragging)) {
        this.algorithm.iterate();
        this.it.innerHTML = ++this.graph.iteration;
      }
      return this.graph.trigger("iteration", this.graph.iteration);
    };
    return Layout;
  })();
  this.Layout = Layout;
}).call(this);
