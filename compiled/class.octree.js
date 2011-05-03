(function() {
  /*
  #	Oct-Tree class, converted basically directly from
  #
  #		http://code.activestate.com/recipes/498121/
  #
  #	I have 'fixed' the bug mentioned in the comments so branch 6 is +++ instead of +--
  #	but this could well be wrong (as I'm not sure what the bug caused in teh first place)
  #
  #	Major change is that it uses tne object's {x,y,z} attributes for positions instead of
  #   a position attribute array.
  #
  */  var OctNode, Octree;
  OctNode = (function() {
    function OctNode(node, size, data) {
      this.node = node;
      this.x = node.x;
      this.y = node.y;
      this.z = node.z;
      this.size = size;
      this.data = data;
      this.isLeafNode = true;
      this.branches = [null, null, null, null, null, null, null, null];
    }
    return OctNode;
  })();
  Octree = (function() {
    Octree.prototype.DIRLOOKUP = {
      "3": 0,
      "2": 1,
      "-2": 2,
      "-1": 3,
      "1": 4,
      "0": 5,
      "-4": 6,
      "-3": 7
    };
    Octree.prototype.MAX_OBJECTS = 10;
    function Octree(worldSize) {
      this.root = this.addNode({
        x: 0,
        y: 0,
        z: 0
      }, worldSize, []);
      this.worldSize = worldSize;
    }
    Octree.prototype.addNode = function(position, size, objects) {
      return new OctNode(position, size, objects);
    };
    Octree.prototype.insertNode = function(root, size, parent, objData) {
      var branch, newCenter, newSize, ob, objList, offset, pos, _fn, _i, _len;
      if (root === null) {
        pos = parent;
        offset = size / 2;
        branch = this.findBranch(parent, objData);
        newCenter = {
          x: 0,
          y: 0,
          z: 0
        };
        if (branch === 0) {
          newCenter = {
            x: pos.x - offset,
            y: pos.y - offset,
            z: pos.z - offset
          };
        } else if (branch === 1) {
          newCenter = {
            x: pos.x - offset,
            y: pos.y - offset,
            z: pos.z + offset
          };
        } else if (branch === 2) {
          newCenter = {
            x: pos.x + offset,
            y: pos.y - offset,
            z: pos.z + offset
          };
        } else if (branch === 3) {
          newCenter = {
            x: pos.x + offset,
            y: pos.y - offset,
            z: pos.z - offset
          };
        } else if (branch === 4) {
          newCenter = {
            x: pos.x - offset,
            y: pos.y + offset,
            z: pos.z - offset
          };
        } else if (branch === 5) {
          newCenter = {
            x: pos.x - offset,
            y: pos.y + offset,
            z: pos.z + offset
          };
        } else if (branch === 6) {
          newCenter = {
            x: pos.x + offset,
            y: pos.y + offset,
            z: pos.z + offset
          };
        } else if (branch === 7) {
          newCenter = {
            x: pos.x + offset,
            y: pos.y + offset,
            z: pos.z - offset
          };
        }
        return this.addNode(newCenter, size, [objData]);
      } else if (root.position !== objData.position && !root.isLeafNode) {
        branch = this.findBranch(root, objData);
        newSize = root.size / 2;
        root.branches[branch] = this.insertNode(root.branches[branch], newSize, root, objData);
      } else if (root.isLeafNode) {
        if (root.data.length < this.MAX_OBJECTS) {
          root.data.push(objData);
        } else if (root.data.length === this.MAX_OBJECTS) {
          root.data.push(objData);
          objList = root.data.slice();
          root.data = null;
          root.isLeafNode = false;
          newSize = root.size / 2;
          _fn = function(ob) {};
          for (_i = 0, _len = objList.length; _i < _len; _i++) {
            ob = objList[_i];
            _fn(ob);
            branch = this.findBranch(root, ob);
            root.branches[branch] = this.insertNode(root.branches[branch], newSize, root, ob);
          }
        }
      }
      return root;
    };
    Octree.prototype.findPosition = function(root, position) {
      var branch;
      if (!(root != null)) {
        return null;
      } else if (root.isLeafNode) {
        return root.data;
      } else {
        branch = this.findBranch(root, position);
        return this.findPosition(root.branches[branch], position);
      }
    };
    Octree.prototype.findBranch = function(root, position) {
      var i, result, tm, tp, vec1, vec2, _fn, _i, _len, _ref;
      vec1 = root;
      vec2 = position;
      result = 0;
      tm = {
        x: -2,
        y: -1,
        z: -1
      };
      tp = {
        x: 2,
        y: 1,
        z: 0
      };
      _ref = ['x', 'y', 'z'];
      _fn = function(i) {};
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        _fn(i);
        if (vec1[i] <= vec2[i]) {
          result += tm[i];
        } else {
          result += tp[i];
        }
      }
      result = this.DIRLOOKUP[result];
      return result;
    };
    return Octree;
  })();
  this.Octree = Octree;
}).call(this);
