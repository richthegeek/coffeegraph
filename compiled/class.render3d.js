(function() {
  var Render3D;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Render3D = (function() {
    __extends(Render3D, EventDriver);
    Render3D.prototype.iteration = 0;
    function Render3D(canvas, graph) {
      this.graph = graph;
      this.zoom = __bind(this.zoom, this);;
      this.mousemove = __bind(this.mousemove, this);;
      this.mouseup = __bind(this.mouseup, this);;
      this.mousedown = __bind(this.mousedown, this);;
      this.delete_node = __bind(this.delete_node, this);;
      this.delete_edge = __bind(this.delete_edge, this);;
      this.resize = __bind(this.resize, this);;
      if (canvas) {
        this.set_canvas(canvas);
      }
      this.graph.render = this;
      this.graph.is_3d = true;
      this.data = {
        radius: 600,
        t: 45,
        ot: 45,
        p: 45,
        op: 45,
        ox: 0,
        oy: 0,
        oe: false
      };
      this.scene = new THREE.Scene();
      this.renderer = new THREE.CanvasRenderer();
      this.renderer.setSize(this.canvas_width, this.canvas_height);
      this.canvas_dom.appendChild(this.renderer.domElement);
      this.materials = {
        node: new THREE.ParticleCircleMaterial({
          color: 0x444444,
          opacity: 1
        }),
        targ: new THREE.ParticleCircleMaterial({
          color: 0x000000,
          opacity: 0.05
        }),
        edge: new THREE.LineBasicMaterial({
          color: 0x888888,
          opacity: 0.5,
          linewidth: 1
        })
      };
      this.target = new THREE.Particle(this.materials.targ);
      this.target.scale.x = this.target.scale.y = 5;
      this.target.matrixAutoUpdate = true;
      this.scene.addObject(this.target);
      this.camera = new THREE.Camera(60, this.canvas_width / this.canvas_height, 1, 10000, this.target);
      this.camera_update();
      this.canvas_dom.addEventListener('mousedown', this.mousedown, false);
      this.canvas_dom.addEventListener('mouseup', this.mouseup, false);
      this.canvas_dom.addEventListener('mousemove', this.mousemove, false);
      document.addEventListener('mousewheel', this.zoom, false);
      document.addEventListener('DOMMouseScroll', this.zoom, false);
      this.bind('resize', this.resize);
      this.bind('delete_edge', this.delete_edge);
      this.bind('delete_node', this.delete_node);
    }
    Render3D.prototype.resize = function(e) {
      this.set_canvas(this.canvas);
      this.camera = new THREE.Camera(60, this.canvas_width / this.canvas_height, 1, 10000, this.target);
      this.renderer.setSize(this.canvas_width, this.canvas_height);
      this.canvas_dom.appendChild(this.renderer.domElement);
      return this.camera_update();
    };
    Render3D.prototype.delete_edge = function(e) {
      if (typeof e !== "undefined" && typeof this.objects !== "undefined" && typeof this.objects[e.source.name + "_" + e.target.name + "l"] !== "undefined") {
        return this.scene.removeObject(this.objects[e.source.name + "_" + e.target.name + "l"]);
      }
    };
    Render3D.prototype.delete_node = function(e) {
      if (typeof e !== "undefined" && typeof this.objects !== "undefined" && typeof this.objects[e.name] !== "undefined") {
        return this.scene.removeObject(this.objects[e.name]);
      }
    };
    Render3D.prototype.mousedown = function(e) {
      var _ref;
      e.preventDefault();
      return _ref = [true, this.data.t, this.data.p, e.clientX, e.clientY], this.data.oe = _ref[0], this.data.ot = _ref[1], this.data.op = _ref[2], this.data.ox = _ref[3], this.data.oy = _ref[4], _ref;
    };
    Render3D.prototype.mouseup = function(e) {
      return this.data.oe = false;
    };
    Render3D.prototype.mousemove = function(e) {
      e.preventDefault();
      if (this.data.oe) {
        this.data.t = 0 - ((e.clientX - this.data.ox) * 0.5) + this.data.ot;
        this.data.p = ((e.clientY - this.data.oy) * 0.5) + this.data.op;
        if (this.data.p > 180) {
          this.data.p -= 300;
        }
        if (this.data.p < -180) {
          this.data.p += 300;
        }
        return this.draw();
      }
    };
    Render3D.prototype.zoom = function(e) {
      var d;
      e.preventDefault();
      d = (e.wheelDelta != null ? e.wheelDelta : e.detail * 40);
      this.data.radius = Math.max(this.data.radius - d, 100);
      this.camera_update();
      this.camera.updateMatrix();
      return this.draw();
    };
    Render3D.prototype.render = function() {
      this.camera_update();
      return this.renderer.render(this.scene, this.camera);
    };
    Render3D.prototype.set_canvas = function(canvas) {
      this.canvas = canvas;
      if (typeof this.canvas === 'string') {
        this.canvas = document.getElementById(canvas);
      }
      if (this.canvas != null) {
        $(this.canvas_dom).empty();
      }
      this.canvas_dom = this.canvas;
      this.canvas_width = this.canvas.clientWidth;
      return this.canvas_height = this.canvas.clientHeight;
    };
    Render3D.prototype.camera_update = function() {
      var c, mp3, n, o, xa, ya, za, _fn, _i, _len, _ref, _ref2, _ref3, _ref4;
      mp3 = Math.PI / 360;
      if (this.objects != null) {
        _ref = [0, 0, 0, this.graph.nodes.length], xa = _ref[0], ya = _ref[1], za = _ref[2], c = _ref[3];
        _ref2 = this.graph.nodes;
        _fn = __bind(function(n) {}, this);
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          n = _ref2[_i];
          _fn(n);
          o = this.objects[n.name];
          if (typeof o === "undefined") {
            continue;
          }
          o = o.position;
          _ref3 = [xa + (o.x / c), ya + (o.y / c), za + (o.z / c)], xa = _ref3[0], ya = _ref3[1], za = _ref3[2];
        }
        _ref4 = [xa, ya, za], this.target.position.x = _ref4[0], this.target.position.y = _ref4[1], this.target.position.z = _ref4[2];
      }
      this.camera.position.x = this.data.radius * Math.sin(this.data.t * mp3) * Math.cos(this.data.p * mp3);
      this.camera.position.y = this.data.radius * Math.sin(this.data.p * Math.PI / 360);
      this.camera.position.z = this.data.radius * Math.cos(this.data.t * mp3) * Math.cos(this.data.p * mp3);
      this.camera.target.updateMatrix();
      return this.camera.updateMatrix();
    };
    Render3D.prototype.draw = function() {
      var e, en, enl, geo, line, n, par, par1, par2, _fn, _fn2, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      (_ref = this.objects) != null ? _ref : this.objects = {};
      _ref2 = this.graph.nodes;
      _fn = __bind(function(n) {}, this);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        n = _ref2[_i];
        _fn(n);
        if (!this.objects[n.name]) {
          par = new THREE.Particle(this.materials.node);
          par.matrixAutoUpdate = true;
          this.objects[n.name] = par;
          this.scene.addObject(par);
        } else {
          par = this.objects[n.name];
        }
        _ref3 = [n.x, n.y, n.z], par.position.x = _ref3[0], par.position.y = _ref3[1], par.position.z = _ref3[2];
        par.position.multiplyScalar(40);
        par.scale.x = par.scale.y = par.scale.z = Math.sqrt(this.data.radius) / 12;
        par.updateMatrix();
      }
      (_ref4 = this.iteration) != null ? _ref4 : this.iteration = 0;
      (_ref5 = this.i) != null ? _ref5 : this.i = 1;
      (_ref6 = this.cube) != null ? _ref6 : this.cube = new Cube(1, 1, 1);
      _ref7 = this.graph.edges;
      _fn2 = __bind(function(e) {}, this);
      for (_j = 0, _len2 = _ref7.length; _j < _len2; _j++) {
        e = _ref7[_j];
        _fn2(e);
        par1 = this.objects[e.source.name];
        par2 = this.objects[e.target.name];
        en = e.source.name + "_" + e.target.name;
        enl = en + "l";
        if (!(this.objects[en] != null)) {
          geo = new THREE.Geometry();
          geo.vertices.push(new THREE.Vertex(par1.position));
          geo.vertices.push(new THREE.Vertex(par2.position));
          this.objects[en] = geo;
          line = new THREE.Line(geo, this.materials.edge);
          line.matrixAutoUpdate = true;
          this.objects[enl] = line;
          this.scene.addObject(line);
        }
        geo = this.objects[en];
        _ref8 = [par1.position.x, par1.position.y, par1.position.z], geo.vertices[0].position.x = _ref8[0], geo.vertices[0].position.y = _ref8[1], geo.vertices[0].position.z = _ref8[2];
        _ref9 = [par2.position.x, par2.position.y, par2.position.z], geo.vertices[1].position.x = _ref9[0], geo.vertices[1].position.y = _ref9[1], geo.vertices[1].position.z = _ref9[2];
      }
      return this.render();
    };
    return Render3D;
  })();
  window.Render3D = Render3D;
}).call(this);
