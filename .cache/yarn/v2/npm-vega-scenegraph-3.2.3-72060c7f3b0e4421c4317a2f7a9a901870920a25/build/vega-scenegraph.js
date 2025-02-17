(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vega-util'), require('vega-canvas'), require('vega-loader'), require('d3-shape'), require('d3-path')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vega-util', 'vega-canvas', 'vega-loader', 'd3-shape', 'd3-path'], factory) :
  (factory((global.vega = {}),global.vega,global.vega,global.vega,global.d3,global.d3));
}(this, (function (exports,vegaUtil,vegaCanvas,vegaLoader,d3Shape,d3Path) { 'use strict';

  function Bounds(b) {
    this.clear();
    if (b) this.union(b);
  }

  var prototype = Bounds.prototype;

  prototype.clone = function() {
    return new Bounds(this);
  };

  prototype.clear = function() {
    this.x1 = +Number.MAX_VALUE;
    this.y1 = +Number.MAX_VALUE;
    this.x2 = -Number.MAX_VALUE;
    this.y2 = -Number.MAX_VALUE;
    return this;
  };

  prototype.empty = function() {
    return (
      this.x1 === +Number.MAX_VALUE &&
      this.y1 === +Number.MAX_VALUE &&
      this.x2 === -Number.MAX_VALUE &&
      this.y2 === -Number.MAX_VALUE
    );
  };

  prototype.set = function(x1, y1, x2, y2) {
    if (x2 < x1) {
      this.x2 = x1;
      this.x1 = x2;
    } else {
      this.x1 = x1;
      this.x2 = x2;
    }
    if (y2 < y1) {
      this.y2 = y1;
      this.y1 = y2;
    } else {
      this.y1 = y1;
      this.y2 = y2;
    }
    return this;
  };

  prototype.add = function(x, y) {
    if (x < this.x1) this.x1 = x;
    if (y < this.y1) this.y1 = y;
    if (x > this.x2) this.x2 = x;
    if (y > this.y2) this.y2 = y;
    return this;
  };

  prototype.expand = function(d) {
    this.x1 -= d;
    this.y1 -= d;
    this.x2 += d;
    this.y2 += d;
    return this;
  };

  prototype.round = function() {
    this.x1 = Math.floor(this.x1);
    this.y1 = Math.floor(this.y1);
    this.x2 = Math.ceil(this.x2);
    this.y2 = Math.ceil(this.y2);
    return this;
  };

  prototype.translate = function(dx, dy) {
    this.x1 += dx;
    this.x2 += dx;
    this.y1 += dy;
    this.y2 += dy;
    return this;
  };

  prototype.rotate = function(angle, x, y) {
    var cos = Math.cos(angle),
        sin = Math.sin(angle),
        cx = x - x*cos + y*sin,
        cy = y - x*sin - y*cos,
        x1 = this.x1, x2 = this.x2,
        y1 = this.y1, y2 = this.y2;

    return this.clear()
      .add(cos*x1 - sin*y1 + cx,  sin*x1 + cos*y1 + cy)
      .add(cos*x1 - sin*y2 + cx,  sin*x1 + cos*y2 + cy)
      .add(cos*x2 - sin*y1 + cx,  sin*x2 + cos*y1 + cy)
      .add(cos*x2 - sin*y2 + cx,  sin*x2 + cos*y2 + cy);
  };

  prototype.union = function(b) {
    if (b.x1 < this.x1) this.x1 = b.x1;
    if (b.y1 < this.y1) this.y1 = b.y1;
    if (b.x2 > this.x2) this.x2 = b.x2;
    if (b.y2 > this.y2) this.y2 = b.y2;
    return this;
  };

  prototype.intersect = function(b) {
    if (b.x1 > this.x1) this.x1 = b.x1;
    if (b.y1 > this.y1) this.y1 = b.y1;
    if (b.x2 < this.x2) this.x2 = b.x2;
    if (b.y2 < this.y2) this.y2 = b.y2;
    return this;
  };

  prototype.encloses = function(b) {
    return b && (
      this.x1 <= b.x1 &&
      this.x2 >= b.x2 &&
      this.y1 <= b.y1 &&
      this.y2 >= b.y2
    );
  };

  prototype.alignsWith = function(b) {
    return b && (
      this.x1 == b.x1 ||
      this.x2 == b.x2 ||
      this.y1 == b.y1 ||
      this.y2 == b.y2
    );
  };

  prototype.intersects = function(b) {
    return b && !(
      this.x2 < b.x1 ||
      this.x1 > b.x2 ||
      this.y2 < b.y1 ||
      this.y1 > b.y2
    );
  };

  prototype.contains = function(x, y) {
    return !(
      x < this.x1 ||
      x > this.x2 ||
      y < this.y1 ||
      y > this.y2
    );
  };

  prototype.width = function() {
    return this.x2 - this.x1;
  };

  prototype.height = function() {
    return this.y2 - this.y1;
  };

  var gradient_id = 0;

  function Gradient(p0, p1) {
    var stops = [], gradient;
    return gradient = {
      id: 'gradient_' + (gradient_id++),
      x1: p0 ? p0[0] : 0,
      y1: p0 ? p0[1] : 0,
      x2: p1 ? p1[0] : 1,
      y2: p1 ? p1[1] : 0,
      stops: stops,
      stop: function(offset, color) {
        stops.push({offset: offset, color: color});
        return gradient;
      }
    };
  }

  function Item(mark) {
    this.mark = mark;
    this.bounds = (this.bounds || new Bounds());
  }

  function GroupItem(mark) {
    Item.call(this, mark);
    this.items = (this.items || []);
  }

  vegaUtil.inherits(GroupItem, Item);

  function ResourceLoader(customLoader) {
    this._pending = 0;
    this._loader = customLoader || vegaLoader.loader();
  }

  var prototype$1 = ResourceLoader.prototype;

  prototype$1.pending = function() {
    return this._pending;
  };

  function increment(loader) {
    loader._pending += 1;
  }

  function decrement(loader) {
    loader._pending -= 1;
  }

  prototype$1.sanitizeURL = function(uri) {
    var loader = this;
    increment(loader);

    return loader._loader.sanitize(uri, {context:'href'})
      .then(function(opt) {
        decrement(loader);
        return opt;
      })
      .catch(function() {
        decrement(loader);
        return null;
      });
  };

  prototype$1.loadImage = function(uri) {
    var loader = this,
        Image = vegaCanvas.image();
    increment(loader);

    return loader._loader
      .sanitize(uri, {context: 'image'})
      .then(function(opt) {
        var url = opt.href;
        if (!url || !Image) throw {url: url};

        var img = new Image();

        img.onload = function() {
          decrement(loader);
          img.loaded = true;
        };

        img.onerror = function() {
          decrement(loader);
          img.loaded = false;
        };

        img.src = url;
        return img;
      })
      .catch(function(e) {
        decrement(loader);
        return {loaded: false, width: 0, height: 0, src: e && e.url || ''};
      });
  };

  prototype$1.ready = function() {
    var loader = this;
    return new Promise(function(accept) {
      function poll(value) {
        if (!loader.pending()) accept(value);
        else setTimeout(function() { poll(true); }, 10);
      }
      poll(false);
    });
  };

  var lookup = {
    'basis': {
      curve: d3Shape.curveBasis
    },
    'basis-closed': {
      curve: d3Shape.curveBasisClosed
    },
    'basis-open': {
      curve: d3Shape.curveBasisOpen
    },
    'bundle': {
      curve: d3Shape.curveBundle,
      tension: 'beta',
      value: 0.85
    },
    'cardinal': {
      curve: d3Shape.curveCardinal,
      tension: 'tension',
      value: 0
    },
    'cardinal-open': {
      curve: d3Shape.curveCardinalOpen,
      tension: 'tension',
      value: 0
    },
    'cardinal-closed': {
      curve: d3Shape.curveCardinalClosed,
      tension: 'tension',
      value: 0
    },
    'catmull-rom': {
      curve: d3Shape.curveCatmullRom,
      tension: 'alpha',
      value: 0.5
    },
    'catmull-rom-closed': {
      curve: d3Shape.curveCatmullRomClosed,
      tension: 'alpha',
      value: 0.5
    },
    'catmull-rom-open': {
      curve: d3Shape.curveCatmullRomOpen,
      tension: 'alpha',
      value: 0.5
    },
    'linear': {
      curve: d3Shape.curveLinear
    },
    'linear-closed': {
      curve: d3Shape.curveLinearClosed
    },
    'monotone': {
      horizontal: d3Shape.curveMonotoneY,
      vertical:   d3Shape.curveMonotoneX
    },
    'natural': {
      curve: d3Shape.curveNatural
    },
    'step': {
      curve: d3Shape.curveStep
    },
    'step-after': {
      curve: d3Shape.curveStepAfter
    },
    'step-before': {
      curve: d3Shape.curveStepBefore
    }
  };

  function curves(type, orientation, tension) {
    var entry = lookup.hasOwnProperty(type) && lookup[type],
        curve = null;

    if (entry) {
      curve = entry.curve || entry[orientation || 'vertical'];
      if (entry.tension && tension != null) {
        curve = curve[entry.tension](tension);
      }
    }

    return curve;
  }

  // Path parsing and rendering code adapted from fabric.js -- Thanks!
  var cmdlen = { m:2, l:2, h:1, v:1, c:6, s:4, q:4, t:2, a:7 },
      regexp = [/([MLHVCSQTAZmlhvcsqtaz])/g, /###/, /(\d)([-+])/g, /\s|,|###/];

  function pathParse(pathstr) {
    var result = [],
        path,
        curr,
        chunks,
        parsed, param,
        cmd, len, i, j, n, m;

    // First, break path into command sequence
    path = pathstr
      .slice()
      .replace(regexp[0], '###$1')
      .split(regexp[1])
      .slice(1);

    // Next, parse each command in turn
    for (i=0, n=path.length; i<n; ++i) {
      curr = path[i];
      chunks = curr
        .slice(1)
        .trim()
        .replace(regexp[2],'$1###$2')
        .split(regexp[3]);
      cmd = curr.charAt(0);

      parsed = [cmd];
      for (j=0, m=chunks.length; j<m; ++j) {
        if ((param = +chunks[j]) === param) { // not NaN
          parsed.push(param);
        }
      }

      len = cmdlen[cmd.toLowerCase()];
      if (parsed.length-1 > len) {
        for (j=1, m=parsed.length; j<m; j+=len) {
          result.push([cmd].concat(parsed.slice(j, j+len)));
        }
      }
      else {
        result.push(parsed);
      }
    }

    return result;
  }

  var segmentCache = {};
  var bezierCache = {};

  var join = [].join;

  // Copied from Inkscape svgtopdf, thanks!
  function segments(x, y, rx, ry, large, sweep, rotateX, ox, oy) {
    var key = join.call(arguments);
    if (segmentCache[key]) {
      return segmentCache[key];
    }

    var th = rotateX * (Math.PI/180);
    var sin_th = Math.sin(th);
    var cos_th = Math.cos(th);
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    var px = cos_th * (ox - x) * 0.5 + sin_th * (oy - y) * 0.5;
    var py = cos_th * (oy - y) * 0.5 - sin_th * (ox - x) * 0.5;
    var pl = (px*px) / (rx*rx) + (py*py) / (ry*ry);
    if (pl > 1) {
      pl = Math.sqrt(pl);
      rx *= pl;
      ry *= pl;
    }

    var a00 = cos_th / rx;
    var a01 = sin_th / rx;
    var a10 = (-sin_th) / ry;
    var a11 = (cos_th) / ry;
    var x0 = a00 * ox + a01 * oy;
    var y0 = a10 * ox + a11 * oy;
    var x1 = a00 * x + a01 * y;
    var y1 = a10 * x + a11 * y;

    var d = (x1-x0) * (x1-x0) + (y1-y0) * (y1-y0);
    var sfactor_sq = 1 / d - 0.25;
    if (sfactor_sq < 0) sfactor_sq = 0;
    var sfactor = Math.sqrt(sfactor_sq);
    if (sweep == large) sfactor = -sfactor;
    var xc = 0.5 * (x0 + x1) - sfactor * (y1-y0);
    var yc = 0.5 * (y0 + y1) + sfactor * (x1-x0);

    var th0 = Math.atan2(y0-yc, x0-xc);
    var th1 = Math.atan2(y1-yc, x1-xc);

    var th_arc = th1-th0;
    if (th_arc < 0 && sweep === 1) {
      th_arc += 2 * Math.PI;
    } else if (th_arc > 0 && sweep === 0) {
      th_arc -= 2 * Math.PI;
    }

    var segs = Math.ceil(Math.abs(th_arc / (Math.PI * 0.5 + 0.001)));
    var result = [];
    for (var i=0; i<segs; ++i) {
      var th2 = th0 + i * th_arc / segs;
      var th3 = th0 + (i+1) * th_arc / segs;
      result[i] = [xc, yc, th2, th3, rx, ry, sin_th, cos_th];
    }

    return (segmentCache[key] = result);
  }

  function bezier(params) {
    var key = join.call(params);
    if (bezierCache[key]) {
      return bezierCache[key];
    }

    var cx = params[0],
        cy = params[1],
        th0 = params[2],
        th1 = params[3],
        rx = params[4],
        ry = params[5],
        sin_th = params[6],
        cos_th = params[7];

    var a00 = cos_th * rx;
    var a01 = -sin_th * ry;
    var a10 = sin_th * rx;
    var a11 = cos_th * ry;

    var cos_th0 = Math.cos(th0);
    var sin_th0 = Math.sin(th0);
    var cos_th1 = Math.cos(th1);
    var sin_th1 = Math.sin(th1);

    var th_half = 0.5 * (th1 - th0);
    var sin_th_h2 = Math.sin(th_half * 0.5);
    var t = (8/3) * sin_th_h2 * sin_th_h2 / Math.sin(th_half);
    var x1 = cx + cos_th0 - t * sin_th0;
    var y1 = cy + sin_th0 + t * cos_th0;
    var x3 = cx + cos_th1;
    var y3 = cy + sin_th1;
    var x2 = x3 + t * sin_th1;
    var y2 = y3 - t * cos_th1;

    return (bezierCache[key] = [
      a00 * x1 + a01 * y1,  a10 * x1 + a11 * y1,
      a00 * x2 + a01 * y2,  a10 * x2 + a11 * y2,
      a00 * x3 + a01 * y3,  a10 * x3 + a11 * y3
    ]);
  }

  var temp = ['l', 0, 0, 0, 0, 0, 0, 0];

  function scale(current, s) {
    var c = (temp[0] = current[0]);
    if (c === 'a' || c === 'A') {
      temp[1] = s * current[1];
      temp[2] = s * current[2];
      temp[3] = current[3];
      temp[4] = current[4];
      temp[5] = current[5];
      temp[6] = s * current[6];
      temp[7] = s * current[7];
    } else {
      for (var i=1, n=current.length; i<n; ++i) {
        temp[i] = s * current[i];
      }
    }
    return temp;
  }

  function pathRender(context, path, l, t, s) {
    var current, // current instruction
        previous = null,
        x = 0, // current x
        y = 0, // current y
        controlX = 0, // current control point x
        controlY = 0, // current control point y
        tempX,
        tempY,
        tempControlX,
        tempControlY;

    if (l == null) l = 0;
    if (t == null) t = 0;
    if (s == null) s = 1;

    if (context.beginPath) context.beginPath();

    for (var i=0, len=path.length; i<len; ++i) {
      current = path[i];
      if (s !== 1) current = scale(current, s);

      switch (current[0]) { // first letter

        case 'l': // lineto, relative
          x += current[1];
          y += current[2];
          context.lineTo(x + l, y + t);
          break;

        case 'L': // lineto, absolute
          x = current[1];
          y = current[2];
          context.lineTo(x + l, y + t);
          break;

        case 'h': // horizontal lineto, relative
          x += current[1];
          context.lineTo(x + l, y + t);
          break;

        case 'H': // horizontal lineto, absolute
          x = current[1];
          context.lineTo(x + l, y + t);
          break;

        case 'v': // vertical lineto, relative
          y += current[1];
          context.lineTo(x + l, y + t);
          break;

        case 'V': // verical lineto, absolute
          y = current[1];
          context.lineTo(x + l, y + t);
          break;

        case 'm': // moveTo, relative
          x += current[1];
          y += current[2];
          context.moveTo(x + l, y + t);
          break;

        case 'M': // moveTo, absolute
          x = current[1];
          y = current[2];
          context.moveTo(x + l, y + t);
          break;

        case 'c': // bezierCurveTo, relative
          tempX = x + current[5];
          tempY = y + current[6];
          controlX = x + current[3];
          controlY = y + current[4];
          context.bezierCurveTo(
            x + current[1] + l, // x1
            y + current[2] + t, // y1
            controlX + l, // x2
            controlY + t, // y2
            tempX + l,
            tempY + t
          );
          x = tempX;
          y = tempY;
          break;

        case 'C': // bezierCurveTo, absolute
          x = current[5];
          y = current[6];
          controlX = current[3];
          controlY = current[4];
          context.bezierCurveTo(
            current[1] + l,
            current[2] + t,
            controlX + l,
            controlY + t,
            x + l,
            y + t
          );
          break;

        case 's': // shorthand cubic bezierCurveTo, relative
          // transform to absolute x,y
          tempX = x + current[3];
          tempY = y + current[4];
          // calculate reflection of previous control points
          controlX = 2 * x - controlX;
          controlY = 2 * y - controlY;
          context.bezierCurveTo(
            controlX + l,
            controlY + t,
            x + current[1] + l,
            y + current[2] + t,
            tempX + l,
            tempY + t
          );

          // set control point to 2nd one of this command
          // the first control point is assumed to be the reflection of
          // the second control point on the previous command relative
          // to the current point.
          controlX = x + current[1];
          controlY = y + current[2];

          x = tempX;
          y = tempY;
          break;

        case 'S': // shorthand cubic bezierCurveTo, absolute
          tempX = current[3];
          tempY = current[4];
          // calculate reflection of previous control points
          controlX = 2*x - controlX;
          controlY = 2*y - controlY;
          context.bezierCurveTo(
            controlX + l,
            controlY + t,
            current[1] + l,
            current[2] + t,
            tempX + l,
            tempY + t
          );
          x = tempX;
          y = tempY;
          // set control point to 2nd one of this command
          // the first control point is assumed to be the reflection of
          // the second control point on the previous command relative
          // to the current point.
          controlX = current[1];
          controlY = current[2];

          break;

        case 'q': // quadraticCurveTo, relative
          // transform to absolute x,y
          tempX = x + current[3];
          tempY = y + current[4];

          controlX = x + current[1];
          controlY = y + current[2];

          context.quadraticCurveTo(
            controlX + l,
            controlY + t,
            tempX + l,
            tempY + t
          );
          x = tempX;
          y = tempY;
          break;

        case 'Q': // quadraticCurveTo, absolute
          tempX = current[3];
          tempY = current[4];

          context.quadraticCurveTo(
            current[1] + l,
            current[2] + t,
            tempX + l,
            tempY + t
          );
          x = tempX;
          y = tempY;
          controlX = current[1];
          controlY = current[2];
          break;

        case 't': // shorthand quadraticCurveTo, relative

          // transform to absolute x,y
          tempX = x + current[1];
          tempY = y + current[2];

          if (previous[0].match(/[QqTt]/) === null) {
            // If there is no previous command or if the previous command was not a Q, q, T or t,
            // assume the control point is coincident with the current point
            controlX = x;
            controlY = y;
          }
          else if (previous[0] === 't') {
            // calculate reflection of previous control points for t
            controlX = 2 * x - tempControlX;
            controlY = 2 * y - tempControlY;
          }
          else if (previous[0] === 'q') {
            // calculate reflection of previous control points for q
            controlX = 2 * x - controlX;
            controlY = 2 * y - controlY;
          }

          tempControlX = controlX;
          tempControlY = controlY;

          context.quadraticCurveTo(
            controlX + l,
            controlY + t,
            tempX + l,
            tempY + t
          );
          x = tempX;
          y = tempY;
          controlX = x + current[1];
          controlY = y + current[2];
          break;

        case 'T':
          tempX = current[1];
          tempY = current[2];

          // calculate reflection of previous control points
          controlX = 2 * x - controlX;
          controlY = 2 * y - controlY;
          context.quadraticCurveTo(
            controlX + l,
            controlY + t,
            tempX + l,
            tempY + t
          );
          x = tempX;
          y = tempY;
          break;

        case 'a':
          drawArc(context, x + l, y + t, [
            current[1],
            current[2],
            current[3],
            current[4],
            current[5],
            current[6] + x + l,
            current[7] + y + t
          ]);
          x += current[6];
          y += current[7];
          break;

        case 'A':
          drawArc(context, x + l, y + t, [
            current[1],
            current[2],
            current[3],
            current[4],
            current[5],
            current[6] + l,
            current[7] + t
          ]);
          x = current[6];
          y = current[7];
          break;

        case 'z':
        case 'Z':
          context.closePath();
          break;
      }
      previous = current;
    }
  }

  function drawArc(context, x, y, coords) {
    var seg = segments(
      coords[5], // end x
      coords[6], // end y
      coords[0], // radius x
      coords[1], // radius y
      coords[3], // large flag
      coords[4], // sweep flag
      coords[2], // rotation
      x, y
    );
    for (var i=0; i<seg.length; ++i) {
      var bez = bezier(seg[i]);
      context.bezierCurveTo(bez[0], bez[1], bez[2], bez[3], bez[4], bez[5]);
    }
  }

  var tau = 2 * Math.PI,
      halfSqrt3 = Math.sqrt(3) / 2;

  var builtins = {
    'circle': {
      draw: function(context, size) {
        var r = Math.sqrt(size) / 2;
        context.moveTo(r, 0);
        context.arc(0, 0, r, 0, tau);
      }
    },
    'cross': {
      draw: function(context, size) {
        var r = Math.sqrt(size) / 2,
            s = r / 2.5;
        context.moveTo(-r, -s);
        context.lineTo(-r, s);
        context.lineTo(-s, s);
        context.lineTo(-s, r);
        context.lineTo(s, r);
        context.lineTo(s, s);
        context.lineTo(r, s);
        context.lineTo(r, -s);
        context.lineTo(s, -s);
        context.lineTo(s, -r);
        context.lineTo(-s, -r);
        context.lineTo(-s, -s);
        context.closePath();
      }
    },
    'diamond': {
      draw: function(context, size) {
        var r = Math.sqrt(size) / 2;
        context.moveTo(-r, 0);
        context.lineTo(0, -r);
        context.lineTo(r, 0);
        context.lineTo(0, r);
        context.closePath();
      }
    },
    'square': {
      draw: function(context, size) {
        var w = Math.sqrt(size),
            x = -w / 2;
        context.rect(x, x, w, w);
      }
    },
    'triangle-up': {
      draw: function(context, size) {
        var r = Math.sqrt(size) / 2,
            h = halfSqrt3 * r;
        context.moveTo(0, -h);
        context.lineTo(-r, h);
        context.lineTo(r, h);
        context.closePath();
      }
    },
    'triangle-down': {
      draw: function(context, size) {
        var r = Math.sqrt(size) / 2,
            h = halfSqrt3 * r;
        context.moveTo(0, h);
        context.lineTo(-r, -h);
        context.lineTo(r, -h);
        context.closePath();
      }
    },
    'triangle-right': {
      draw: function(context, size) {
        var r = Math.sqrt(size) / 2,
            h = halfSqrt3 * r;
        context.moveTo(h, 0);
        context.lineTo(-h, -r);
        context.lineTo(-h, r);
        context.closePath();
      }
    },
    'triangle-left': {
      draw: function(context, size) {
        var r = Math.sqrt(size) / 2,
            h = halfSqrt3 * r;
        context.moveTo(-h, 0);
        context.lineTo(h, -r);
        context.lineTo(h, r);
        context.closePath();
      }
    }
  };

  function symbols(_) {
    return builtins.hasOwnProperty(_) ? builtins[_] : customSymbol(_);
  }

  var custom = {};

  function customSymbol(path) {
    if (!custom.hasOwnProperty(path)) {
      var parsed = pathParse(path);
      custom[path] = {
        draw: function(context, size) {
          pathRender(context, parsed, 0, 0, Math.sqrt(size) / 2);
        }
      };
    }
    return custom[path];
  }

  function rectangleX(d) {
    return d.x;
  }

  function rectangleY(d) {
    return d.y;
  }

  function rectangleWidth(d) {
    return d.width;
  }

  function rectangleHeight(d) {
    return d.height;
  }

  function constant(_) {
    return function() { return _; };
  }

  function vg_rect() {
    var x = rectangleX,
        y = rectangleY,
        width = rectangleWidth,
        height = rectangleHeight,
        cornerRadius = constant(0),
        context = null;

    function rectangle(_, x0, y0) {
      var buffer,
          x1 = x0 != null ? x0 : +x.call(this, _),
          y1 = y0 != null ? y0 : +y.call(this, _),
          w  = +width.call(this, _),
          h  = +height.call(this, _),
          cr = +cornerRadius.call(this, _);

      if (!context) context = buffer = d3Path.path();

      if (cr <= 0) {
        context.rect(x1, y1, w, h);
      } else {
        var x2 = x1 + w,
            y2 = y1 + h;
        context.moveTo(x1 + cr, y1);
        context.lineTo(x2 - cr, y1);
        context.quadraticCurveTo(x2, y1, x2, y1 + cr);
        context.lineTo(x2, y2 - cr);
        context.quadraticCurveTo(x2, y2, x2 - cr, y2);
        context.lineTo(x1 + cr, y2);
        context.quadraticCurveTo(x1, y2, x1, y2 - cr);
        context.lineTo(x1, y1 + cr);
        context.quadraticCurveTo(x1, y1, x1 + cr, y1);
        context.closePath();
      }

      if (buffer) {
        context = null;
        return buffer + '' || null;
      }
    }

    rectangle.x = function(_) {
      if (arguments.length) {
        x = typeof _ === 'function' ? _ : constant(+_);
        return rectangle;
      } else {
        return x;
      }
    };

    rectangle.y = function(_) {
      if (arguments.length) {
        y = typeof _ === 'function' ? _ : constant(+_);
        return rectangle;
      } else {
        return y;
      }
    };

    rectangle.width = function(_) {
      if (arguments.length) {
        width = typeof _ === 'function' ? _ : constant(+_);
        return rectangle;
      } else {
        return width;
      }
    };

    rectangle.height = function(_) {
      if (arguments.length) {
        height = typeof _ === 'function' ? _ : constant(+_);
        return rectangle;
      } else {
        return height;
      }
    };

    rectangle.cornerRadius = function(_) {
      if (arguments.length) {
        cornerRadius = typeof _ === 'function' ? _ : constant(+_);
        return rectangle;
      } else {
        return cornerRadius;
      }
    };

    rectangle.context = function(_) {
      if (arguments.length) {
        context = _ == null ? null : _;
        return rectangle;
      } else {
        return context;
      }
    };

    return rectangle;
  }

  var pi = Math.PI;

  function vg_trail() {
    var x,
        y,
        size,
        defined,
        context = null,
        ready, x1, y1, r1;

    function point(x2, y2, w2) {
      var r2 = w2 / 2;

      if (ready) {
        var ux = y1 - y2,
            uy = x2 - x1;

        if (ux || uy) {
          // get normal vector
          var ud = Math.sqrt(ux * ux + uy * uy),
              rx = (ux /= ud) * r1,
              ry = (uy /= ud) * r1,
              t = Math.atan2(uy, ux);

          // draw segment
          context.moveTo(x1 - rx, y1 - ry);
          context.lineTo(x2 - ux * r2, y2 - uy * r2);
          context.arc(x2, y2, r2, t - pi, t);
          context.lineTo(x1 + rx, y1 + ry);
          context.arc(x1, y1, r1, t, t + pi);
        } else {
          context.arc(x2, y2, r2, 0, 2*pi);
        }
        context.closePath();
      } else {
        ready = 1;
      }
      x1 = x2;
      y1 = y2;
      r1 = r2;
    }

    function trail(data) {
      var i,
          n = data.length,
          d,
          defined0 = false,
          buffer;

      if (context == null) context = buffer = d3Path.path();

      for (i = 0; i <= n; ++i) {
        if (!(i < n && defined(d = data[i], i, data)) === defined0) {
          if (defined0 = !defined0) ready = 0;
        }
        if (defined0) point(+x(d, i, data), +y(d, i, data), +size(d, i, data));
      }

      if (buffer) {
        context = null;
        return buffer + '' || null;
      }
    }

    trail.x = function(_) {
      if (arguments.length) {
        x = _;
        return trail;
      } else {
        return x;
      }
    };

    trail.y = function(_) {
      if (arguments.length) {
        y = _;
        return trail;
      } else {
        return y;
      }
    };

    trail.size = function(_) {
      if (arguments.length) {
        size = _;
        return trail;
      } else {
        return size;
      }
    };

    trail.defined = function(_) {
      if (arguments.length) {
        defined = _;
        return trail;
      } else {
        return defined;
      }
    };

    trail.context = function(_) {
      if (arguments.length) {
        if (_ == null) {
          context = null;
        } else {
          context = _;
        }
        return trail;
      } else {
        return context;
      }
    };

    return trail;
  }

  function x(item)    { return item.x || 0; }
  function y(item)    { return item.y || 0; }
  function w(item)    { return item.width || 0; }
  function ts(item)   { return item.size || 1; }
  function h(item)    { return item.height || 0; }
  function xw(item)   { return (item.x || 0) + (item.width || 0); }
  function yh(item)   { return (item.y || 0) + (item.height || 0); }
  function sa(item)   { return item.startAngle || 0; }
  function ea(item)   { return item.endAngle || 0; }
  function pa(item)   { return item.padAngle || 0; }
  function ir(item)   { return item.innerRadius || 0; }
  function or(item)   { return item.outerRadius || 0; }
  function cr(item)   { return item.cornerRadius || 0; }
  function def(item)  { return !(item.defined === false); }
  function size(item) { return item.size == null ? 64 : item.size; }
  function type(item) { return symbols(item.shape || 'circle'); }

  var arcShape    = d3Shape.arc().startAngle(sa).endAngle(ea).padAngle(pa)
                            .innerRadius(ir).outerRadius(or).cornerRadius(cr),
      areavShape  = d3Shape.area().x(x).y1(y).y0(yh).defined(def),
      areahShape  = d3Shape.area().y(y).x1(x).x0(xw).defined(def),
      lineShape   = d3Shape.line().x(x).y(y).defined(def),
      rectShape   = vg_rect().x(x).y(y).width(w).height(h).cornerRadius(cr),
      symbolShape = d3Shape.symbol().type(type).size(size),
      trailShape  = vg_trail().x(x).y(y).defined(def).size(ts);

  function arc(context, item) {
    return arcShape.context(context)(item);
  }

  function area(context, items) {
    var item = items[0],
        interp = item.interpolate || 'linear';
    return (item.orient === 'horizontal' ? areahShape : areavShape)
      .curve(curves(interp, item.orient, item.tension))
      .context(context)(items);
  }

  function line(context, items) {
    var item = items[0],
        interp = item.interpolate || 'linear';
    return lineShape.curve(curves(interp, item.orient, item.tension))
      .context(context)(items);
  }

  function rectangle(context, item, x, y) {
    return rectShape.context(context)(item, x, y);
  }

  function shape(context, item) {
    return (item.mark.shape || item.shape)
      .context(context)(item);
  }

  function symbol(context, item) {
    return symbolShape.context(context)(item);
  }

  function trail(context, items) {
    return trailShape.context(context)(items);
  }

  function boundStroke(bounds, item) {
    if (item.stroke && item.opacity !== 0 && item.strokeOpacity !== 0) {
      bounds.expand(item.strokeWidth != null ? +item.strokeWidth : 1);
    }
    return bounds;
  }

  var bounds,
      tau$1 = Math.PI * 2,
      halfPi = tau$1 / 4,
      circleThreshold = tau$1 - 1e-8;

  function context(_) {
    bounds = _;
    return context;
  }

  function noop() {}

  function add(x, y) { bounds.add(x, y); }

  context.beginPath = noop;

  context.closePath = noop;

  context.moveTo = add;

  context.lineTo = add;

  context.rect = function(x, y, w, h) {
    add(x, y);
    add(x + w, y + h);
  };

  context.quadraticCurveTo = function(x1, y1, x2, y2) {
    add(x1, y1);
    add(x2, y2);
  };

  context.bezierCurveTo = function(x1, y1, x2, y2, x3, y3) {
    add(x1, y1);
    add(x2, y2);
    add(x3, y3);
  };

  context.arc = function(cx, cy, r, sa, ea, ccw) {
    if (Math.abs(ea - sa) > circleThreshold) {
      add(cx - r, cy - r);
      add(cx + r, cy + r);
      return;
    }

    var xmin = Infinity, xmax = -Infinity,
        ymin = Infinity, ymax = -Infinity,
        s, i, x, y;

    function update(a) {
      x = r * Math.cos(a);
      y = r * Math.sin(a);
      if (x < xmin) xmin = x;
      if (x > xmax) xmax = x;
      if (y < ymin) ymin = y;
      if (y > ymax) ymax = y;
    }

    // Sample end points and interior points aligned with 90 degrees
    update(sa);
    update(ea);

    if (ea !== sa) {
      sa = sa % tau$1; if (sa < 0) sa += tau$1;
      ea = ea % tau$1; if (ea < 0) ea += tau$1;

      if (ea < sa) {
        ccw = !ccw; // flip direction
        s = sa; sa = ea; ea = s; // swap end-points
      }

      if (ccw) {
        ea -= tau$1;
        s = sa - (sa % halfPi);
        for (i=0; i<4 && s>ea; ++i, s-=halfPi) update(s);
      } else {
        s = sa - (sa % halfPi) + halfPi;
        for (i=0; i<4 && s<ea; ++i, s=s+halfPi) update(s);
      }
    }

    add(cx + xmin, cy + ymin);
    add(cx + xmax, cy + ymax);
  };

  function gradient(context, gradient, bounds) {
    var w = bounds.width(),
        h = bounds.height(),
        x1 = bounds.x1 + gradient.x1 * w,
        y1 = bounds.y1 + gradient.y1 * h,
        x2 = bounds.x1 + gradient.x2 * w,
        y2 = bounds.y1 + gradient.y2 * h,
        stop = gradient.stops,
        i = 0,
        n = stop.length,
        linearGradient = context.createLinearGradient(x1, y1, x2, y2);

    for (; i<n; ++i) {
      linearGradient.addColorStop(stop[i].offset, stop[i].color);
    }

    return linearGradient;
  }

  function color(context, item, value) {
    return (value.id) ?
      gradient(context, value, item.bounds) :
      value;
  }

  function fill(context, item, opacity) {
    opacity *= (item.fillOpacity==null ? 1 : item.fillOpacity);
    if (opacity > 0) {
      context.globalAlpha = opacity;
      context.fillStyle = color(context, item, item.fill);
      return true;
    } else {
      return false;
    }
  }

  var Empty = [];

  function stroke(context, item, opacity) {
    var lw = (lw = item.strokeWidth) != null ? lw : 1;

    if (lw <= 0) return false;

    opacity *= (item.strokeOpacity==null ? 1 : item.strokeOpacity);
    if (opacity > 0) {
      context.globalAlpha = opacity;
      context.strokeStyle = color(context, item, item.stroke);

      context.lineWidth = lw;
      context.lineCap = item.strokeCap || 'butt';
      context.lineJoin = item.strokeJoin || 'miter';
      context.miterLimit = item.strokeMiterLimit || 10;

      if (context.setLineDash) {
        context.setLineDash(item.strokeDash || Empty);
        context.lineDashOffset = item.strokeDashOffset || 0;
      }
      return true;
    } else {
      return false;
    }
  }

  function compare(a, b) {
    return a.zindex - b.zindex || a.index - b.index;
  }

  function zorder(scene) {
    if (!scene.zdirty) return scene.zitems;

    var items = scene.items,
        output = [], item, i, n;

    for (i=0, n=items.length; i<n; ++i) {
      item = items[i];
      item.index = i;
      if (item.zindex) output.push(item);
    }

    scene.zdirty = false;
    return scene.zitems = output.sort(compare);
  }

  function visit(scene, visitor) {
    var items = scene.items, i, n;
    if (!items || !items.length) return;

    var zitems = zorder(scene);

    if (zitems && zitems.length) {
      for (i=0, n=items.length; i<n; ++i) {
        if (!items[i].zindex) visitor(items[i]);
      }
      items = zitems;
    }

    for (i=0, n=items.length; i<n; ++i) {
      visitor(items[i]);
    }
  }

  function pickVisit(scene, visitor) {
    var items = scene.items, hit, i;
    if (!items || !items.length) return null;

    var zitems = zorder(scene);
    if (zitems && zitems.length) items = zitems;

    for (i=items.length; --i >= 0;) {
      if (hit = visitor(items[i])) return hit;
    }

    if (items === zitems) {
      for (items=scene.items, i=items.length; --i >= 0;) {
        if (!items[i].zindex) {
          if (hit = visitor(items[i])) return hit;
        }
      }
    }

    return null;
  }

  function drawAll(path) {
    return function(context, scene, bounds) {
      visit(scene, function(item) {
        if (!bounds || bounds.intersects(item.bounds)) {
          drawPath(path, context, item, item);
        }
      });
    };
  }

  function drawOne(path) {
    return function(context, scene, bounds) {
      if (scene.items.length && (!bounds || bounds.intersects(scene.bounds))) {
        drawPath(path, context, scene.items[0], scene.items);
      }
    };
  }

  function drawPath(path, context, item, items) {
    var opacity = item.opacity == null ? 1 : item.opacity;
    if (opacity === 0) return;

    if (path(context, items)) return;

    if (item.fill && fill(context, item, opacity)) {
      context.fill();
    }

    if (item.stroke && stroke(context, item, opacity)) {
      context.stroke();
    }
  }

  var trueFunc = function() { return true; };

  function pick(test) {
    if (!test) test = trueFunc;

    return function(context, scene, x, y, gx, gy) {
      x *= context.pixelRatio;
      y *= context.pixelRatio;

      return pickVisit(scene, function(item) {
        var b = item.bounds;
        // first hit test against bounding box
        if ((b && !b.contains(gx, gy)) || !b) return;
        // if in bounding box, perform more careful test
        if (test(context, item, x, y, gx, gy)) return item;
      });
    };
  }

  function hitPath(path, filled) {
    return function(context, o, x, y) {
      var item = Array.isArray(o) ? o[0] : o,
          fill = (filled == null) ? item.fill : filled,
          stroke = item.stroke && context.isPointInStroke, lw, lc;

      if (stroke) {
        lw = item.strokeWidth;
        lc = item.strokeCap;
        context.lineWidth = lw != null ? lw : 1;
        context.lineCap   = lc != null ? lc : 'butt';
      }

      return path(context, o) ? false :
        (fill && context.isPointInPath(x, y)) ||
        (stroke && context.isPointInStroke(x, y));
    };
  }

  function pickPath(path) {
    return pick(hitPath(path));
  }

  function translate(x, y) {
    return 'translate(' + x + ',' + y + ')';
  }

  function translateItem(item) {
    return translate(item.x || 0, item.y || 0);
  }

  function markItemPath(type, shape) {

    function attr(emit, item) {
      emit('transform', translateItem(item));
      emit('d', shape(null, item));
    }

    function bound(bounds, item) {
      shape(context(bounds), item);
      return boundStroke(bounds, item)
        .translate(item.x || 0, item.y || 0);
    }

    function draw(context$$1, item) {
      var x = item.x || 0,
          y = item.y || 0;
      context$$1.translate(x, y);
      context$$1.beginPath();
      shape(context$$1, item);
      context$$1.translate(-x, -y);
    }

    return {
      type:   type,
      tag:    'path',
      nested: false,
      attr:   attr,
      bound:  bound,
      draw:   drawAll(draw),
      pick:   pickPath(draw)
    };

  }

  var arc$1 = markItemPath('arc', arc);

  function pickArea(a, p) {
    var v = a[0].orient === 'horizontal' ? p[1] : p[0],
        z = a[0].orient === 'horizontal' ? 'y' : 'x',
        i = a.length,
        min = +Infinity, hit, d;

    while (--i >= 0) {
      if (a[i].defined === false) continue;
      d = Math.abs(a[i][z] - v);
      if (d < min) {
        min = d;
        hit = a[i];
      }
    }

    return hit;
  }

  function pickLine(a, p) {
    var t = Math.pow(a[0].strokeWidth || 1, 2),
        i = a.length, dx, dy, dd;

    while (--i >= 0) {
      if (a[i].defined === false) continue;
      dx = a[i].x - p[0];
      dy = a[i].y - p[1];
      dd = dx * dx + dy * dy;
      if (dd < t) return a[i];
    }

    return null;
  }

  function pickTrail(a, p) {
    var i = a.length, dx, dy, dd;

    while (--i >= 0) {
      if (a[i].defined === false) continue;
      dx = a[i].x - p[0];
      dy = a[i].y - p[1];
      dd = dx * dx + dy * dy;
      dx = a[i].size || 1;
      if (dd < dx*dx) return a[i];
    }

    return null;
  }

  function markMultiItemPath(type, shape, tip) {

    function attr(emit, item) {
      var items = item.mark.items;
      if (items.length) emit('d', shape(null, items));
    }

    function bound(bounds, mark) {
      var items = mark.items;
      if (items.length === 0) {
        return bounds;
      } else {
        shape(context(bounds), items);
        return boundStroke(bounds, items[0]);
      }
    }

    function draw(context$$1, items) {
      context$$1.beginPath();
      shape(context$$1, items);
    }

    var hit = hitPath(draw);

    function pick$$1(context$$1, scene, x, y, gx, gy) {
      var items = scene.items,
          b = scene.bounds;

      if (!items || !items.length || b && !b.contains(gx, gy)) {
        return null;
      }

      x *= context$$1.pixelRatio;
      y *= context$$1.pixelRatio;
      return hit(context$$1, items, x, y) ? items[0] : null;
    }

    return {
      type:   type,
      tag:    'path',
      nested: true,
      attr:   attr,
      bound:  bound,
      draw:   drawOne(draw),
      pick:   pick$$1,
      tip:    tip
    };

  }

  var area$1 = markMultiItemPath('area', area, pickArea);

  var clip_id = 1;

  function resetSVGClipId() {
    clip_id = 1;
  }

  function clip(renderer, item, size) {
    var clip = item.clip,
        defs = renderer._defs,
        id = item.clip_id || (item.clip_id = 'clip' + clip_id++),
        c = defs.clipping[id] || (defs.clipping[id] = {id: id});

    if (vegaUtil.isFunction(clip)) {
      c.path = clip(null);
    } else {
      c.width = size.width || 0;
      c.height = size.height || 0;
    }

    return 'url(#' + id + ')';
  }

  var StrokeOffset = 0.5;

  function attr(emit, item) {
    emit('transform', translateItem(item));
  }

  function background(emit, item) {
    var offset = item.stroke ? StrokeOffset : 0;
    emit('class', 'background');
    emit('d', rectangle(null, item, offset, offset));
  }

  function foreground(emit, item, renderer) {
    var url = item.clip ? clip(renderer, item, item) : null;
    emit('clip-path', url);
  }

  function bound(bounds, group) {
    if (!group.clip && group.items) {
      var items = group.items;
      for (var j=0, m=items.length; j<m; ++j) {
        bounds.union(items[j].bounds);
      }
    }

    if ((group.clip || group.width || group.height) && !group.noBound) {
      bounds.add(0, 0).add(group.width || 0, group.height || 0);
    }

    boundStroke(bounds, group);

    return bounds.translate(group.x || 0, group.y || 0);
  }

  function backgroundPath(context, group) {
    var offset = group.stroke ? StrokeOffset : 0;
    context.beginPath();
    rectangle(context, group, offset, offset);
  }

  var hitBackground = hitPath(backgroundPath);

  function draw(context, scene, bounds) {
    var renderer = this;

    visit(scene, function(group) {
      var gx = group.x || 0,
          gy = group.y || 0,
          w = group.width || 0,
          h = group.height || 0,
          opacity;

      // setup graphics context
      context.save();
      context.translate(gx, gy);

      // draw group background
      if (group.stroke || group.fill) {
        opacity = group.opacity == null ? 1 : group.opacity;
        if (opacity > 0) {
          backgroundPath(context, group);
          if (group.fill && fill(context, group, opacity)) {
            context.fill();
          }
          if (group.stroke && stroke(context, group, opacity)) {
            context.stroke();
          }
        }
      }

      // set clip and bounds
      if (group.clip) {
        context.beginPath();
        context.rect(0, 0, w, h);
        context.clip();
      }
      if (bounds) bounds.translate(-gx, -gy);

      // draw group contents
      visit(group, function(item) {
        renderer.draw(context, item, bounds);
      });

      // restore graphics context
      if (bounds) bounds.translate(gx, gy);
      context.restore();
    });
  }

  function pick$1(context, scene, x, y, gx, gy) {
    if (scene.bounds && !scene.bounds.contains(gx, gy) || !scene.items) {
      return null;
    }

    var handler = this,
        cx = x * context.pixelRatio,
        cy = y * context.pixelRatio;

    return pickVisit(scene, function(group) {
      var hit, dx, dy, b;

      // first hit test against bounding box
      // if a group is clipped, that should be handled by the bounds check.
      b = group.bounds;
      if (b && !b.contains(gx, gy)) return;

      // passed bounds check, so test sub-groups
      dx = (group.x || 0);
      dy = (group.y || 0);

      context.save();
      context.translate(dx, dy);

      dx = gx - dx;
      dy = gy - dy;

      // hit test against contained marks
      hit = pickVisit(group, function(mark) {
        return pickMark(mark, dx, dy)
          ? handler.pick(mark, x, y, dx, dy)
          : null;
      });

      // hit test against group background
      if (!hit && scene.interactive !== false
          && (group.fill || group.stroke)
          && hitBackground(context, group, cx, cy)) {
        hit = group;
      }

      context.restore();
      return hit || null;
    });
  }

  function pickMark(mark, x, y) {
    return (mark.interactive !== false || mark.marktype === 'group')
      && mark.bounds && mark.bounds.contains(x, y);
  }

  var group = {
    type:       'group',
    tag:        'g',
    nested:     false,
    attr:       attr,
    bound:      bound,
    draw:       draw,
    pick:       pick$1,
    background: background,
    foreground: foreground
  };

  function getImage(item, renderer) {
    var image = item.image;
    if (!image || image.url !== item.url) {
      image = {loaded: false, width: 0, height: 0};
      renderer.loadImage(item.url).then(function(image) {
        item.image = image;
        item.image.url = item.url;
      });
    }
    return image;
  }

  function imageXOffset(align, w) {
    return align === 'center' ? w / 2 : align === 'right' ? w : 0;
  }

  function imageYOffset(baseline, h) {
    return baseline === 'middle' ? h / 2 : baseline === 'bottom' ? h : 0;
  }

  function attr$1(emit, item, renderer) {
    var image = getImage(item, renderer),
        x = item.x || 0,
        y = item.y || 0,
        w = (item.width != null ? item.width : image.width) || 0,
        h = (item.height != null ? item.height : image.height) || 0,
        a = item.aspect === false ? 'none' : 'xMidYMid';

    x -= imageXOffset(item.align, w);
    y -= imageYOffset(item.baseline, h);

    emit('href', image.src || '', 'http://www.w3.org/1999/xlink', 'xlink:href');
    emit('transform', translate(x, y));
    emit('width', w);
    emit('height', h);
    emit('preserveAspectRatio', a);
  }

  function bound$1(bounds, item) {
    var image = item.image,
        x = item.x || 0,
        y = item.y || 0,
        w = (item.width != null ? item.width : (image && image.width)) || 0,
        h = (item.height != null ? item.height : (image && image.height)) || 0;

    x -= imageXOffset(item.align, w);
    y -= imageYOffset(item.baseline, h);

    return bounds.set(x, y, x + w, y + h);
  }

  function draw$1(context, scene, bounds) {
    var renderer = this;

    visit(scene, function(item) {
      if (bounds && !bounds.intersects(item.bounds)) return; // bounds check

      var image = getImage(item, renderer),
          x = item.x || 0,
          y = item.y || 0,
          w = (item.width != null ? item.width : image.width) || 0,
          h = (item.height != null ? item.height : image.height) || 0,
          opacity, ar0, ar1, t;

      x -= imageXOffset(item.align, w);
      y -= imageYOffset(item.baseline, h);

      if (item.aspect !== false) {
        ar0 = image.width / image.height;
        ar1 = item.width / item.height;
        if (ar0 === ar0 && ar1 === ar1 && ar0 !== ar1) {
          if (ar1 < ar0) {
            t = w / ar0;
            y += (h - t) / 2;
            h = t;
          } else {
            t = h * ar0;
            x += (w - t) / 2;
            w = t;
          }
        }
      }

      if (image.loaded) {
        context.globalAlpha = (opacity = item.opacity) != null ? opacity : 1;
        context.drawImage(image, x, y, w, h);
      }
    });
  }

  var image = {
    type:     'image',
    tag:      'image',
    nested:   false,
    attr:     attr$1,
    bound:    bound$1,
    draw:     draw$1,
    pick:     pick(),
    get:      getImage,
    xOffset:  imageXOffset,
    yOffset:  imageYOffset
  };

  var line$1 = markMultiItemPath('line', line, pickLine);

  function attr$2(emit, item) {
    emit('transform', translateItem(item));
    emit('d', item.path);
  }

  function path(context$$1, item) {
    var path = item.path;
    if (path == null) return true;

    var cache = item.pathCache;
    if (!cache || cache.path !== path) {
      (item.pathCache = cache = pathParse(path)).path = path;
    }
    pathRender(context$$1, cache, item.x, item.y);
  }

  function bound$2(bounds, item) {
    return path(context(bounds), item)
      ? bounds.set(0, 0, 0, 0)
      : boundStroke(bounds, item);
  }

  var path$1 = {
    type:   'path',
    tag:    'path',
    nested: false,
    attr:   attr$2,
    bound:  bound$2,
    draw:   drawAll(path),
    pick:   pickPath(path)
  };

  function attr$3(emit, item) {
    emit('d', rectangle(null, item));
  }

  function bound$3(bounds, item) {
    var x, y;
    return boundStroke(bounds.set(
      x = item.x || 0,
      y = item.y || 0,
      (x + item.width) || 0,
      (y + item.height) || 0
    ), item);
  }

  function draw$2(context, item) {
    context.beginPath();
    rectangle(context, item);
  }

  var rect = {
    type:   'rect',
    tag:    'path',
    nested: false,
    attr:   attr$3,
    bound:  bound$3,
    draw:   drawAll(draw$2),
    pick:   pickPath(draw$2)
  };

  function attr$4(emit, item) {
    emit('transform', translateItem(item));
    emit('x2', item.x2 != null ? item.x2 - (item.x||0) : 0);
    emit('y2', item.y2 != null ? item.y2 - (item.y||0) : 0);
  }

  function bound$4(bounds, item) {
    var x1, y1;
    return boundStroke(bounds.set(
      x1 = item.x || 0,
      y1 = item.y || 0,
      item.x2 != null ? item.x2 : x1,
      item.y2 != null ? item.y2 : y1
    ), item);
  }

  function path$2(context, item, opacity) {
    var x1, y1, x2, y2;

    if (item.stroke && stroke(context, item, opacity)) {
      x1 = item.x || 0;
      y1 = item.y || 0;
      x2 = item.x2 != null ? item.x2 : x1;
      y2 = item.y2 != null ? item.y2 : y1;
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      return true;
    }
    return false;
  }

  function draw$3(context, scene, bounds) {
    visit(scene, function(item) {
      if (bounds && !bounds.intersects(item.bounds)) return; // bounds check
      var opacity = item.opacity == null ? 1 : item.opacity;
      if (opacity && path$2(context, item, opacity)) {
        context.stroke();
      }
    });
  }

  function hit(context, item, x, y) {
    if (!context.isPointInStroke) return false;
    return path$2(context, item, 1) && context.isPointInStroke(x, y);
  }

  var rule = {
    type:   'rule',
    tag:    'line',
    nested: false,
    attr:   attr$4,
    bound:  bound$4,
    draw:   draw$3,
    pick:   pick(hit)
  };

  var shape$1 = markItemPath('shape', shape);

  var symbol$1 = markItemPath('symbol', symbol);

  var context$1,
      currFontHeight;

  var textMetrics = {
    height: fontSize,
    measureWidth: measureWidth,
    estimateWidth: estimateWidth,
    width: estimateWidth,
    canvas: useCanvas
  };

  useCanvas(true);

  // make dumb, simple estimate if no canvas is available
  function estimateWidth(item) {
    currFontHeight = fontSize(item);
    return estimate(textValue(item));
  }

  function estimate(text) {
    return ~~(0.8 * text.length * currFontHeight);
  }

  // measure text width if canvas is available
  function measureWidth(item) {
    context$1.font = font(item);
    return measure(textValue(item));
  }

  function measure(text) {
    return context$1.measureText(text).width;
  }

  function fontSize(item) {
    return item.fontSize != null ? item.fontSize : 11;
  }

  function useCanvas(use) {
    context$1 = use && (context$1 = vegaCanvas.canvas(1,1)) ? context$1.getContext('2d') : null;
    textMetrics.width = context$1 ? measureWidth : estimateWidth;
  }

  function textValue(item) {
    var s = item.text;
    if (s == null) {
      return '';
    } else {
      return item.limit > 0 ? truncate(item) : s + '';
    }
  }

  function truncate(item) {
    var limit = +item.limit,
        text = item.text + '',
        width;

    if (context$1) {
      context$1.font = font(item);
      width = measure;
    } else {
      currFontHeight = fontSize(item);
      width = estimate;
    }

    if (width(text) < limit) return text;

    var ellipsis = item.ellipsis || '\u2026',
        rtl = item.dir === 'rtl',
        lo = 0,
        hi = text.length, mid;

    limit -= width(ellipsis);

    if (rtl) {
      while (lo < hi) {
        mid = (lo + hi >>> 1);
        if (width(text.slice(mid)) > limit) lo = mid + 1;
        else hi = mid;
      }
      return ellipsis + text.slice(lo);
    } else {
      while (lo < hi) {
        mid = 1 + (lo + hi >>> 1);
        if (width(text.slice(0, mid)) < limit) lo = mid;
        else hi = mid - 1;
      }
      return text.slice(0, lo) + ellipsis;
    }
  }

  function fontFamily(item, quote) {
    var font = item.font;
    return (quote && font
      ? String(font).replace(/"/g, '\'')
      : font) || 'sans-serif';
  }

  function font(item, quote) {
    return '' +
      (item.fontStyle ? item.fontStyle + ' ' : '') +
      (item.fontVariant ? item.fontVariant + ' ' : '') +
      (item.fontWeight ? item.fontWeight + ' ' : '') +
      fontSize(item) + 'px ' +
      fontFamily(item, quote);
  }

  function offset(item) {
    // perform our own font baseline calculation
    // why? not all browsers support SVG 1.1 'alignment-baseline' :(
    var baseline = item.baseline,
        h = fontSize(item);
    return Math.round(
      baseline === 'top'    ?  0.79*h :
      baseline === 'middle' ?  0.30*h :
      baseline === 'bottom' ? -0.21*h : 0
    );
  }

  var textAlign = {
    'left':   'start',
    'center': 'middle',
    'right':  'end'
  };

  var tempBounds = new Bounds();

  function attr$5(emit, item) {
    var dx = item.dx || 0,
        dy = (item.dy || 0) + offset(item),
        x = item.x || 0,
        y = item.y || 0,
        a = item.angle || 0,
        r = item.radius || 0, t;

    if (r) {
      t = (item.theta || 0) - Math.PI/2;
      x += r * Math.cos(t);
      y += r * Math.sin(t);
    }

    emit('text-anchor', textAlign[item.align] || 'start');

    if (a) {
      t = translate(x, y) + ' rotate('+a+')';
      if (dx || dy) t += ' ' + translate(dx, dy);
    } else {
      t = translate(x + dx, y + dy);
    }
    emit('transform', t);
  }

  function bound$5(bounds, item, noRotate) {
    var h = textMetrics.height(item),
        a = item.align,
        r = item.radius || 0,
        x = item.x || 0,
        y = item.y || 0,
        dx = item.dx || 0,
        dy = (item.dy || 0) + offset(item) - Math.round(0.8*h), // use 4/5 offset
        w, t;

    if (r) {
      t = (item.theta || 0) - Math.PI/2;
      x += r * Math.cos(t);
      y += r * Math.sin(t);
    }

    // horizontal alignment
    w = textMetrics.width(item);
    if (a === 'center') {
      dx -= (w / 2);
    } else if (a === 'right') {
      dx -= w;
    }

    bounds.set(dx+=x, dy+=y, dx+w, dy+h);
    if (item.angle && !noRotate) {
      bounds.rotate(item.angle*Math.PI/180, x, y);
    }
    return bounds.expand(noRotate || !w ? 0 : 1);
  }

  function draw$4(context, scene, bounds) {
    visit(scene, function(item) {
      var opacity, x, y, r, t, str;
      if (bounds && !bounds.intersects(item.bounds)) return; // bounds check
      if (!(str = textValue(item))) return; // get text string

      opacity = item.opacity == null ? 1 : item.opacity;
      if (opacity === 0) return;

      context.font = font(item);
      context.textAlign = item.align || 'left';

      x = item.x || 0;
      y = item.y || 0;
      if ((r = item.radius)) {
        t = (item.theta || 0) - Math.PI/2;
        x += r * Math.cos(t);
        y += r * Math.sin(t);
      }

      if (item.angle) {
        context.save();
        context.translate(x, y);
        context.rotate(item.angle * Math.PI/180);
        x = y = 0; // reset x, y
      }
      x += (item.dx || 0);
      y += (item.dy || 0) + offset(item);

      if (item.fill && fill(context, item, opacity)) {
        context.fillText(str, x, y);
      }
      if (item.stroke && stroke(context, item, opacity)) {
        context.strokeText(str, x, y);
      }
      if (item.angle) context.restore();
    });
  }

  function hit$1(context, item, x, y, gx, gy) {
    if (item.fontSize <= 0) return false;
    if (!item.angle) return true; // bounds sufficient if no rotation

    // project point into space of unrotated bounds
    var b = bound$5(tempBounds, item, true),
        a = -item.angle * Math.PI / 180,
        cos = Math.cos(a),
        sin = Math.sin(a),
        ix = item.x,
        iy = item.y,
        px = cos*gx - sin*gy + (ix - ix*cos + iy*sin),
        py = sin*gx + cos*gy + (iy - ix*sin - iy*cos);

    return b.contains(px, py);
  }

  var text = {
    type:   'text',
    tag:    'text',
    nested: false,
    attr:   attr$5,
    bound:  bound$5,
    draw:   draw$4,
    pick:   pick(hit$1)
  };

  var trail$1 = markMultiItemPath('trail', trail, pickTrail);

  var marks = {
    arc:     arc$1,
    area:    area$1,
    group:   group,
    image:   image,
    line:    line$1,
    path:    path$1,
    rect:    rect,
    rule:    rule,
    shape:   shape$1,
    symbol:  symbol$1,
    text:    text,
    trail:   trail$1
  };

  function boundItem(item, func, opt) {
    var type = marks[item.mark.marktype],
        bound = func || type.bound;
    if (type.nested) item = item.mark;

    return bound(item.bounds || (item.bounds = new Bounds()), item, opt);
  }

  var DUMMY = {mark: null};

  function boundMark(mark, bounds, opt) {
    var type  = marks[mark.marktype],
        bound = type.bound,
        items = mark.items,
        hasItems = items && items.length,
        i, n, item, b;

    if (type.nested) {
      if (hasItems) {
        item = items[0];
      } else {
        // no items, fake it
        DUMMY.mark = mark;
        item = DUMMY;
      }
      b = boundItem(item, bound, opt);
      bounds = bounds && bounds.union(b) || b;
      return bounds;
    }

    bounds = bounds
      || mark.bounds && mark.bounds.clear()
      || new Bounds();

    if (hasItems) {
      for (i=0, n=items.length; i<n; ++i) {
        bounds.union(boundItem(items[i], bound, opt));
      }
    }

    return mark.bounds = bounds;
  }

  var keys = [
    'marktype', 'name', 'role', 'interactive', 'clip', 'items', 'zindex',
    'x', 'y', 'width', 'height', 'align', 'baseline',             // layout
    'fill', 'fillOpacity', 'opacity',                             // fill
    'stroke', 'strokeOpacity', 'strokeWidth', 'strokeCap',        // stroke
    'strokeDash', 'strokeDashOffset',                             // stroke dash
    'startAngle', 'endAngle', 'innerRadius', 'outerRadius',       // arc
    'cornerRadius', 'padAngle',                                   // arc, rect
    'interpolate', 'tension', 'orient', 'defined',                // area, line
    'url',                                                        // image
    'path',                                                       // path
    'x2', 'y2',                                                   // rule
    'size', 'shape',                                              // symbol
    'text', 'angle', 'theta', 'radius', 'dx', 'dy',               // text
    'font', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariant'  // font
  ];

  function sceneToJSON(scene, indent) {
    return JSON.stringify(scene, keys, indent);
  }

  function sceneFromJSON(json) {
    var scene = (typeof json === 'string' ? JSON.parse(json) : json);
    return initialize(scene);
  }

  function initialize(scene) {
    var type = scene.marktype,
        items = scene.items,
        parent, i, n;

    if (items) {
      for (i=0, n=items.length; i<n; ++i) {
        parent = type ? 'mark' : 'group';
        items[i][parent] = scene;
        if (items[i].zindex) items[i][parent].zdirty = true;
        if ('group' === (type || parent)) initialize(items[i]);
      }
    }

    if (type) boundMark(scene);
    return scene;
  }

  function Scenegraph(scene) {
    if (arguments.length) {
      this.root = sceneFromJSON(scene);
    } else {
      this.root = createMark({
        marktype: 'group',
        name: 'root',
        role: 'frame'
      });
      this.root.items = [new GroupItem(this.root)];
    }
  }

  var prototype$2 = Scenegraph.prototype;

  prototype$2.toJSON = function(indent) {
    return sceneToJSON(this.root, indent || 0);
  };

  prototype$2.mark = function(markdef, group, index) {
    group = group || this.root.items[0];
    var mark = createMark(markdef, group);
    group.items[index] = mark;
    if (mark.zindex) mark.group.zdirty = true;
    return mark;
  };

  function createMark(def, group) {
    return {
      bounds:      new Bounds(),
      clip:        !!def.clip,
      group:       group,
      interactive: def.interactive === false ? false : true,
      items:       [],
      marktype:    def.marktype,
      name:        def.name || undefined,
      role:        def.role || undefined,
      zindex:      def.zindex || 0
    };
  }

  // create a new DOM element
  function domCreate(doc, tag, ns) {
    if (!doc && typeof document !== 'undefined' && document.createElement) {
      doc = document;
    }
    return doc
      ? (ns ? doc.createElementNS(ns, tag) : doc.createElement(tag))
      : null;
  }

  // find first child element with matching tag
  function domFind(el, tag) {
    tag = tag.toLowerCase();
    var nodes = el.childNodes, i = 0, n = nodes.length;
    for (; i<n; ++i) if (nodes[i].tagName.toLowerCase() === tag) {
      return nodes[i];
    }
  }

  // retrieve child element at given index
  // create & insert if doesn't exist or if tags do not match
  function domChild(el, index, tag, ns) {
    var a = el.childNodes[index], b;
    if (!a || a.tagName.toLowerCase() !== tag.toLowerCase()) {
      b = a || null;
      a = domCreate(el.ownerDocument, tag, ns);
      el.insertBefore(a, b);
    }
    return a;
  }

  // remove all child elements at or above the given index
  function domClear(el, index) {
    var nodes = el.childNodes,
        curr = nodes.length;
    while (curr > index) el.removeChild(nodes[--curr]);
    return el;
  }

  // generate css class name for mark
  function cssClass(mark) {
    return 'mark-' + mark.marktype
      + (mark.role ? ' role-' + mark.role : '')
      + (mark.name ? ' ' + mark.name : '');
  }

  function point(event, el) {
    var rect = el.getBoundingClientRect();
    return [
      event.clientX - rect.left - (el.clientLeft || 0),
      event.clientY - rect.top - (el.clientTop || 0)
    ];
  }

  function resolveItem(item, event, el, origin) {
    var mark = item && item.mark,
        mdef, p;

    if (mark && (mdef = marks[mark.marktype]).tip) {
      p = point(event, el);
      p[0] -= origin[0];
      p[1] -= origin[1];
      while (item = item.mark.group) {
        p[0] -= item.x || 0;
        p[1] -= item.y || 0;
      }
      item = mdef.tip(mark.items, p);
    }

    return item;
  }

  /**
   * Create a new Handler instance.
   * @param {object} [customLoader] - Optional loader instance for
   *   href URL sanitization. If not specified, a standard loader
   *   instance will be generated.
   * @param {function} [customTooltip] - Optional tooltip handler
   *   function for custom tooltip display.
   * @constructor
   */
  function Handler(customLoader, customTooltip) {
    this._active = null;
    this._handlers = {};
    this._loader = customLoader || vegaLoader.loader();
    this._tooltip = customTooltip || defaultTooltip;
  }

  // The default tooltip display handler.
  // Sets the HTML title attribute on the visualization container.
  function defaultTooltip(handler, event, item, value) {
    handler.element().setAttribute('title', value || '');
  }

  var prototype$3 = Handler.prototype;

  /**
   * Initialize a new Handler instance.
   * @param {DOMElement} el - The containing DOM element for the display.
   * @param {Array<number>} origin - The origin of the display, in pixels.
   *   The coordinate system will be translated to this point.
   * @param {object} [obj] - Optional context object that should serve as
   *   the "this" context for event callbacks.
   * @return {Handler} - This handler instance.
   */
  prototype$3.initialize = function(el, origin, obj) {
    this._el = el;
    this._obj = obj || null;
    return this.origin(origin);
  };

  /**
   * Returns the parent container element for a visualization.
   * @return {DOMElement} - The containing DOM element.
   */
  prototype$3.element = function() {
    return this._el;
  };

  /**
   * Returns the scene element (e.g., canvas or SVG) of the visualization
   * Subclasses must override if the first child is not the scene element.
   * @return {DOMElement} - The scene (e.g., canvas or SVG) element.
   */
  prototype$3.canvas = function() {
    return this._el && this._el.firstChild;
  };

  /**
   * Get / set the origin coordinates of the visualization.
   */
  prototype$3.origin = function(origin) {
    if (arguments.length) {
      this._origin = origin || [0, 0];
      return this;
    } else {
      return this._origin.slice();
    }
  };

  /**
   * Get / set the scenegraph root.
   */
  prototype$3.scene = function(scene) {
    if (!arguments.length) return this._scene;
    this._scene = scene;
    return this;
  };

  /**
   * Add an event handler. Subclasses should override this method.
   */
  prototype$3.on = function(/*type, handler*/) {};

  /**
   * Remove an event handler. Subclasses should override this method.
   */
  prototype$3.off = function(/*type, handler*/) {};

  /**
   * Utility method for finding the array index of an event handler.
   * @param {Array} h - An array of registered event handlers.
   * @param {string} type - The event type.
   * @param {function} handler - The event handler instance to find.
   * @return {number} - The handler's array index or -1 if not registered.
   */
  prototype$3._handlerIndex = function(h, type, handler) {
    for (var i = h ? h.length : 0; --i>=0;) {
      if (h[i].type === type && (!handler || h[i].handler === handler)) {
        return i;
      }
    }
    return -1;
  };

  /**
   * Returns an array with registered event handlers.
   * @param {string} [type] - The event type to query. Any annotations
   *   are ignored; for example, for the argument "click.foo", ".foo" will
   *   be ignored and the method returns all "click" handlers. If type is
   *   null or unspecified, this method returns handlers for all types.
   * @return {Array} - A new array containing all registered event handlers.
   */
  prototype$3.handlers = function(type) {
    var h = this._handlers, a = [], k;
    if (type) {
      a.push.apply(a, h[this.eventName(type)]);
    } else {
      for (k in h) { a.push.apply(a, h[k]); }
    }
    return a;
  };

  /**
   * Parses an event name string to return the specific event type.
   * For example, given "click.foo" returns "click"
   * @param {string} name - The input event type string.
   * @return {string} - A string with the event type only.
   */
  prototype$3.eventName = function(name) {
    var i = name.indexOf('.');
    return i < 0 ? name : name.slice(0,i);
  };

  /**
   * Handle hyperlink navigation in response to an item.href value.
   * @param {Event} event - The event triggering hyperlink navigation.
   * @param {Item} item - The scenegraph item.
   * @param {string} href - The URL to navigate to.
   */
  prototype$3.handleHref = function(event, item, href) {
    this._loader
      .sanitize(href, {context:'href'})
      .then(function(opt) {
        var e = new MouseEvent(event.type, event),
            a = domCreate(null, 'a');
        for (var name in opt) a.setAttribute(name, opt[name]);
        a.dispatchEvent(e);
      })
      .catch(function() { /* do nothing */ });
  };

  /**
   * Handle tooltip display in response to an item.tooltip value.
   * @param {Event} event - The event triggering tooltip display.
   * @param {Item} item - The scenegraph item.
   * @param {boolean} show - A boolean flag indicating whether
   *   to show or hide a tooltip for the given item.
   */
  prototype$3.handleTooltip = function(event, item, show) {
    if (item && item.tooltip != null) {
      item = resolveItem(item, event, this.canvas(), this._origin);
      var value = (show && item && item.tooltip) || null;
      this._tooltip.call(this._obj, this, event, item, value);
    }
  };

  /**
   * Returns the size of a scenegraph item and its position relative
   * to the viewport.
   * @param {Item} item - The scenegraph item.
   * @return {object} - A bounding box object (compatible with the
   *   DOMRect type) consisting of x, y, width, heigh, top, left,
   *   right, and bottom properties.
   */
  prototype$3.getItemBoundingClientRect = function(item) {
    if (!(el = this.canvas())) return;

    var el, rect = el.getBoundingClientRect(),
        origin = this._origin,
        itemBounds = item.bounds,
        x = itemBounds.x1 + origin[0] + rect.left,
        y = itemBounds.y1 + origin[1] + rect.top,
        w = itemBounds.width(),
        h = itemBounds.height();

    // translate coordinate for each parent group
    while (item.mark && (item = item.mark.group)) {
      x += item.x || 0;
      y += item.y || 0;
    }

    // return DOMRect-compatible bounding box
    return {
      x:      x,
      y:      y,
      width:  w,
      height: h,
      left:   x,
      top:    y,
      right:  x + w,
      bottom: y + h
    };
  };

  /**
   * Create a new Renderer instance.
   * @param {object} [loader] - Optional loader instance for
   *   image and href URL sanitization. If not specified, a
   *   standard loader instance will be generated.
   * @constructor
   */
  function Renderer(loader) {
    this._el = null;
    this._bgcolor = null;
    this._loader = new ResourceLoader(loader);
  }

  var prototype$4 = Renderer.prototype;

  /**
   * Initialize a new Renderer instance.
   * @param {DOMElement} el - The containing DOM element for the display.
   * @param {number} width - The coordinate width of the display, in pixels.
   * @param {number} height - The coordinate height of the display, in pixels.
   * @param {Array<number>} origin - The origin of the display, in pixels.
   *   The coordinate system will be translated to this point.
   * @param {number} [scaleFactor=1] - Optional scaleFactor by which to multiply
   *   the width and height to determine the final pixel size.
   * @return {Renderer} - This renderer instance.
   */
  prototype$4.initialize = function(el, width, height, origin, scaleFactor) {
    this._el = el;
    return this.resize(width, height, origin, scaleFactor);
  };

  /**
   * Returns the parent container element for a visualization.
   * @return {DOMElement} - The containing DOM element.
   */
  prototype$4.element = function() {
    return this._el;
  };

  /**
   * Returns the scene element (e.g., canvas or SVG) of the visualization
   * Subclasses must override if the first child is not the scene element.
   * @return {DOMElement} - The scene (e.g., canvas or SVG) element.
   */
  prototype$4.canvas = function() {
    return this._el && this._el.firstChild;
  };

  /**
   * Get / set the background color.
   */
  prototype$4.background = function(bgcolor) {
    if (arguments.length === 0) return this._bgcolor;
    this._bgcolor = bgcolor;
    return this;
  };

  /**
   * Resize the display.
   * @param {number} width - The new coordinate width of the display, in pixels.
   * @param {number} height - The new coordinate height of the display, in pixels.
   * @param {Array<number>} origin - The new origin of the display, in pixels.
   *   The coordinate system will be translated to this point.
   * @param {number} [scaleFactor=1] - Optional scaleFactor by which to multiply
   *   the width and height to determine the final pixel size.
   * @return {Renderer} - This renderer instance;
   */
  prototype$4.resize = function(width, height, origin, scaleFactor) {
    this._width = width;
    this._height = height;
    this._origin = origin || [0, 0];
    this._scale = scaleFactor || 1;
    return this;
  };

  /**
   * Report a dirty item whose bounds should be redrawn.
   * This base class method does nothing. Subclasses that perform
   * incremental should implement this method.
   * @param {Item} item - The dirty item whose bounds should be redrawn.
   */
  prototype$4.dirty = function(/*item*/) {
  };

  /**
   * Render an input scenegraph, potentially with a set of dirty items.
   * This method will perform an immediate rendering with available resources.
   * The renderer may also need to perform image loading to perform a complete
   * render. This process can lead to asynchronous re-rendering of the scene
   * after this method returns. To receive notification when rendering is
   * complete, use the renderAsync method instead.
   * @param {object} scene - The root mark of a scenegraph to render.
   * @return {Renderer} - This renderer instance.
   */
  prototype$4.render = function(scene) {
    var r = this;

    // bind arguments into a render call, and cache it
    // this function may be subsequently called for async redraw
    r._call = function() { r._render(scene); };

    // invoke the renderer
    r._call();

    // clear the cached call for garbage collection
    // async redraws will stash their own copy
    r._call = null;

    return r;
  };

  /**
   * Internal rendering method. Renderer subclasses should override this
   * method to actually perform rendering.
   * @param {object} scene - The root mark of a scenegraph to render.
   */
  prototype$4._render = function(/*scene*/) {
    // subclasses to override
  };

  /**
   * Asynchronous rendering method. Similar to render, but returns a Promise
   * that resolves when all rendering is completed. Sometimes a renderer must
   * perform image loading to get a complete rendering. The returned
   * Promise will not resolve until this process completes.
   * @param {object} scene - The root mark of a scenegraph to render.
   * @return {Promise} - A Promise that resolves when rendering is complete.
   */
  prototype$4.renderAsync = function(scene) {
    var r = this.render(scene);
    return this._ready
      ? this._ready.then(function() { return r; })
      : Promise.resolve(r);
  };

  /**
   * Internal method for asynchronous resource loading.
   * Proxies method calls to the ImageLoader, and tracks loading
   * progress to invoke a re-render once complete.
   * @param {string} method - The method name to invoke on the ImageLoader.
   * @param {string} uri - The URI for the requested resource.
   * @return {Promise} - A Promise that resolves to the requested resource.
   */
  prototype$4._load = function(method, uri) {
    var r = this,
        p = r._loader[method](uri);

    if (!r._ready) {
      // re-render the scene when loading completes
      var call = r._call;
      r._ready = r._loader.ready()
        .then(function(redraw) {
          if (redraw) call();
          r._ready = null;
        });
    }

    return p;
  };

  /**
   * Sanitize a URL to include as a hyperlink in the rendered scene.
   * This method proxies a call to ImageLoader.sanitizeURL, but also tracks
   * image loading progress and invokes a re-render once complete.
   * @param {string} uri - The URI string to sanitize.
   * @return {Promise} - A Promise that resolves to the sanitized URL.
   */
  prototype$4.sanitizeURL = function(uri) {
    return this._load('sanitizeURL', uri);
  };

  /**
   * Requests an image to include in the rendered scene.
   * This method proxies a call to ImageLoader.loadImage, but also tracks
   * image loading progress and invokes a re-render once complete.
   * @param {string} uri - The URI string of the image.
   * @return {Promise} - A Promise that resolves to the loaded Image.
   */
  prototype$4.loadImage = function(uri) {
    return this._load('loadImage', uri);
  };

  var Events = [
    'keydown',
    'keypress',
    'keyup',
    'dragenter',
    'dragleave',
    'dragover',
    'mousedown',
    'mouseup',
    'mousemove',
    'mouseout',
    'mouseover',
    'click',
    'dblclick',
    'wheel',
    'mousewheel',
    'touchstart',
    'touchmove',
    'touchend'
  ];

  var TooltipShowEvent = 'mousemove';

  var TooltipHideEvent = 'mouseout';

  var HrefEvent = 'click';

  function CanvasHandler(loader, tooltip) {
    Handler.call(this, loader, tooltip);
    this._down = null;
    this._touch = null;
    this._first = true;
  }

  var prototype$5 = vegaUtil.inherits(CanvasHandler, Handler);

  prototype$5.initialize = function(el, origin, obj) {
    // add event listeners
    var canvas = this._canvas = el && domFind(el, 'canvas');
    if (canvas) {
      var that = this;
      this.events.forEach(function(type) {
        canvas.addEventListener(type, function(evt) {
          if (prototype$5[type]) {
            prototype$5[type].call(that, evt);
          } else {
            that.fire(type, evt);
          }
        });
      });
    }

    return Handler.prototype.initialize.call(this, el, origin, obj);
  };

  // return the backing canvas instance
  prototype$5.canvas = function() {
    return this._canvas;
  };

  // retrieve the current canvas context
  prototype$5.context = function() {
    return this._canvas.getContext('2d');
  };

  // supported events
  prototype$5.events = Events;

  // to keep old versions of firefox happy
  prototype$5.DOMMouseScroll = function(evt) {
    this.fire('mousewheel', evt);
  };

  function move(moveEvent, overEvent, outEvent) {
    return function(evt) {
      var a = this._active,
          p = this.pickEvent(evt);

      if (p === a) {
        // active item and picked item are the same
        this.fire(moveEvent, evt); // fire move
      } else {
        // active item and picked item are different
        if (!a || !a.exit) {
          // fire out for prior active item
          // suppress if active item was removed from scene
          this.fire(outEvent, evt);
        }
        this._active = p;          // set new active item
        this.fire(overEvent, evt); // fire over for new active item
        this.fire(moveEvent, evt); // fire move for new active item
      }
    };
  }

  function inactive(type) {
    return function(evt) {
      this.fire(type, evt);
      this._active = null;
    };
  }

  prototype$5.mousemove = move('mousemove', 'mouseover', 'mouseout');
  prototype$5.dragover  = move('dragover', 'dragenter', 'dragleave');

  prototype$5.mouseout  = inactive('mouseout');
  prototype$5.dragleave = inactive('dragleave');

  prototype$5.mousedown = function(evt) {
    this._down = this._active;
    this.fire('mousedown', evt);
  };

  prototype$5.click = function(evt) {
    if (this._down === this._active) {
      this.fire('click', evt);
      this._down = null;
    }
  };

  prototype$5.touchstart = function(evt) {
    this._touch = this.pickEvent(evt.changedTouches[0]);

    if (this._first) {
      this._active = this._touch;
      this._first = false;
    }

    this.fire('touchstart', evt, true);
  };

  prototype$5.touchmove = function(evt) {
    this.fire('touchmove', evt, true);
  };

  prototype$5.touchend = function(evt) {
    this.fire('touchend', evt, true);
    this._touch = null;
  };

  // fire an event
  prototype$5.fire = function(type, evt, touch) {
    var a = touch ? this._touch : this._active,
        h = this._handlers[type], i, len;

    // set event type relative to scenegraph items
    evt.vegaType = type;

    // handle hyperlinks and tooltips first
    if (type === HrefEvent && a && a.href) {
      this.handleHref(evt, a, a.href);
    } else if (type === TooltipShowEvent || type === TooltipHideEvent) {
      this.handleTooltip(evt, a, type !== TooltipHideEvent);
    }

    // invoke all registered handlers
    if (h) {
      for (i=0, len=h.length; i<len; ++i) {
        h[i].handler.call(this._obj, evt, a);
      }
    }
  };

  // add an event handler
  prototype$5.on = function(type, handler) {
    var name = this.eventName(type),
        h = this._handlers,
        i = this._handlerIndex(h[name], type, handler);

    if (i < 0) {
      (h[name] || (h[name] = [])).push({
        type:    type,
        handler: handler
      });
    }

    return this;
  };

  // remove an event handler
  prototype$5.off = function(type, handler) {
    var name = this.eventName(type),
        h = this._handlers[name],
        i = this._handlerIndex(h, type, handler);

    if (i >= 0) {
      h.splice(i, 1);
    }

    return this;
  };

  prototype$5.pickEvent = function(evt) {
    var p = point(evt, this._canvas),
        o = this._origin;
    return this.pick(this._scene, p[0], p[1], p[0] - o[0], p[1] - o[1]);
  };

  // find the scenegraph item at the current mouse position
  // x, y -- the absolute x, y mouse coordinates on the canvas element
  // gx, gy -- the relative coordinates within the current group
  prototype$5.pick = function(scene, x, y, gx, gy) {
    var g = this.context(),
        mark = marks[scene.marktype];
    return mark.pick.call(this, g, scene, x, y, gx, gy);
  };

  function clip$1(context, scene) {
    var clip = scene.clip;

    context.save();
    context.beginPath();

    if (vegaUtil.isFunction(clip)) {
      clip(context);
    } else {
      var group = scene.group;
      context.rect(0, 0, group.width || 0, group.height || 0);
    }

    context.clip();
  }

  function devicePixelRatio() {
    return typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  }

  var pixelRatio = devicePixelRatio();

  function resize(canvas, width, height, origin, scaleFactor) {
    var inDOM = typeof HTMLElement !== 'undefined'
      && canvas instanceof HTMLElement
      && canvas.parentNode != null;

    var context = canvas.getContext('2d'),
        ratio = inDOM ? pixelRatio : scaleFactor;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    if (inDOM && ratio !== 1) {
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
    }

    context.pixelRatio = ratio;
    context.setTransform(
      ratio, 0, 0, ratio,
      ratio * origin[0],
      ratio * origin[1]
    );

    return canvas;
  }

  function CanvasRenderer(loader) {
    Renderer.call(this, loader);
    this._redraw = false;
    this._dirty = new Bounds();
  }

  var prototype$6 = vegaUtil.inherits(CanvasRenderer, Renderer),
      base = Renderer.prototype,
      tempBounds$1 = new Bounds();

  prototype$6.initialize = function(el, width, height, origin, scaleFactor) {
    this._canvas = vegaCanvas.canvas(1, 1); // instantiate a small canvas
    if (el) {
      domClear(el, 0).appendChild(this._canvas);
      this._canvas.setAttribute('class', 'marks');
    }
    // this method will invoke resize to size the canvas appropriately
    return base.initialize.call(this, el, width, height, origin, scaleFactor);
  };

  prototype$6.resize = function(width, height, origin, scaleFactor) {
    base.resize.call(this, width, height, origin, scaleFactor);
    resize(this._canvas, this._width, this._height, this._origin, this._scale);
    this._redraw = true;
    return this;
  };

  prototype$6.canvas = function() {
    return this._canvas;
  };

  prototype$6.context = function() {
    return this._canvas ? this._canvas.getContext('2d') : null;
  };

  prototype$6.dirty = function(item) {
    var b = translate$1(item.bounds, item.mark.group);
    this._dirty.union(b);
  };

  function clipToBounds(g, b, origin) {
    // expand bounds by 1 pixel, then round to pixel boundaries
    b.expand(1).round();

    // to avoid artifacts translate if origin has fractional pixels
    b.translate(-(origin[0] % 1), -(origin[1] % 1));

    // set clipping path
    g.beginPath();
    g.rect(b.x1, b.y1, b.width(), b.height());
    g.clip();

    return b;
  }

  function translate$1(bounds, group) {
    if (group == null) return bounds;
    var b = tempBounds$1.clear().union(bounds);
    for (; group != null; group = group.mark.group) {
      b.translate(group.x || 0, group.y || 0);
    }
    return b;
  }

  prototype$6._render = function(scene) {
    var g = this.context(),
        o = this._origin,
        w = this._width,
        h = this._height,
        b = this._dirty;

    // setup
    g.save();
    if (this._redraw || b.empty()) {
      this._redraw = false;
      b = null;
    } else {
      b = clipToBounds(g, b, o);
    }

    this.clear(-o[0], -o[1], w, h);

    // render
    this.draw(g, scene, b);

    // takedown
    g.restore();

    this._dirty.clear();
    return this;
  };

  prototype$6.draw = function(ctx, scene, bounds) {
    var mark = marks[scene.marktype];
    if (scene.clip) clip$1(ctx, scene);
    mark.draw.call(this, ctx, scene, bounds);
    if (scene.clip) ctx.restore();
  };

  prototype$6.clear = function(x, y, w, h) {
    var g = this.context();
    g.clearRect(x, y, w, h);
    if (this._bgcolor != null) {
      g.fillStyle = this._bgcolor;
      g.fillRect(x, y, w, h);
    }
  };

  function SVGHandler(loader, tooltip) {
    Handler.call(this, loader, tooltip);
    var h = this;
    h._hrefHandler = listener(h, function(evt, item) {
      if (item && item.href) h.handleHref(evt, item, item.href);
    });
    h._tooltipHandler = listener(h, function(evt, item) {
      h.handleTooltip(evt, item, evt.type !== TooltipHideEvent);
    });
  }

  var prototype$7 = vegaUtil.inherits(SVGHandler, Handler);

  prototype$7.initialize = function(el, origin, obj) {
    var svg = this._svg;
    if (svg) {
      svg.removeEventListener(HrefEvent, this._hrefHandler);
      svg.removeEventListener(TooltipShowEvent, this._tooltipHandler);
      svg.removeEventListener(TooltipHideEvent, this._tooltipHandler);
    }
    this._svg = svg = el && domFind(el, 'svg');
    if (svg) {
      svg.addEventListener(HrefEvent, this._hrefHandler);
      svg.addEventListener(TooltipShowEvent, this._tooltipHandler);
      svg.addEventListener(TooltipHideEvent, this._tooltipHandler);
    }
    return Handler.prototype.initialize.call(this, el, origin, obj);
  };

  prototype$7.canvas = function() {
    return this._svg;
  };

  // wrap an event listener for the SVG DOM
  function listener(context, handler) {
    return function(evt) {
      var target = evt.target,
          item = target.__data__;
      evt.vegaType = evt.type;
      item = Array.isArray(item) ? item[0] : item;
      handler.call(context._obj, evt, item);
    };
  }

  // add an event handler
  prototype$7.on = function(type, handler) {
    var name = this.eventName(type),
        h = this._handlers,
        i = this._handlerIndex(h[name], type, handler);

    if (i < 0) {
      var x = {
        type:     type,
        handler:  handler,
        listener: listener(this, handler)
      };

      (h[name] || (h[name] = [])).push(x);
      if (this._svg) {
        this._svg.addEventListener(name, x.listener);
      }
    }

    return this;
  };

  // remove an event handler
  prototype$7.off = function(type, handler) {
    var name = this.eventName(type),
        h = this._handlers[name],
        i = this._handlerIndex(h, type, handler);

    if (i >= 0) {
      if (this._svg) {
        this._svg.removeEventListener(name, h[i].listener);
      }
      h.splice(i, 1);
    }

    return this;
  };

  // generate string for an opening xml tag
  // tag: the name of the xml tag
  // attr: hash of attribute name-value pairs to include
  // raw: additional raw string to include in tag markup
  function openTag(tag, attr, raw) {
    var s = '<' + tag, key, val;
    if (attr) {
      for (key in attr) {
        val = attr[key];
        if (val != null) {
          s += ' ' + key + '="' + val + '"';
        }
      }
    }
    if (raw) s += ' ' + raw;
    return s + '>';
  }

  // generate string for closing xml tag
  // tag: the name of the xml tag
  function closeTag(tag) {
    return '</' + tag + '>';
  }

  var metadata = {
    'version': '1.1',
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink'
  };

  var styles = {
    'fill':             'fill',
    'fillOpacity':      'fill-opacity',
    'stroke':           'stroke',
    'strokeOpacity':    'stroke-opacity',
    'strokeWidth':      'stroke-width',
    'strokeCap':        'stroke-linecap',
    'strokeJoin':       'stroke-linejoin',
    'strokeDash':       'stroke-dasharray',
    'strokeDashOffset': 'stroke-dashoffset',
    'strokeMiterLimit': 'stroke-miterlimit',
    'opacity':          'opacity'
  };

  var styleProperties = Object.keys(styles);

  var ns = metadata.xmlns;

  function SVGRenderer(loader) {
    Renderer.call(this, loader);
    this._dirtyID = 1;
    this._dirty = [];
    this._svg = null;
    this._root = null;
    this._defs = null;
  }

  var prototype$8 = vegaUtil.inherits(SVGRenderer, Renderer);
  var base$1 = Renderer.prototype;

  prototype$8.initialize = function(el, width, height, padding) {
    if (el) {
      this._svg = domChild(el, 0, 'svg', ns);
      this._svg.setAttribute('class', 'marks');
      domClear(el, 1);
      // set the svg root group
      this._root = domChild(this._svg, 0, 'g', ns);
      domClear(this._svg, 1);
    }

    // create the svg definitions cache
    this._defs = {
      gradient: {},
      clipping: {}
    };

    // set background color if defined
    this.background(this._bgcolor);

    return base$1.initialize.call(this, el, width, height, padding);
  };

  prototype$8.background = function(bgcolor) {
    if (arguments.length && this._svg) {
      this._svg.style.setProperty('background-color', bgcolor);
    }
    return base$1.background.apply(this, arguments);
  };

  prototype$8.resize = function(width, height, origin, scaleFactor) {
    base$1.resize.call(this, width, height, origin, scaleFactor);

    if (this._svg) {
      this._svg.setAttribute('width', this._width * this._scale);
      this._svg.setAttribute('height', this._height * this._scale);
      this._svg.setAttribute('viewBox', '0 0 ' + this._width + ' ' + this._height);
      this._root.setAttribute('transform', 'translate(' + this._origin + ')');
    }

    this._dirty = [];

    return this;
  };

  prototype$8.canvas = function() {
    return this._svg;
  };

  prototype$8.svg = function() {
    if (!this._svg) return null;

    var attr = {
      class:   'marks',
      width:   this._width * this._scale,
      height:  this._height * this._scale,
      viewBox: '0 0 ' + this._width + ' ' + this._height
    };
    for (var key in metadata) {
      attr[key] = metadata[key];
    }

    var bg = !this._bgcolor ? ''
      : (openTag('rect', {
          width:  this._width,
          height: this._height,
          style:  'fill: ' + this._bgcolor + ';'
        }) + closeTag('rect'));

    return openTag('svg', attr) + bg + this._svg.innerHTML + closeTag('svg');
  };


  // -- Render entry point --

  prototype$8._render = function(scene) {
    // perform spot updates and re-render markup
    if (this._dirtyCheck()) {
      if (this._dirtyAll) this._resetDefs();
      this.draw(this._root, scene);
      domClear(this._root, 1);
    }

    this.updateDefs();

    this._dirty = [];
    ++this._dirtyID;

    return this;
  };

  // -- Manage SVG definitions ('defs') block --

  prototype$8.updateDefs = function() {
    var svg = this._svg,
        defs = this._defs,
        el = defs.el,
        index = 0, id;

    for (id in defs.gradient) {
      if (!el) defs.el = (el = domChild(svg, 0, 'defs', ns));
      updateGradient(el, defs.gradient[id], index++);
    }

    for (id in defs.clipping) {
      if (!el) defs.el = (el = domChild(svg, 0, 'defs', ns));
      updateClipping(el, defs.clipping[id], index++);
    }

    // clean-up
    if (el) {
      if (index === 0) {
        svg.removeChild(el);
        defs.el = null;
      } else {
        domClear(el, index);
      }
    }
  };

  function updateGradient(el, grad, index) {
    var i, n, stop;

    el = domChild(el, index, 'linearGradient', ns);
    el.setAttribute('id', grad.id);
    el.setAttribute('x1', grad.x1);
    el.setAttribute('x2', grad.x2);
    el.setAttribute('y1', grad.y1);
    el.setAttribute('y2', grad.y2);

    for (i=0, n=grad.stops.length; i<n; ++i) {
      stop = domChild(el, i, 'stop', ns);
      stop.setAttribute('offset', grad.stops[i].offset);
      stop.setAttribute('stop-color', grad.stops[i].color);
    }
    domClear(el, i);
  }

  function updateClipping(el, clip$$1, index) {
    var mask;

    el = domChild(el, index, 'clipPath', ns);
    el.setAttribute('id', clip$$1.id);

    if (clip$$1.path) {
      mask = domChild(el, 0, 'path', ns);
      mask.setAttribute('d', clip$$1.path);
    } else {
      mask = domChild(el, 0, 'rect', ns);
      mask.setAttribute('x', 0);
      mask.setAttribute('y', 0);
      mask.setAttribute('width', clip$$1.width);
      mask.setAttribute('height', clip$$1.height);
    }
  }

  prototype$8._resetDefs = function() {
    var def = this._defs;
    def.gradient = {};
    def.clipping = {};
  };


  // -- Manage rendering of items marked as dirty --

  prototype$8.dirty = function(item) {
    if (item.dirty !== this._dirtyID) {
      item.dirty = this._dirtyID;
      this._dirty.push(item);
    }
  };

  prototype$8.isDirty = function(item) {
    return this._dirtyAll
      || !item._svg
      || item.dirty === this._dirtyID;
  };

  prototype$8._dirtyCheck = function() {
    this._dirtyAll = true;
    var items = this._dirty;
    if (!items.length) return true;

    var id = ++this._dirtyID,
        item, mark, type, mdef, i, n, o;

    for (i=0, n=items.length; i<n; ++i) {
      item = items[i];
      mark = item.mark;

      if (mark.marktype !== type) {
        // memoize mark instance lookup
        type = mark.marktype;
        mdef = marks[type];
      }

      if (mark.zdirty && mark.dirty !== id) {
        this._dirtyAll = false;
        dirtyParents(item, id);
        mark.items.forEach(function(i) { i.dirty = id; });
      }
      if (mark.zdirty) continue; // handle in standard drawing pass

      if (item.exit) { // EXIT
        if (mdef.nested && mark.items.length) {
          // if nested mark with remaining points, update instead
          o = mark.items[0];
          if (o._svg) this._update(mdef, o._svg, o);
        } else if (item._svg) {
          // otherwise remove from DOM
          o = item._svg.parentNode;
          if (o) o.removeChild(item._svg);
        }
        item._svg = null;
        continue;
      }

      item = (mdef.nested ? mark.items[0] : item);
      if (item._update === id) continue; // already visited

      if (!item._svg || !item._svg.ownerSVGElement) {
        // ENTER
        this._dirtyAll = false;
        dirtyParents(item, id);
      } else {
        // IN-PLACE UPDATE
        this._update(mdef, item._svg, item);
      }
      item._update = id;
    }
    return !this._dirtyAll;
  };

  function dirtyParents(item, id) {
    for (; item && item.dirty !== id; item=item.mark.group) {
      item.dirty = id;
      if (item.mark && item.mark.dirty !== id) {
        item.mark.dirty = id;
      } else return;
    }
  }


  // -- Construct & maintain scenegraph to SVG mapping ---

  // Draw a mark container.
  prototype$8.draw = function(el, scene, prev) {
    if (!this.isDirty(scene)) return scene._svg;

    var renderer = this,
        svg = this._svg,
        mdef = marks[scene.marktype],
        events = scene.interactive === false ? 'none' : null,
        isGroup = mdef.tag === 'g',
        sibling = null,
        i = 0,
        parent;

    parent = bind(scene, el, prev, 'g', svg);
    parent.setAttribute('class', cssClass(scene));
    if (!isGroup) {
      parent.style.setProperty('pointer-events', events);
    }
    if (scene.clip) {
      parent.setAttribute('clip-path', clip(renderer, scene, scene.group));
    } else {
      parent.removeAttribute('clip-path');
    }

    function process(item) {
      var dirty = renderer.isDirty(item),
          node = bind(item, parent, sibling, mdef.tag, svg);

      if (dirty) {
        renderer._update(mdef, node, item);
        if (isGroup) recurse(renderer, node, item);
      }

      sibling = node;
      ++i;
    }

    if (mdef.nested) {
      if (scene.items.length) process(scene.items[0]);
    } else {
      visit(scene, process);
    }

    domClear(parent, i);
    return parent;
  };

  // Recursively process group contents.
  function recurse(renderer, el, group) {
    el = el.lastChild;
    var prev, idx = 0;

    visit(group, function(item) {
      prev = renderer.draw(el, item, prev);
      ++idx;
    });

    // remove any extraneous DOM elements
    domClear(el, 1 + idx);
  }

  // Bind a scenegraph item to an SVG DOM element.
  // Create new SVG elements as needed.
  function bind(item, el, sibling, tag, svg) {
    var node = item._svg, doc;

    // create a new dom node if needed
    if (!node) {
      doc = el.ownerDocument;
      node = domCreate(doc, tag, ns);
      item._svg = node;

      if (item.mark) {
        node.__data__ = item;
        node.__values__ = {fill: 'default'};

        // if group, create background and foreground elements
        if (tag === 'g') {
          var bg = domCreate(doc, 'path', ns);
          bg.setAttribute('class', 'background');
          node.appendChild(bg);
          bg.__data__ = item;

          var fg = domCreate(doc, 'g', ns);
          node.appendChild(fg);
          fg.__data__ = item;
        }
      }
    }

    // (re-)insert if (a) not contained in SVG or (b) sibling order has changed
    if (node.ownerSVGElement !== svg || hasSiblings(item) && node.previousSibling !== sibling) {
      el.insertBefore(node, sibling ? sibling.nextSibling : el.firstChild);
    }

    return node;
  }

  function hasSiblings(item) {
    var parent = item.mark || item.group;
    return parent && parent.items.length > 1;
  }


  // -- Set attributes & styles on SVG elements ---

  var element = null, // temp var for current SVG element
      values = null;  // temp var for current values hash

  // Extra configuration for certain mark types
  var mark_extras = {
    group: function(mdef, el, item) {
      values = el.__values__; // use parent's values hash

      element = el.childNodes[1];
      mdef.foreground(emit, item, this);

      element = el.childNodes[0];
      mdef.background(emit, item, this);

      var value = item.mark.interactive === false ? 'none' : null;
      if (value !== values.events) {
        element.style.setProperty('pointer-events', value);
        values.events = value;
      }
    },
    text: function(mdef, el, item) {
      var value;

      value = textValue(item);
      if (value !== values.text) {
        el.textContent = value;
        values.text = value;
      }

      setStyle(el, 'font-family', fontFamily(item));
      setStyle(el, 'font-size', fontSize(item) + 'px');
      setStyle(el, 'font-style', item.fontStyle);
      setStyle(el, 'font-variant', item.fontVariant);
      setStyle(el, 'font-weight', item.fontWeight);
    }
  };

  function setStyle(el, name, value) {
    if (value !== values[name]) {
      if (value == null) {
        el.style.removeProperty(name);
      } else {
        el.style.setProperty(name, value + '');
      }
      values[name] = value;
    }
  }

  prototype$8._update = function(mdef, el, item) {
    // set dom element and values cache
    // provides access to emit method
    element = el;
    values = el.__values__;

    // apply svg attributes
    mdef.attr(emit, item, this);

    // some marks need special treatment
    var extra = mark_extras[mdef.type];
    if (extra) extra.call(this, mdef, el, item);

    // apply svg css styles
    // note: element may be modified by 'extra' method
    this.style(element, item);
  };

  function emit(name, value, ns) {
    // early exit if value is unchanged
    if (value === values[name]) return;

    if (value != null) {
      // if value is provided, update DOM attribute
      if (ns) {
        element.setAttributeNS(ns, name, value);
      } else {
        element.setAttribute(name, value);
      }
    } else {
      // else remove DOM attribute
      if (ns) {
        element.removeAttributeNS(ns, name);
      } else {
        element.removeAttribute(name);
      }
    }

    // note current value for future comparison
    values[name] = value;
  }

  prototype$8.style = function(el, o) {
    if (o == null) return;
    var i, n, prop, name, value;

    for (i=0, n=styleProperties.length; i<n; ++i) {
      prop = styleProperties[i];
      value = o[prop];

      if (prop === 'font') {
        value = fontFamily(o);
      }

      if (value === values[prop]) continue;

      name = styles[prop];
      if (value == null) {
        if (name === 'fill') {
          el.style.setProperty(name, 'none');
        } else {
          el.style.removeProperty(name);
        }
      } else {
        if (value.id) {
          // ensure definition is included
          this._defs.gradient[value.id] = value;
          value = 'url(' + href() + '#' + value.id + ')';
        }
        el.style.setProperty(name, value + '');
      }

      values[prop] = value;
    }
  };

  function href() {
    var loc;
    return typeof window === 'undefined' ? ''
      : (loc = window.location).hash ? loc.href.slice(0, -loc.hash.length)
      : loc.href;
  }

  function SVGStringRenderer(loader) {
    Renderer.call(this, loader);

    this._text = {
      head: '',
      bg:   '',
      root: '',
      foot: '',
      defs: '',
      body: ''
    };

    this._defs = {
      gradient: {},
      clipping: {}
    };
  }

  var prototype$9 = vegaUtil.inherits(SVGStringRenderer, Renderer);
  var base$2 = Renderer.prototype;

  prototype$9.resize = function(width, height, origin, scaleFactor) {
    base$2.resize.call(this, width, height, origin, scaleFactor);
    var o = this._origin,
        t = this._text;

    var attr = {
      class:   'marks',
      width:   this._width * this._scale,
      height:  this._height * this._scale,
      viewBox: '0 0 ' + this._width + ' ' + this._height
    };
    for (var key in metadata) {
      attr[key] = metadata[key];
    }

    t.head = openTag('svg', attr);

    var bg = this._bgcolor;
    if (bg === 'transparent' || bg === 'none') bg = null;

    if (bg) {
      t.bg = openTag('rect', {
        width:  this._width,
        height: this._height,
        style:  'fill: ' + bg + ';'
      }) + closeTag('rect');
    } else {
      t.bg = '';
    }

    t.root = openTag('g', {
      transform: 'translate(' + o + ')'
    });

    t.foot = closeTag('g') + closeTag('svg');

    return this;
  };

  prototype$9.background = function() {
    var rv = base$2.background.apply(this, arguments);
    if (arguments.length && this._text.head) {
      this.resize(this._width, this._height, this._origin, this._scale);
    }
    return rv;
  };

  prototype$9.svg = function() {
    var t = this._text;
    return t.head + t.bg + t.defs + t.root + t.body + t.foot;
  };

  prototype$9._render = function(scene) {
    this._text.body = this.mark(scene);
    this._text.defs = this.buildDefs();
    return this;
  };

  prototype$9.buildDefs = function() {
    var all = this._defs,
        defs = '',
        i, id, def, stops;

    for (id in all.gradient) {
      def = all.gradient[id];
      stops = def.stops;

      defs += openTag('linearGradient', {
        id: id,
        x1: def.x1,
        x2: def.x2,
        y1: def.y1,
        y2: def.y2
      });

      for (i=0; i<stops.length; ++i) {
        defs += openTag('stop', {
          offset: stops[i].offset,
          'stop-color': stops[i].color
        }) + closeTag('stop');
      }

      defs += closeTag('linearGradient');
    }

    for (id in all.clipping) {
      def = all.clipping[id];

      defs += openTag('clipPath', {id: id});

      if (def.path) {
        defs += openTag('path', {
          d: def.path
        }) + closeTag('path');
      } else {
        defs += openTag('rect', {
          x: 0,
          y: 0,
          width: def.width,
          height: def.height
        }) + closeTag('rect');
      }

      defs += closeTag('clipPath');
    }

    return (defs.length > 0) ? openTag('defs') + defs + closeTag('defs') : '';
  };

  var object;

  function emit$1(name, value, ns, prefixed) {
    object[prefixed || name] = value;
  }

  prototype$9.attributes = function(attr, item) {
    object = {};
    attr(emit$1, item, this);
    return object;
  };

  prototype$9.href = function(item) {
    var that = this,
        href = item.href,
        attr;

    if (href) {
      if (attr = that._hrefs && that._hrefs[href]) {
        return attr;
      } else {
        that.sanitizeURL(href).then(function(attr) {
          // rewrite to use xlink namespace
          // note that this will be deprecated in SVG 2.0
          attr['xlink:href'] = attr.href;
          attr.href = null;
          (that._hrefs || (that._hrefs = {}))[href] = attr;
        });
      }
    }
    return null;
  };

  prototype$9.mark = function(scene) {
    var renderer = this,
        mdef = marks[scene.marktype],
        tag  = mdef.tag,
        defs = this._defs,
        str = '',
        style;

    if (tag !== 'g' && scene.interactive === false) {
      style = 'style="pointer-events: none;"';
    }

    // render opening group tag
    str += openTag('g', {
      'class': cssClass(scene),
      'clip-path': scene.clip ? clip(renderer, scene, scene.group) : null
    }, style);

    // render contained elements
    function process(item) {
      var href = renderer.href(item);
      if (href) str += openTag('a', href);

      style = (tag !== 'g') ? applyStyles(item, scene, tag, defs) : null;
      str += openTag(tag, renderer.attributes(mdef.attr, item), style);

      if (tag === 'text') {
        str += escape_text(textValue(item));
      } else if (tag === 'g') {
        str += openTag('path', renderer.attributes(mdef.background, item),
          applyStyles(item, scene, 'bgrect', defs)) + closeTag('path');

        str += openTag('g', renderer.attributes(mdef.foreground, item))
          + renderer.markGroup(item)
          + closeTag('g');
      }

      str += closeTag(tag);
      if (href) str += closeTag('a');
    }

    if (mdef.nested) {
      if (scene.items && scene.items.length) process(scene.items[0]);
    } else {
      visit(scene, process);
    }

    // render closing group tag
    return str + closeTag('g');
  };

  prototype$9.markGroup = function(scene) {
    var renderer = this,
        str = '';

    visit(scene, function(item) {
      str += renderer.mark(item);
    });

    return str;
  };

  function applyStyles(o, mark, tag, defs) {
    if (o == null) return '';
    var i, n, prop, name, value, s = '';

    if (tag === 'bgrect' && mark.interactive === false) {
      s += 'pointer-events: none; ';
    }

    if (tag === 'text') {
      s += 'font-family: ' + fontFamily(o) + '; ';
      s += 'font-size: ' + fontSize(o) + 'px; ';
      if (o.fontStyle) s += 'font-style: ' + o.fontStyle + '; ';
      if (o.fontVariant) s += 'font-variant: ' + o.fontVariant + '; ';
      if (o.fontWeight) s += 'font-weight: ' + o.fontWeight + '; ';
    }

    for (i=0, n=styleProperties.length; i<n; ++i) {
      prop = styleProperties[i];
      name = styles[prop];
      value = o[prop];

      if (value == null) {
        if (name === 'fill') {
          s += 'fill: none; ';
        }
      } else if (value === 'transparent' && (name === 'fill' || name === 'stroke')) {
        // transparent is not a legal SVG value, so map to none instead
        s += name + ': none; ';
      } else {
        if (value.id) {
          // ensure definition is included
          defs.gradient[value.id] = value;
          value = 'url(#' + value.id + ')';
        }
        s += name + ': ' + value + '; ';
      }
    }

    return s ? 'style="' + s.trim() + '"' : null;
  }

  function escape_text(s) {
    return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
  }

  var Canvas = 'canvas';
  var PNG = 'png';
  var SVG = 'svg';
  var None = 'none';

  var RenderType = {
    Canvas: Canvas,
    PNG:    PNG,
    SVG:    SVG,
    None:   None
  };

  var modules = {};

  modules[Canvas] = modules[PNG] = {
    renderer: CanvasRenderer,
    headless: CanvasRenderer,
    handler:  CanvasHandler
  };

  modules[SVG] = {
    renderer: SVGRenderer,
    headless: SVGStringRenderer,
    handler:  SVGHandler
  };

  modules[None] = {};

  function renderModule(name, _) {
    name = String(name || '').toLowerCase();
    if (arguments.length > 1) {
      modules[name] = _;
      return this;
    } else {
      return modules[name];
    }
  }

  var clipBounds = new Bounds();

  function boundClip(mark) {
    var clip = mark.clip;

    if (vegaUtil.isFunction(clip)) {
      clip(context(clipBounds.clear()));
    } else if (clip) {
      clipBounds.set(0, 0, mark.group.width, mark.group.height);
    } else return;

    mark.bounds.intersect(clipBounds);
  }

  var TOLERANCE = 1e-9;

  function sceneEqual(a, b, key) {
    return (a === b) ? true
      : (key === 'path') ? pathEqual(a, b)
      : (a instanceof Date && b instanceof Date) ? +a === +b
      : (vegaUtil.isNumber(a) && vegaUtil.isNumber(b)) ? Math.abs(a - b) <= TOLERANCE
      : (!a || !b || !vegaUtil.isObject(a) && !vegaUtil.isObject(b)) ? a == b
      : (a == null || b == null) ? false
      : objectEqual(a, b);
  }

  function pathEqual(a, b) {
    return sceneEqual(pathParse(a), pathParse(b));
  }

  function objectEqual(a, b) {
    var ka = Object.keys(a),
        kb = Object.keys(b),
        key, i;

    if (ka.length !== kb.length) return false;

    ka.sort();
    kb.sort();

    for (i = ka.length - 1; i >= 0; i--) {
      if (ka[i] != kb[i]) return false;
    }

    for (i = ka.length - 1; i >= 0; i--) {
      key = ka[i];
      if (!sceneEqual(a[key], b[key], key)) return false;
    }

    return typeof a === typeof b;
  }

  exports.Bounds = Bounds;
  exports.Gradient = Gradient;
  exports.GroupItem = GroupItem;
  exports.ResourceLoader = ResourceLoader;
  exports.Item = Item;
  exports.Scenegraph = Scenegraph;
  exports.Handler = Handler;
  exports.Renderer = Renderer;
  exports.CanvasHandler = CanvasHandler;
  exports.CanvasRenderer = CanvasRenderer;
  exports.SVGHandler = SVGHandler;
  exports.SVGRenderer = SVGRenderer;
  exports.SVGStringRenderer = SVGStringRenderer;
  exports.RenderType = RenderType;
  exports.renderModule = renderModule;
  exports.Marks = marks;
  exports.boundClip = boundClip;
  exports.boundContext = context;
  exports.boundStroke = boundStroke;
  exports.boundItem = boundItem;
  exports.boundMark = boundMark;
  exports.pathCurves = curves;
  exports.pathSymbols = symbols;
  exports.pathRectangle = vg_rect;
  exports.pathTrail = vg_trail;
  exports.pathParse = pathParse;
  exports.pathRender = pathRender;
  exports.point = point;
  exports.domCreate = domCreate;
  exports.domFind = domFind;
  exports.domChild = domChild;
  exports.domClear = domClear;
  exports.openTag = openTag;
  exports.closeTag = closeTag;
  exports.font = font;
  exports.fontFamily = fontFamily;
  exports.fontSize = fontSize;
  exports.textMetrics = textMetrics;
  exports.resetSVGClipId = resetSVGClipId;
  exports.sceneEqual = sceneEqual;
  exports.pathEqual = pathEqual;
  exports.sceneToJSON = sceneToJSON;
  exports.sceneFromJSON = sceneFromJSON;
  exports.sceneZOrder = zorder;
  exports.sceneVisit = visit;
  exports.scenePickVisit = pickVisit;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
