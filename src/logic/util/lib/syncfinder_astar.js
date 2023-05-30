// Generated by CoffeeScript 1.6.3
(function() {
  var Heap, SQRT2, backtrace, endLoc, grid, heuristic, locToClosed, locToF, locToG, locToH, locToOpen, locToParent, openList, startLoc, syncfinder_astar;

  Heap = require("./heap");

  openList = new Heap();

  startLoc = 0;

  endLoc = 0;

  grid = null;

  locToClosed = null;

  locToOpen = null;

  locToG = null;

  locToH = null;

  locToF = null;

  locToParent = null;

  SQRT2 = Math.SQRT2;

  heuristic = function(dx, dy) {
    return dx + dy;
  };

  backtrace = function(node) {
    var path;
    path = [];
    path.push(node);
    while (locToParent[node]) {
      node = locToParent[node];
      path.unshift(node);
    }
    return path;
  };

  syncfinder_astar = {
    findPathByBrickLoc: function(start, end, theGrid) {
      return syncfinder_astar.findPath(start >>> 16, start & 0xffff, end >>> 16, end & 0xffff, theGrid);
    },
    findPath: function(startX, startY, endX, endY, theGrid, allowDiagonal, dontCrossCorners, maxIterations) {
      var neighbor, neighborNode, neighbors, ng, node, nodeX, nodeY, x, y, _i, _len;
      if (allowDiagonal == null) {
        allowDiagonal = false;
      }
      if (dontCrossCorners == null) {
        dontCrossCorners = false;
      }
      if (maxIterations == null) {
        maxIterations = 0x7fffffff;
      }
      if (isNaN(startX) || startX < 0 || isNaN(startY) || startY < 0 || isNaN(endX) || endX < 0 || isNaN(endY) || endY < 0 || !theGrid) {
        console.log("ERROR [syncfinder_astar::findPath] bad arguments, startX:" + startX + ", startY:" + startY + ", endX:" + endX + ", endY:" + endY + ", theGrid:" + theGrid);
        return null;
      }
      startLoc = startX << 16 | startY;
      endLoc = endX << 16 | endY;
      grid = theGrid;
      locToClosed = {};
      locToOpen = {};
      locToG = {};
      locToF = {};
      locToH = {};
      locToParent = {};
      locToG[startLoc] = 0;
      locToF[startLoc] = 0;
      openList.reset(locToF);
      openList.push(startLoc);
      locToOpen[startLoc] = true;

      let numIterations = 0;
      while (openList.isNotEmpty()) {
        if (numIterations++ > maxIterations) {
          console.warn("WARNING [syncfinder_astar::findPath] max iterations reached, returning null");''
          return null;
        }
        node = openList.pop();
        locToClosed[node] = true;
        if (node === endLoc) {
          return backtrace(node);
        }
        nodeX = node >>> 16;
        nodeY = node & 0xffff;
        neighbors = grid.getNeighbors(nodeX, nodeY, allowDiagonal, dontCrossCorners);
        for (_i = 0, _len = neighbors.length; _i < _len; _i++) {
          neighbor = neighbors[_i];
          if (locToClosed[neighbor]) {
            continue;
          }
          x = neighbor >>> 16;
          y = neighbor & 0xffff;
          ng = locToG[node] + (x === nodeX || y === nodeY ? 1 : SQRT2);
          if ((!locToOpen[neighbor]) || (ng < locToG[neighbor])) {
            locToG[neighbor] = ng;
            locToH[neighbor] = locToH[neighbor] || heuristic(Math.abs(x - endX), Math.abs(y - endY));
            locToF[neighbor] = locToG[neighbor] + locToH[neighbor];
            neighborNode = x << 16 | y;
            locToParent[neighborNode] = node;
            if (!locToOpen[neighbor]) {
              openList.push(neighborNode);
              locToOpen[neighbor] = true;
            } else {
              openList.updateItem(neighborNode);
            }
          }
        }
      }
      return null;
    }
  };

  module.exports = syncfinder_astar;

}).call(this);
