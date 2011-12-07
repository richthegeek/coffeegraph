(function() {
  var Linegraph;
  Linegraph = (function() {
    function Linegraph(canvas, data, style) {
      var d, k, v, _i, _len;
      this.auto_draw = true;
      this.style = {};
      this.style.background = {
        "stroke": 0
      };
      this.style.axis = {
        x: {},
        y: {}
      };
      this.style.axis.x.grid = false;
      this.style.axis.y.grid = {
        stroke: "#000",
        "stroke-width": 0.1,
        step: 30
      };
      this.style.line = {
        stroke: "#248",
        "stroke-width": "2px",
        min: {
          stroke: "#842",
          "stroke-width": "2px"
        },
        max: {
          stroke: "#000",
          "stroke-width": "2px"
        }
      };
      this.data = {};
      this.data.points = {};
      this.data.points._length = 0;
      this.data.scale = {};
      this.data.info = {};
      this.stack = [];
      if (canvas != null) {
        this.set_canvas(canvas);
      }
      if (data != null) {
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          d = data[_i];
          this.add(d);
        }
      }
      if (style != null) {
        for (k in style) {
          v = style[k];
          this.style[k] = v;
        }
      }
    }
    Linegraph.prototype.set_canvas = function(canvas) {
      var h, w;
      if (typeof canvas === "string") {
        if (typeof jQuery !== "undefined" && jQuery !== null) {
          canvas = $(canvas)[0];
          w = $(canvas).width();
          h = $(canvas).height();
        } else {
          canvas = document.getElementById(canvas);
          w = canvas.clientWidth;
          h = canvas.clientHeight;
        }
      }
      if ((!(canvas != null)) || ((canvas.length != null) && canvas.length === 0)) {
        return false;
      }
      this.canvas = {
        element: canvas,
        width: w,
        height: h
      };
      this.canvas.raphael = new Raphael(this.canvas.element, this.canvas.width, this.canvas.height);
      return this.canvas;
    };
    Linegraph.prototype.add = function(number, dataset) {
      var nmax, omax, y, _i, _len, _ref;
      if (dataset == null) {
        dataset = 0;
      }
      if (!(this.data.points[dataset] != null)) {
        this.data.points[dataset] = [number];
        this.data.points._length += 1;
        this.data.scale[dataset] = {
          x: 5,
          y: this.canvas.height / number
        };
        this.data.info[dataset] = {
          max: number,
          name: "Set " + dataset,
          min: Math.min(0, number)
        };
      } else {
        this.data.points[dataset].push(number);
        this.data.points[dataset] = this.data.points[dataset].slice(0 - (this.canvas.width / 5));
        omax = this.data.info[dataset].max;
        nmax = 0;
        _ref = this.data.points[dataset];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          y = _ref[_i];
          nmax = Math.max(y, nmax);
        }
        if (Math.abs(nmax - omax) > (nmax / 50)) {
          nmax -= 0.5 * (nmax - omax);
        }
        this.data.info[dataset].max = nmax;
        this.data.scale[dataset].y = 0.95 * this.canvas.height / this.data.info[dataset].max;
      }
      if (this.auto_draw) {
        return this.draw();
      }
    };
    Linegraph.prototype.draw = function() {
      var k, path, scale, style, v, x, y, _fn, _i, _len, _ref, _ref2, _ref3, _results;
      if (!(this.graph != null)) {
        this.draw_outer();
      }
      scale = 99999;
      _ref = this.data.scale;
      for (k in _ref) {
        v = _ref[k];
        scale = Math.min(v.y, scale);
      }
      _ref2 = this.data.points;
      _fn = function(k, v) {};
      _results = [];
      for (k in _ref2) {
        v = _ref2[k];
        _fn(k, v);
        if (k === "_length") {
          continue;
        }
        _ref3 = [0, ["M", 0, this.canvas.height - (scale * v[0])]], x = _ref3[0], path = _ref3[1];
        for (_i = 0, _len = v.length; _i < _len; _i++) {
          y = v[_i];
          path.push("L", (x += this.data.scale[k].x) - this.data.scale[k].x, this.canvas.height - (y * scale));
        }
        path = path.join(" ");
        if (path.match(/NaN/)) {
          continue;
        }
        _results.push(this.data.info[k].line != null ? this.data.info[k].line.attr("path", path) : (this.style.line[k] != null ? style = this.style.line[k] : this.style.line.length != null ? style = this.style.line[0] : style = this.style.line, this.data.info[k].line = this.canvas.raphael.path(path).attr(style)));
      }
      return _results;
    };
    Linegraph.prototype.draw_outer = function() {
      var p, x, y, _ref, _ref2;
      this.canvas.raphael.rect(0, 0, this.canvas.width, this.canvas.height).attr(this.style.background);
      if (this.style.axis.x.grid) {
        _ref = [0, []], x = _ref[0], p = _ref[1];
        while ((x += this.style.axis.x.grid.step) < this.canvas.width) {
          p.push("M", x, 0, "L", x, this.canvas.height);
        }
        this.canvas.raphael.path(p).attr(this.style.axis.x.grid);
      }
      if (this.style.axis.y.grid) {
        _ref2 = [0, []], y = _ref2[0], p = _ref2[1];
        while ((y += this.style.axis.y.grid.step) < this.canvas.height) {
          p.push("M", 0, y, "L", this.canvas.width, y);
        }
        this.canvas.raphael.path(p).attr(this.style.axis.y.grid);
      }
      this.graph = true;
    };
    return Linegraph;
  })();
  this.Linegraph = Linegraph;
}).call(this);
