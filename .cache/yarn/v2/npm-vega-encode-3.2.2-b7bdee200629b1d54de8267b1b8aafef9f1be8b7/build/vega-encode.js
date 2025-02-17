(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-format'), require('d3-array'), require('vega-scale'), require('d3-interpolate'), require('vega-dataflow'), require('vega-util')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-format', 'd3-array', 'vega-scale', 'd3-interpolate', 'vega-dataflow', 'vega-util'], factory) :
  (factory((global.vega = global.vega || {}, global.vega.transforms = {}),global.d3,global.d3,global.vega,global.d3,global.vega,global.vega));
}(this, (function (exports,d3Format,d3Array,vegaScale,d3Interpolate,vegaDataflow,vegaUtil) { 'use strict';

  var Log = 'log';
  var Pow = 'pow';
  var Utc = 'utc';
  var Sqrt = 'sqrt';
  var Band = 'band';
  var Time = 'time';
  var Point = 'point';
  var Linear = 'linear';
  var Ordinal = 'ordinal';
  var Quantile = 'quantile';
  var Quantize = 'quantize';
  var Threshold = 'threshold';
  var BinLinear = 'bin-linear';
  var BinOrdinal = 'bin-ordinal';
  var Sequential = 'sequential';

  /**
   * Determine the tick count or interval function.
   * @param {Scale} scale - The scale for which to generate tick values.
   * @param {*} count - The desired tick count or interval specifier.
   * @return {*} - The tick count or interval function.
   */
  function tickCount(scale, count) {
    var step;

    if (vegaUtil.isObject(count)) {
      step = count.step;
      count = count.interval;
    }

    if (vegaUtil.isString(count)) {
      count = scale.type === 'time' ? vegaScale.timeInterval(count)
        : scale.type === 'utc' ? vegaScale.utcInterval(count)
        : vegaUtil.error('Only time and utc scales accept interval strings.');
      if (step) count = count.every(step);
    }

    return count;
  }

  /**
   * Filter a set of candidate tick values, ensuring that only tick values
   * that lie within the scale range are included.
   * @param {Scale} scale - The scale for which to generate tick values.
   * @param {Array<*>} ticks - The candidate tick values.
   * @param {*} count - The tick count or interval function.
   * @return {Array<*>} - The filtered tick values.
   */
  function validTicks(scale, ticks, count) {
    var range = scale.range(),
        lo = range[0],
        hi = vegaUtil.peek(range);
    if (lo > hi) {
      range = hi;
      hi = lo;
      lo = range;
    }

    ticks = ticks.filter(function(v) {
      v = scale(v);
      return !(v < lo || v > hi)
    });

    if (count > 0 && ticks.length > 1) {
      var endpoints = [ticks[0], vegaUtil.peek(ticks)];
      while (ticks.length > count && ticks.length >= 3) {
        ticks = ticks.filter(function(_, i) { return !(i % 2); });
      }
      if (ticks.length < 3) {
        ticks = endpoints;
      }
    }

    return ticks;
  }

  /**
   * Generate tick values for the given scale and approximate tick count or
   * interval value. If the scale has a 'ticks' method, it will be used to
   * generate the ticks, with the count argument passed as a parameter. If the
   * scale lacks a 'ticks' method, the full scale domain will be returned.
   * @param {Scale} scale - The scale for which to generate tick values.
   * @param {*} [count] - The approximate number of desired ticks.
   * @return {Array<*>} - The generated tick values.
   */
  function tickValues(scale, count) {
    return scale.ticks ? scale.ticks(count) : scale.domain();
  }

  /**
   * Generate a label format function for a scale. If the scale has a
   * 'tickFormat' method, it will be used to generate the formatter, with the
   * count and specifier arguments passed as parameters. If the scale lacks a
   * 'tickFormat' method, the returned formatter performs simple string coercion.
   * If the input scale is a logarithmic scale and the format specifier does not
   * indicate a desired decimal precision, a special variable precision formatter
   * that automatically trims trailing zeroes will be generated.
   * @param {Scale} scale - The scale for which to generate the label formatter.
   * @param {*} [count] - The approximate number of desired ticks.
   * @param {string} [specifier] - The format specifier. Must be a legal d3 4.0
   *   specifier string (see https://github.com/d3/d3-format#formatSpecifier).
   * @return {function(*):string} - The generated label formatter.
   */
  function tickFormat(scale, count, specifier) {
    var format = scale.tickFormat ? scale.tickFormat(count, specifier)
      : specifier ? d3Format.format(specifier)
      : String;

    return (scale.type === Log)
      ? filter(format, variablePrecision(specifier))
      : format;
  }

  function filter(sourceFormat, targetFormat) {
    return function(_) {
      return sourceFormat(_) ? targetFormat(_) : '';
    };
  }

  function variablePrecision(specifier) {
    var s = d3Format.formatSpecifier(specifier || ',');

    if (s.precision == null) {
      s.precision = 12;
      switch (s.type) {
        case '%': s.precision -= 2; break;
        case 'e': s.precision -= 1; break;
      }
      return trimZeroes(
        d3Format.format(s),          // number format
        d3Format.format('.1f')(1)[1] // decimal point character
      );
    } else {
      return d3Format.format(s);
    }
  }

  function trimZeroes(format, decimalChar) {
    return function(x) {
      var str = format(x),
          dec = str.indexOf(decimalChar),
          idx, end;

      if (dec < 0) return str;

      idx = rightmostDigit(str, dec);
      end = idx < str.length ? str.slice(idx) : '';
      while (--idx > dec) if (str[idx] !== '0') { ++idx; break; }

      return str.slice(0, idx) + end;
    };
  }

  function rightmostDigit(str, dec) {
    var i = str.lastIndexOf('e'), c;
    if (i > 0) return i;
    for (i=str.length; --i > dec;) {
      c = str.charCodeAt(i);
      if (c >= 48 && c <= 57) return i + 1; // is digit
    }
  }

  /**
   * Generates axis ticks for visualizing a spatial scale.
   * @constructor
   * @param {object} params - The parameters for this operator.
   * @param {Scale} params.scale - The scale to generate ticks for.
   * @param {*} [params.count=10] - The approximate number of ticks, or
   *   desired tick interval, to use.
   * @param {Array<*>} [params.values] - The exact tick values to use.
   *   These must be legal domain values for the provided scale.
   *   If provided, the count argument is ignored.
   * @param {function(*):string} [params.formatSpecifier] - A format specifier
   *   to use in conjunction with scale.tickFormat. Legal values are
   *   any valid d3 4.0 format specifier.
   * @param {function(*):string} [params.format] - The format function to use.
   *   If provided, the formatSpecifier argument is ignored.
   */
  function AxisTicks(params) {
    vegaDataflow.Transform.call(this, null, params);
  }

  var prototype = vegaUtil.inherits(AxisTicks, vegaDataflow.Transform);

  prototype.transform = function(_, pulse) {
    if (this.value && !_.modified()) {
      return pulse.StopPropagation;
    }

    var out = pulse.fork(pulse.NO_SOURCE | pulse.NO_FIELDS),
        ticks = this.value,
        scale = _.scale,
        count = _.count == null ? (_.values ? _.values.length : 10) : tickCount(scale, _.count),
        format = _.format || tickFormat(scale, count, _.formatSpecifier),
        values = _.values ? validTicks(scale, _.values, count) : tickValues(scale, count);

    if (ticks) out.rem = ticks;

    ticks = values.map(function(value, i) {
      return vegaDataflow.ingest({
        index: i / (values.length - 1),
        value: value,
        label: format(value)
      });
    });

    if (_.extra && ticks.length) {
      // add an extra tick pegged to the initial domain value
      // this is used to generate axes with 'binned' domains
      ticks.push(vegaDataflow.ingest({
        index: -1,
        extra: {value: ticks[0].value},
        label: ''
      }));
    }

    out.source = ticks;
    out.add = ticks;
    this.value = ticks;

    return out;
  };

  /**
   * Joins a set of data elements against a set of visual items.
   * @constructor
   * @param {object} params - The parameters for this operator.
   * @param {function(object): object} [params.item] - An item generator function.
   * @param {function(object): *} [params.key] - The key field associating data and visual items.
   */
  function DataJoin(params) {
    vegaDataflow.Transform.call(this, null, params);
  }

  var prototype$1 = vegaUtil.inherits(DataJoin, vegaDataflow.Transform);

  function defaultItemCreate() {
    return vegaDataflow.ingest({});
  }

  function isExit(t) {
    return t.exit;
  }

  prototype$1.transform = function(_, pulse) {
    var df = pulse.dataflow,
        out = pulse.fork(pulse.NO_SOURCE | pulse.NO_FIELDS),
        item = _.item || defaultItemCreate,
        key = _.key || vegaDataflow.tupleid,
        map = this.value;

    // prevent transient (e.g., hover) requests from
    // cascading across marks derived from marks
    if (vegaUtil.isArray(out.encode)) {
      out.encode = null;
    }

    if (map && (_.modified('key') || pulse.modified(key))) {
      vegaUtil.error('DataJoin does not support modified key function or fields.');
    }

    if (!map) {
      pulse = pulse.addAll();
      this.value = map = vegaUtil.fastmap().test(isExit);
      map.lookup = function(t) { return map.get(key(t)); };
    }

    pulse.visit(pulse.ADD, function(t) {
      var k = key(t),
          x = map.get(k);

      if (x) {
        if (x.exit) {
          map.empty--;
          out.add.push(x);
        } else {
          out.mod.push(x);
        }
      } else {
        map.set(k, (x = item(t)));
        out.add.push(x);
      }

      x.datum = t;
      x.exit = false;
    });

    pulse.visit(pulse.MOD, function(t) {
      var k = key(t),
          x = map.get(k);

      if (x) {
        x.datum = t;
        out.mod.push(x);
      }
    });

    pulse.visit(pulse.REM, function(t) {
      var k = key(t),
          x = map.get(k);

      if (t === x.datum && !x.exit) {
        out.rem.push(x);
        x.exit = true;
        ++map.empty;
      }
    });

    if (pulse.changed(pulse.ADD_MOD)) out.modifies('datum');

    if (_.clean && map.empty > df.cleanThreshold) df.runAfter(map.clean);

    return out;
  };

  /**
   * Invokes encoding functions for visual items.
   * @constructor
   * @param {object} params - The parameters to the encoding functions. This
   *   parameter object will be passed through to all invoked encoding functions.
   * @param {object} param.encoders - The encoding functions
   * @param {function(object, object): boolean} [param.encoders.update] - Update encoding set
   * @param {function(object, object): boolean} [param.encoders.enter] - Enter encoding set
   * @param {function(object, object): boolean} [param.encoders.exit] - Exit encoding set
   */
  function Encode(params) {
    vegaDataflow.Transform.call(this, null, params);
  }

  var prototype$2 = vegaUtil.inherits(Encode, vegaDataflow.Transform);

  prototype$2.transform = function(_, pulse) {
    var out = pulse.fork(pulse.ADD_REM),
        encoders = _.encoders,
        encode = pulse.encode;

    // if an array, the encode directive includes additional sets
    // that must be defined in order for the primary set to be invoked
    // e.g., only run the update set if the hover set is defined
    if (vegaUtil.isArray(encode)) {
      if (out.changed() || encode.every(function(e) { return encoders[e]; })) {
        encode = encode[0];
        out.encode = null; // consume targeted encode directive
      } else {
        return pulse.StopPropagation;
      }
    }

    // marshall encoder functions
    var reenter = encode === 'enter',
        update = encoders.update || vegaUtil.falsy,
        enter = encoders.enter || vegaUtil.falsy,
        exit = encoders.exit || vegaUtil.falsy,
        set = (encode && !reenter ? encoders[encode] : update) || vegaUtil.falsy;

    if (pulse.changed(pulse.ADD)) {
      pulse.visit(pulse.ADD, function(t) {
        enter(t, _);
        update(t, _);
        if (set !== vegaUtil.falsy && set !== update) set(t, _);
      });
      out.modifies(enter.output);
      out.modifies(update.output);
      if (set !== vegaUtil.falsy && set !== update) out.modifies(set.output);
    }

    if (pulse.changed(pulse.REM) && exit !== vegaUtil.falsy) {
      pulse.visit(pulse.REM, function(t) { exit(t, _); });
      out.modifies(exit.output);
    }

    if (reenter || set !== vegaUtil.falsy) {
      var flag = pulse.MOD | (_.modified() ? pulse.REFLOW : 0);
      if (reenter) {
        pulse.visit(flag, function(t) {
          var mod = enter(t, _);
          if (set(t, _) || mod) out.mod.push(t);
        });
        if (out.mod.length) out.modifies(enter.output);
      } else {
        pulse.visit(flag, function(t) {
          if (set(t, _)) out.mod.push(t);
        });
      }
      if (out.mod.length) out.modifies(set.output);
    }

    return out.changed() ? out : pulse.StopPropagation;
  };

  var Symbols  = 'symbol';
  var Discrete = 'discrete';
  var Gradient = 'gradient';

  var symbols = {};
  symbols[Quantile] = quantileSymbols;
  symbols[Quantize] = quantizeSymbols;
  symbols[Threshold] = thresholdSymbols;
  symbols[BinLinear] = symbols[BinOrdinal] = binSymbols;

  function labelValues(scale, count) {
    var values = symbols[scale.type];
    return values ? values(scale) : tickValues(scale, count);
  }

  function quantizeSymbols(scale) {
    var domain = scale.domain(),
        x0 = domain[0],
        x1 = vegaUtil.peek(domain),
        n = scale.range().length,
        values = new Array(n),
        i = 0;

    values[0] = -Infinity;
    while (++i < n) values[i] = (i * x1 - (i - n) * x0) / n;
    values.max = +Infinity;

    return values;
  }

  function quantileSymbols(scale) {
    var values = [-Infinity].concat(scale.quantiles());
    values.max = +Infinity;

    return values;
  }

  function thresholdSymbols(scale) {
    var values = [-Infinity].concat(scale.domain());
    values.max = +Infinity;

    return values;
  }

  function binSymbols(scale) {
    var values = scale.domain();
    values.max = values.pop();

    return values;
  }

  function labelFormat(scale, format, type) {
    return type === Symbols && symbols[scale.type] ? formatRange(format)
      : type === Discrete ? formatDiscrete(format)
      : formatPoint(format);
  }

  function formatRange(format) {
    return function(value, index, array) {
      var limit = array[index + 1] || array.max || +Infinity,
          lo = formatValue(value, format),
          hi = formatValue(limit, format);
      return lo && hi ? lo + '\u2013' + hi : hi ? '< ' + hi : '\u2265 ' + lo;
    };
  }

  function formatDiscrete(format) {
    return function(value, index) {
      return index ? format(value) : null;
    }
  }

  function formatPoint(format) {
    return function(value) {
      return format(value);
    };
  }

  function formatValue(value, format) {
    return isFinite(value) ? format(value) : null;
  }

  function labelFraction(scale) {
    var domain = scale.domain(),
        count = domain.length - 1,
        lo = +domain[0],
        hi = +vegaUtil.peek(domain),
        span = hi - lo;

    if (scale.type === Threshold) {
      var adjust = count ? span / count : 0.1;
      lo -= adjust;
      hi += adjust;
      span = hi - lo;
    }

    return function(value) {
      return (value - lo) / span;
    };
  }

  /**
   * Generates legend entries for visualizing a scale.
   * @constructor
   * @param {object} params - The parameters for this operator.
   * @param {Scale} params.scale - The scale to generate items for.
   * @param {*} [params.count=5] - The approximate number of items, or
   *   desired tick interval, to use.
   * @param {Array<*>} [params.values] - The exact tick values to use.
   *   These must be legal domain values for the provided scale.
   *   If provided, the count argument is ignored.
   * @param {string} [params.formatSpecifier] - A format specifier
   *   to use in conjunction with scale.tickFormat. Legal values are
   *   any valid D3 format specifier string.
   * @param {function(*):string} [params.format] - The format function to use.
   *   If provided, the formatSpecifier argument is ignored.
   */
  function LegendEntries(params) {
    vegaDataflow.Transform.call(this, [], params);
  }

  var prototype$3 = vegaUtil.inherits(LegendEntries, vegaDataflow.Transform);

  prototype$3.transform = function(_, pulse) {
    if (this.value != null && !_.modified()) {
      return pulse.StopPropagation;
    }

    var out = pulse.fork(pulse.NO_SOURCE | pulse.NO_FIELDS),
        items = this.value,
        type  = _.type || Symbols,
        scale = _.scale,
        count = _.count == null ? 5 : tickCount(scale, _.count),
        format = _.format || tickFormat(scale, count, _.formatSpecifier),
        values = _.values || labelValues(scale, count, type),
        domain, fraction, size, offset;

    format = labelFormat(scale, format, type);
    if (items) out.rem = items;

    if (type === Symbols) {
      if (vegaUtil.isFunction(size = _.size)) {
        // if first value maps to size zero, remove from list (vega#717)
        if (!_.values && scale(values[0]) === 0) {
          values = values.slice(1);
        }
        // compute size offset for legend entries
        offset = values.reduce(function(max, value) {
          return Math.max(max, size(value, _));
        }, 0);
      } else {
        size = vegaUtil.constant(offset = size || 8);
      }

      items = values.map(function(value, index) {
        return vegaDataflow.ingest({
          index:  index,
          label:  format(value, index, values),
          value:  value,
          offset: offset,
          size:   size(value, _)
        });
      });
    }

    else if (type === Gradient) {
      domain = scale.domain(),
      fraction = vegaScale.scaleFraction(scale, domain[0], vegaUtil.peek(domain));

      // if automatic label generation produces 2 or fewer values,
      // use the domain end points instead (fixes vega/vega#1364)
      if (values.length < 3 && !_.values && domain[0] !== vegaUtil.peek(domain)) {
        values = [domain[0], vegaUtil.peek(domain)];
      }

      items = values.map(function(value, index) {
        return vegaDataflow.ingest({
          index: index,
          label: format(value, index, values),
          value: value,
          perc:  fraction(value)
        });
      });
    }

    else {
      size = values.length - 1;
      fraction = labelFraction(scale);

      items = values.map(function(value, index) {
        return vegaDataflow.ingest({
          index: index,
          label: format(value, index, values),
          value: value,
          perc:  index ? fraction(value) : 0,
          perc2: index === size ? 1 : fraction(values[index+1])
        });
      });
    }

    out.source = items;
    out.add = items;
    this.value = items;

    return out;
  };

  var Paths = vegaUtil.fastmap({
    'line': line,
    'line-radial': lineR,
    'arc': arc,
    'arc-radial': arcR,
    'curve': curve,
    'curve-radial': curveR,
    'orthogonal-horizontal': orthoX,
    'orthogonal-vertical': orthoY,
    'orthogonal-radial': orthoR,
    'diagonal-horizontal': diagonalX,
    'diagonal-vertical': diagonalY,
    'diagonal-radial': diagonalR
  });

  function sourceX(t) { return t.source.x; }
  function sourceY(t) { return t.source.y; }
  function targetX(t) { return t.target.x; }
  function targetY(t) { return t.target.y; }

   /**
    * Layout paths linking source and target elements.
    * @constructor
    * @param {object} params - The parameters for this operator.
    */
  function LinkPath(params) {
    vegaDataflow.Transform.call(this, {}, params);
  }

  LinkPath.Definition = {
    "type": "LinkPath",
    "metadata": {"modifies": true},
    "params": [
      { "name": "sourceX", "type": "field", "default": "source.x" },
      { "name": "sourceY", "type": "field", "default": "source.y" },
      { "name": "targetX", "type": "field", "default": "target.x" },
      { "name": "targetY", "type": "field", "default": "target.y" },
      { "name": "orient", "type": "enum", "default": "vertical",
        "values": ["horizontal", "vertical", "radial"] },
      { "name": "shape", "type": "enum", "default": "line",
        "values": ["line", "arc", "curve", "diagonal", "orthogonal"] },
      { "name": "require", "type": "signal" },
      { "name": "as", "type": "string", "default": "path" }
    ]
  };

  var prototype$4 = vegaUtil.inherits(LinkPath, vegaDataflow.Transform);

  prototype$4.transform = function(_, pulse) {
    var sx = _.sourceX || sourceX,
        sy = _.sourceY || sourceY,
        tx = _.targetX || targetX,
        ty = _.targetY || targetY,
        as = _.as || 'path',
        orient = _.orient || 'vertical',
        shape = _.shape || 'line',
        path = Paths.get(shape + '-' + orient) || Paths.get(shape);

    if (!path) {
      vegaUtil.error('LinkPath unsupported type: ' + _.shape
        + (_.orient ? '-' + _.orient : ''));
    }

    pulse.visit(pulse.SOURCE, function(t) {
      t[as] = path(sx(t), sy(t), tx(t), ty(t));
    });

    return pulse.reflow(_.modified()).modifies(as);
  };

  // -- Link Path Generation Methods -----

  function line(sx, sy, tx, ty) {
    return 'M' + sx + ',' + sy +
           'L' + tx + ',' + ty;
  }

  function lineR(sa, sr, ta, tr) {
    return line(
      sr * Math.cos(sa), sr * Math.sin(sa),
      tr * Math.cos(ta), tr * Math.sin(ta)
    );
  }

  function arc(sx, sy, tx, ty) {
    var dx = tx - sx,
        dy = ty - sy,
        rr = Math.sqrt(dx * dx + dy * dy) / 2,
        ra = 180 * Math.atan2(dy, dx) / Math.PI;
    return 'M' + sx + ',' + sy +
           'A' + rr + ',' + rr +
           ' ' + ra + ' 0 1' +
           ' ' + tx + ',' + ty;
  }

  function arcR(sa, sr, ta, tr) {
    return arc(
      sr * Math.cos(sa), sr * Math.sin(sa),
      tr * Math.cos(ta), tr * Math.sin(ta)
    );
  }

  function curve(sx, sy, tx, ty) {
    var dx = tx - sx,
        dy = ty - sy,
        ix = 0.2 * (dx + dy),
        iy = 0.2 * (dy - dx);
    return 'M' + sx + ',' + sy +
           'C' + (sx+ix) + ',' + (sy+iy) +
           ' ' + (tx+iy) + ',' + (ty-ix) +
           ' ' + tx + ',' + ty;
  }

  function curveR(sa, sr, ta, tr) {
    return curve(
      sr * Math.cos(sa), sr * Math.sin(sa),
      tr * Math.cos(ta), tr * Math.sin(ta)
    );
  }

  function orthoX(sx, sy, tx, ty) {
    return 'M' + sx + ',' + sy +
           'V' + ty + 'H' + tx;
  }

  function orthoY(sx, sy, tx, ty) {
    return 'M' + sx + ',' + sy +
           'H' + tx + 'V' + ty;
  }

  function orthoR(sa, sr, ta, tr) {
    var sc = Math.cos(sa),
        ss = Math.sin(sa),
        tc = Math.cos(ta),
        ts = Math.sin(ta),
        sf = Math.abs(ta - sa) > Math.PI ? ta <= sa : ta > sa;
    return 'M' + (sr*sc) + ',' + (sr*ss) +
           'A' + sr + ',' + sr + ' 0 0,' + (sf?1:0) +
           ' ' + (sr*tc) + ',' + (sr*ts) +
           'L' + (tr*tc) + ',' + (tr*ts);
  }

  function diagonalX(sx, sy, tx, ty) {
    var m = (sx + tx) / 2;
    return 'M' + sx + ',' + sy +
           'C' + m  + ',' + sy +
           ' ' + m  + ',' + ty +
           ' ' + tx + ',' + ty;
  }

  function diagonalY(sx, sy, tx, ty) {
    var m = (sy + ty) / 2;
    return 'M' + sx + ',' + sy +
           'C' + sx + ',' + m +
           ' ' + tx + ',' + m +
           ' ' + tx + ',' + ty;
  }

  function diagonalR(sa, sr, ta, tr) {
    var sc = Math.cos(sa),
        ss = Math.sin(sa),
        tc = Math.cos(ta),
        ts = Math.sin(ta),
        mr = (sr + tr) / 2;
    return 'M' + (sr*sc) + ',' + (sr*ss) +
           'C' + (mr*sc) + ',' + (mr*ss) +
           ' ' + (mr*tc) + ',' + (mr*ts) +
           ' ' + (tr*tc) + ',' + (tr*ts);
  }

  /**
   * Pie and donut chart layout.
   * @constructor
   * @param {object} params - The parameters for this operator.
   * @param {function(object): *} params.field - The value field to size pie segments.
   * @param {number} [params.startAngle=0] - The start angle (in radians) of the layout.
   * @param {number} [params.endAngle=2π] - The end angle (in radians) of the layout.
   * @param {boolean} [params.sort] - Boolean flag for sorting sectors by value.
   */
  function Pie(params) {
    vegaDataflow.Transform.call(this, null, params);
  }

  Pie.Definition = {
    "type": "Pie",
    "metadata": {"modifies": true},
    "params": [
      { "name": "field", "type": "field" },
      { "name": "startAngle", "type": "number", "default": 0 },
      { "name": "endAngle", "type": "number", "default": 6.283185307179586 },
      { "name": "sort", "type": "boolean", "default": false },
      { "name": "as", "type": "string", "array": true, "length": 2, "default": ["startAngle", "endAngle"] }
    ]
  };

  var prototype$5 = vegaUtil.inherits(Pie, vegaDataflow.Transform);

  prototype$5.transform = function(_, pulse) {
    var as = _.as || ['startAngle', 'endAngle'],
        startAngle = as[0],
        endAngle = as[1],
        field = _.field || vegaUtil.one,
        start = _.startAngle || 0,
        stop = _.endAngle != null ? _.endAngle : 2 * Math.PI,
        data = pulse.source,
        values = data.map(field),
        n = values.length,
        a = start,
        k = (stop - start) / d3Array.sum(values),
        index = d3Array.range(n),
        i, t, v;

    if (_.sort) {
      index.sort(function(a, b) {
        return values[a] - values[b];
      });
    }

    for (i=0; i<n; ++i) {
      v = values[index[i]];
      t = data[index[i]];
      t[startAngle] = a;
      t[endAngle] = (a += v * k);
    }

    this.value = values;
    return pulse.reflow(_.modified()).modifies(as);
  };

  var DEFAULT_COUNT = 5;

  var INCLUDE_ZERO = vegaUtil.toSet([Linear, Pow, Sqrt]);

  var INCLUDE_PAD = vegaUtil.toSet([Linear, Log, Pow, Sqrt, Time, Utc]);

  var SKIP = vegaUtil.toSet([
    'set', 'modified', 'clear', 'type', 'scheme', 'schemeExtent', 'schemeCount',
    'domain', 'domainMin', 'domainMid', 'domainMax', 'domainRaw', 'domainImplicit', 'nice', 'zero',
    'range', 'rangeStep', 'round', 'reverse', 'interpolate', 'interpolateGamma'
  ]);

  /**
   * Maintains a scale function mapping data values to visual channels.
   * @constructor
   * @param {object} params - The parameters for this operator.
   */
  function Scale(params) {
    vegaDataflow.Transform.call(this, null, params);
    this.modified(true); // always treat as modified
  }

  var prototype$6 = vegaUtil.inherits(Scale, vegaDataflow.Transform);

  prototype$6.transform = function(_, pulse) {
    var df = pulse.dataflow,
        scale = this.value,
        prop;

    if (!scale || _.modified('type')) {
      this.value = scale = vegaScale.scale((_.type || Linear).toLowerCase())();
    }

    for (prop in _) if (!SKIP[prop]) {
      // padding is a scale property for band/point but not others
      if (prop === 'padding' && INCLUDE_PAD[scale.type]) continue;
      // invoke scale property setter, raise warning if not found
      vegaUtil.isFunction(scale[prop])
        ? scale[prop](_[prop])
        : df.warn('Unsupported scale property: ' + prop);
    }

    configureRange(scale, _, configureDomain(scale, _, df));

    return pulse.fork(pulse.NO_SOURCE | pulse.NO_FIELDS);
  };

  function configureDomain(scale, _, df) {
    // check raw domain, if provided use that and exit early
    var raw = rawDomain(scale, _.domainRaw, df);
    if (raw > -1) return raw;

    var domain = _.domain,
        type = scale.type,
        zero = _.zero || (_.zero === undefined && INCLUDE_ZERO[type]),
        n, mid;

    if (!domain) return 0;

    // adjust continuous domain for minimum pixel padding
    if (INCLUDE_PAD[type] && _.padding && domain[0] !== vegaUtil.peek(domain)) {
      domain = padDomain(type, domain, _.range, _.padding, _.exponent);
    }

    // adjust domain based on zero, min, max settings
    if (zero || _.domainMin != null || _.domainMax != null || _.domainMid != null) {
      n = ((domain = domain.slice()).length - 1) || 1;
      if (zero) {
        if (domain[0] > 0) domain[0] = 0;
        if (domain[n] < 0) domain[n] = 0;
      }
      if (_.domainMin != null) domain[0] = _.domainMin;
      if (_.domainMax != null) domain[n] = _.domainMax;

      if (_.domainMid != null) {
        mid = _.domainMid;
        if (mid < domain[0] || mid > domain[n]) {
          df.warn('Scale domainMid exceeds domain min or max.', mid);
        }
        domain.splice(n, 0, mid);
      }
    }

    // set the scale domain
    scale.domain(domainCheck(type, domain, df));

    // if ordinal scale domain is defined, prevent implicit
    // domain construction as side-effect of scale lookup
    if (type === Ordinal) {
      scale.unknown(_.domainImplicit ? vegaScale.scaleImplicit : undefined);
    }

    // perform 'nice' adjustment as requested
    if (_.nice && scale.nice) {
      scale.nice((_.nice !== true && tickCount(scale, _.nice)) || null);
    }

    // return the cardinality of the domain
    return domain.length;
  }

  function rawDomain(scale, raw, df) {
    if (raw) {
      scale.domain(domainCheck(scale.type, raw, df));
      return raw.length;
    } else {
      return -1;
    }
  }

  function padDomain(type, domain, range, pad, exponent) {
    var span = Math.abs(vegaUtil.peek(range) - range[0]),
        frac = span / (span - 2 * pad),
        d = type === Log  ? vegaUtil.zoomLog(domain, null, frac)
          : type === Sqrt ? vegaUtil.zoomPow(domain, null, frac, 0.5)
          : type === Pow  ? vegaUtil.zoomPow(domain, null, frac, exponent)
          : vegaUtil.zoomLinear(domain, null, frac);

    domain = domain.slice();
    domain[0] = d[0];
    domain[domain.length-1] = d[1];
    return domain;
  }

  function domainCheck(type, domain, df) {
    if (type === Log) {
      // sum signs of domain values
      // if all pos or all neg, abs(sum) === domain.length
      var s = Math.abs(domain.reduce(function(s, v) {
        return s + (v < 0 ? -1 : v > 0 ? 1 : 0);
      }, 0));

      if (s !== domain.length) {
        df.warn('Log scale domain includes zero: ' + vegaUtil.stringValue(domain));
      }
    }
    return domain;
  }

  function configureRange(scale, _, count) {
    var round = _.round || false,
        range = _.range;

    // if range step specified, calculate full range extent
    if (_.rangeStep != null) {
      range = configureRangeStep(scale.type, _, count);
    }

    // else if a range scheme is defined, use that
    else if (_.scheme) {
      range = configureScheme(scale.type, _, count);
      if (vegaUtil.isFunction(range)) return scale.interpolator(range);
    }

    // given a range array for a sequential scale, convert to interpolator
    else if (range && scale.type === Sequential) {
      return scale.interpolator(d3Interpolate.interpolateRgbBasis(flip(range, _.reverse)));
    }

    // configure rounding / interpolation
    if (range && _.interpolate && scale.interpolate) {
      scale.interpolate(vegaScale.interpolate(_.interpolate, _.interpolateGamma));
    } else if (vegaUtil.isFunction(scale.round)) {
      scale.round(round);
    } else if (vegaUtil.isFunction(scale.rangeRound)) {
      scale.interpolate(round ? d3Interpolate.interpolateRound : d3Interpolate.interpolate);
    }

    if (range) scale.range(flip(range, _.reverse));
  }

  function configureRangeStep(type, _, count) {
    if (type !== Band && type !== Point) {
      vegaUtil.error('Only band and point scales support rangeStep.');
    }

    // calculate full range based on requested step size and padding
    var outer = (_.paddingOuter != null ? _.paddingOuter : _.padding) || 0,
        inner = type === Point ? 1
              : ((_.paddingInner != null ? _.paddingInner : _.padding) || 0);
    return [0, _.rangeStep * vegaScale.bandSpace(count, inner, outer)];
  }

  function configureScheme(type, _, count) {
    var name = _.scheme.toLowerCase(),
        scheme = vegaScale.scheme(name),
        extent = _.schemeExtent,
        discrete;

    if (!scheme) {
      vegaUtil.error('Unrecognized scheme name: ' + _.scheme);
    }

    // determine size for potential discrete range
    count = (type === Threshold) ? count + 1
      : (type === BinOrdinal) ? count - 1
      : (type === Quantile || type === Quantize) ? (+_.schemeCount || DEFAULT_COUNT)
      : count;

    // adjust and/or quantize scheme as appropriate
    return type === Sequential ? adjustScheme(scheme, extent, _.reverse)
      : !extent && (discrete = vegaScale.scheme(name + '-' + count)) ? discrete
      : vegaUtil.isFunction(scheme) ? quantize(adjustScheme(scheme, extent), count)
      : type === Ordinal ? scheme : scheme.slice(0, count);
  }

  function adjustScheme(scheme, extent, reverse) {
    return (vegaUtil.isFunction(scheme) && (extent || reverse))
      ? vegaScale.interpolateRange(scheme, flip(extent || [0, 1], reverse))
      : scheme;
  }

  function flip(array, reverse) {
    return reverse ? array.slice().reverse() : array;
  }

  function quantize(interpolator, count) {
    var samples = new Array(count),
        n = count + 1;
    for (var i = 0; i < count;) samples[i] = interpolator(++i / n);
    return samples;
  }

  /**
   * Sorts scenegraph items in the pulse source array.
   * @constructor
   * @param {object} params - The parameters for this operator.
   * @param {function(*,*): number} [params.sort] - A comparator
   *   function for sorting tuples.
   */
  function SortItems(params) {
    vegaDataflow.Transform.call(this, null, params);
  }

  var prototype$7 = vegaUtil.inherits(SortItems, vegaDataflow.Transform);

  prototype$7.transform = function(_, pulse) {
    var mod = _.modified('sort')
           || pulse.changed(pulse.ADD)
           || pulse.modified(_.sort.fields)
           || pulse.modified('datum');

    if (mod) pulse.source.sort(_.sort);

    this.modified(mod);
    return pulse;
  };

  var Zero = 'zero',
      Center = 'center',
      Normalize = 'normalize',
      DefOutput = ['y0', 'y1'];

  /**
   * Stack layout for visualization elements.
   * @constructor
   * @param {object} params - The parameters for this operator.
   * @param {function(object): *} params.field - The value field to stack.
   * @param {Array<function(object): *>} [params.groupby] - An array of accessors to groupby.
   * @param {function(object,object): number} [params.sort] - A comparator for stack sorting.
   * @param {string} [offset='zero'] - One of 'zero', 'center', 'normalize'.
   */
  function Stack(params) {
    vegaDataflow.Transform.call(this, null, params);
  }

  Stack.Definition = {
    "type": "Stack",
    "metadata": {"modifies": true},
    "params": [
      { "name": "field", "type": "field" },
      { "name": "groupby", "type": "field", "array": true },
      { "name": "sort", "type": "compare" },
      { "name": "offset", "type": "enum", "default": Zero, "values": [Zero, Center, Normalize] },
      { "name": "as", "type": "string", "array": true, "length": 2, "default": DefOutput }
    ]
  };

  var prototype$8 = vegaUtil.inherits(Stack, vegaDataflow.Transform);

  prototype$8.transform = function(_, pulse) {
    var as = _.as || DefOutput,
        y0 = as[0],
        y1 = as[1],
        field = _.field || vegaUtil.one,
        stack = _.offset === Center ? stackCenter
              : _.offset === Normalize ? stackNormalize
              : stackZero,
        groups, i, n, max;

    // partition, sum, and sort the stack groups
    groups = partition(pulse.source, _.groupby, _.sort, field);

    // compute stack layouts per group
    for (i=0, n=groups.length, max=groups.max; i<n; ++i) {
      stack(groups[i], max, field, y0, y1);
    }

    return pulse.reflow(_.modified()).modifies(as);
  };

  function stackCenter(group, max, field, y0, y1) {
    var last = (max - group.sum) / 2,
        m = group.length,
        j = 0, t;

    for (; j<m; ++j) {
      t = group[j];
      t[y0] = last;
      t[y1] = (last += Math.abs(field(t)));
    }
  }

  function stackNormalize(group, max, field, y0, y1) {
    var scale = 1 / group.sum,
        last = 0,
        m = group.length,
        j = 0, v = 0, t;

    for (; j<m; ++j) {
      t = group[j];
      t[y0] = last;
      t[y1] = last = scale * (v += Math.abs(field(t)));
    }
  }

  function stackZero(group, max, field, y0, y1) {
    var lastPos = 0,
        lastNeg = 0,
        m = group.length,
        j = 0, v, t;

    for (; j<m; ++j) {
      t = group[j];
      v = field(t);
      if (v < 0) {
        t[y0] = lastNeg;
        t[y1] = (lastNeg += v);
      } else {
        t[y0] = lastPos;
        t[y1] = (lastPos += v);
      }
    }
  }

  function partition(data, groupby, sort, field) {
    var groups = [],
        get = function(f) { return f(t); },
        map, i, n, m, t, k, g, s, max;

    // partition data points into stack groups
    if (groupby == null) {
      groups.push(data.slice());
    } else {
      for (map={}, i=0, n=data.length; i<n; ++i) {
        t = data[i];
        k = groupby.map(get);
        g = map[k];
        if (!g) {
          map[k] = (g = []);
          groups.push(g);
        }
        g.push(t);
      }
    }

    // compute sums of groups, sort groups as needed
    for (k=0, max=0, m=groups.length; k<m; ++k) {
      g = groups[k];
      for (i=0, s=0, n=g.length; i<n; ++i) {
        s += Math.abs(field(g[i]));
      }
      g.sum = s;
      if (s > max) max = s;
      if (sort) g.sort(sort);
    }
    groups.max = max;

    return groups;
  }

  exports.axisticks = AxisTicks;
  exports.datajoin = DataJoin;
  exports.encode = Encode;
  exports.legendentries = LegendEntries;
  exports.linkpath = LinkPath;
  exports.pie = Pie;
  exports.scale = Scale;
  exports.sortitems = SortItems;
  exports.stack = Stack;
  exports.validTicks = validTicks;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
