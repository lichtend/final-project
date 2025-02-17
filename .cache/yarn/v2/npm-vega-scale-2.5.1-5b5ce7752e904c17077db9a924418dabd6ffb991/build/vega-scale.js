(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array'), require('d3-scale-chromatic'), require('d3-interpolate'), require('vega-util'), require('d3-time'), require('d3-scale')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-array', 'd3-scale-chromatic', 'd3-interpolate', 'vega-util', 'd3-time', 'd3-scale'], factory) :
  (factory((global.vega = {}),global.d3,global.d3,global.d3,global.vega,global.d3,global.d3));
}(this, (function (exports,d3Array,_,$,vegaUtil,d3Time,$$1) { 'use strict';

  function bandSpace(count, paddingInner, paddingOuter) {
    var space = count - paddingInner + paddingOuter * 2;
    return count ? (space > 0 ? space : 1) : 0;
  }

  function invertRange(scale) {
    return function(_$$1) {
      var lo = _$$1[0],
          hi = _$$1[1],
          t;

      if (hi < lo) {
        t = lo;
        lo = hi;
        hi = t;
      }

      return [
        scale.invert(lo),
        scale.invert(hi)
      ];
    }
  }

  function invertRangeExtent(scale) {
    return function(_$$1) {
      var range = scale.range(),
          lo = _$$1[0],
          hi = _$$1[1],
          min = -1, max, t, i, n;

      if (hi < lo) {
        t = lo;
        lo = hi;
        hi = t;
      }

      for (i=0, n=range.length; i<n; ++i) {
        if (range[i] >= lo && range[i] <= hi) {
          if (min < 0) min = i;
          max = i;
        }
      }

      if (min < 0) return undefined;

      lo = scale.invertExtent(range[min]);
      hi = scale.invertExtent(range[max]);

      return [
        lo[0] === undefined ? lo[1] : lo[0],
        hi[1] === undefined ? hi[0] : hi[1]
      ];
    }
  }

  function band() {
    var scale = $$1.scaleOrdinal().unknown(undefined),
        domain = scale.domain,
        ordinalRange = scale.range,
        range = [0, 1],
        step,
        bandwidth,
        round = false,
        paddingInner = 0,
        paddingOuter = 0,
        align = 0.5;

    delete scale.unknown;

    function rescale() {
      var n = domain().length,
          reverse = range[1] < range[0],
          start = range[reverse - 0],
          stop = range[1 - reverse],
          space = bandSpace(n, paddingInner, paddingOuter);

      step = (stop - start) / (space || 1);
      if (round) {
        step = Math.floor(step);
      }
      start += (stop - start - step * (n - paddingInner)) * align;
      bandwidth = step * (1 - paddingInner);
      if (round) {
        start = Math.round(start);
        bandwidth = Math.round(bandwidth);
      }
      var values = d3Array.range(n).map(function(i) { return start + step * i; });
      return ordinalRange(reverse ? values.reverse() : values);
    }

    scale.domain = function(_$$1) {
      if (arguments.length) {
        domain(_$$1);
        return rescale();
      } else {
        return domain();
      }
    };

    scale.range = function(_$$1) {
      if (arguments.length) {
        range = [+_$$1[0], +_$$1[1]];
        return rescale();
      } else {
        return range.slice();
      }
    };

    scale.rangeRound = function(_$$1) {
      range = [+_$$1[0], +_$$1[1]];
      round = true;
      return rescale();
    };

    scale.bandwidth = function() {
      return bandwidth;
    };

    scale.step = function() {
      return step;
    };

    scale.round = function(_$$1) {
      if (arguments.length) {
        round = !!_$$1;
        return rescale();
      } else {
        return round;
      }
    };

    scale.padding = function(_$$1) {
      if (arguments.length) {
        paddingOuter = Math.max(0, Math.min(1, _$$1));
        paddingInner = paddingOuter;
        return rescale();
      } else {
        return paddingInner;
      }
    };

    scale.paddingInner = function(_$$1) {
      if (arguments.length) {
        paddingInner = Math.max(0, Math.min(1, _$$1));
        return rescale();
      } else {
        return paddingInner;
      }
    };

    scale.paddingOuter = function(_$$1) {
      if (arguments.length) {
        paddingOuter = Math.max(0, Math.min(1, _$$1));
        return rescale();
      } else {
        return paddingOuter;
      }
    };

    scale.align = function(_$$1) {
      if (arguments.length) {
        align = Math.max(0, Math.min(1, _$$1));
        return rescale();
      } else {
        return align;
      }
    };

    scale.invertRange = function(_$$1) {
      // bail if range has null or undefined values
      if (_$$1[0] == null || _$$1[1] == null) return;

      var lo = +_$$1[0],
          hi = +_$$1[1],
          reverse = range[1] < range[0],
          values = reverse ? ordinalRange().reverse() : ordinalRange(),
          n = values.length - 1, a, b, t;

      // bail if either range endpoint is invalid
      if (lo !== lo || hi !== hi) return;

      // order range inputs, bail if outside of scale range
      if (hi < lo) {
        t = lo;
        lo = hi;
        hi = t;
      }
      if (hi < values[0] || lo > range[1-reverse]) return;

      // binary search to index into scale range
      a = Math.max(0, d3Array.bisectRight(values, lo) - 1);
      b = lo===hi ? a : d3Array.bisectRight(values, hi) - 1;

      // increment index a if lo is within padding gap
      if (lo - values[a] > bandwidth + 1e-10) ++a;

      if (reverse) {
        // map + swap
        t = a;
        a = n - b;
        b = n - t;
      }
      return (a > b) ? undefined : domain().slice(a, b+1);
    };

    scale.invert = function(_$$1) {
      var value = scale.invertRange([_$$1, _$$1]);
      return value ? value[0] : value;
    };

    scale.copy = function() {
      return band()
          .domain(domain())
          .range(range)
          .round(round)
          .paddingInner(paddingInner)
          .paddingOuter(paddingOuter)
          .align(align);
    };

    return rescale();
  }

  function pointish(scale) {
    var copy = scale.copy;

    scale.padding = scale.paddingOuter;
    delete scale.paddingInner;

    scale.copy = function() {
      return pointish(copy());
    };

    return scale;
  }

  function point() {
    return pointish(band().paddingInner(1));
  }

  var map = Array.prototype.map,
      slice = Array.prototype.slice;

  function numbers(_$$1) {
    return map.call(_$$1, function(x) { return +x; });
  }

  function binLinear() {
    var linear = $$1.scaleLinear(),
        domain = [];

    function scale(x) {
      return linear(x);
    }

    function setDomain(_$$1) {
      domain = numbers(_$$1);
      linear.domain([domain[0], vegaUtil.peek(domain)]);
    }

    scale.domain = function(_$$1) {
      return arguments.length ? (setDomain(_$$1), scale) : domain.slice();
    };

    scale.range = function(_$$1) {
      return arguments.length ? (linear.range(_$$1), scale) : linear.range();
    };

    scale.rangeRound = function(_$$1) {
      return arguments.length ? (linear.rangeRound(_$$1), scale) : linear.rangeRound();
    };

    scale.interpolate = function(_$$1) {
      return arguments.length ? (linear.interpolate(_$$1), scale) : linear.interpolate();
    };

    scale.invert = function(_$$1) {
      return linear.invert(_$$1);
    };

    scale.ticks = function(count) {
      var n = domain.length,
          stride = ~~(n / (count || n));

      return stride < 2
        ? scale.domain()
        : domain.filter(function(x, i) { return !(i % stride); });
    };

    scale.tickFormat = function() {
      return linear.tickFormat.apply(linear, arguments);
    };

    scale.copy = function() {
      return binLinear().domain(scale.domain()).range(scale.range());
    };

    return scale;
  }

  function binOrdinal() {
    var domain = [],
        range = [];

    function scale(x) {
      return x == null || x !== x
        ? undefined
        : range[(d3Array.bisect(domain, x) - 1) % range.length];
    }

    scale.domain = function(_$$1) {
      if (arguments.length) {
        domain = numbers(_$$1);
        return scale;
      } else {
        return domain.slice();
      }
    };

    scale.range = function(_$$1) {
      if (arguments.length) {
        range = slice.call(_$$1);
        return scale;
      } else {
        return range.slice();
      }
    };

    // Addresses #1395, refine if/when d3-scale tickFormat is exposed
    scale.tickFormat = function() {
      var linear = $$1.scaleLinear().domain([domain[0], vegaUtil.peek(domain)]);
      return linear.tickFormat.apply(linear, arguments);
    };

    scale.copy = function() {
      return binOrdinal().domain(scale.domain()).range(scale.range());
    };

    return scale;
  }

  function sequential(interpolator) {
    var linear = $$1.scaleLinear(),
        x0 = 0,
        dx = 1,
        clamp = false;

    function update() {
      var domain = linear.domain();
      x0 = domain[0];
      dx = vegaUtil.peek(domain) - x0;
    }

    function scale(x) {
      var t = (x - x0) / dx;
      return interpolator(clamp ? Math.max(0, Math.min(1, t)) : t);
    }

    scale.clamp = function(_$$1) {
      if (arguments.length) {
        clamp = !!_$$1;
        return scale;
      } else {
        return clamp;
      }
    };

    scale.domain = function(_$$1) {
      return arguments.length ? (linear.domain(_$$1), update(), scale) : linear.domain();
    };

    scale.interpolator = function(_$$1) {
      if (arguments.length) {
        interpolator = _$$1;
        return scale;
      } else {
        return interpolator;
      }
    };

    scale.copy = function() {
      return sequential().domain(linear.domain()).clamp(clamp).interpolator(interpolator);
    };

    scale.ticks = function(count) {
      return linear.ticks(count);
    };

    scale.tickFormat = function(count, specifier) {
      return linear.tickFormat(count, specifier);
    };

    scale.nice = function(count) {
      return linear.nice(count), update(), scale;
    };

    return scale;
  }

  /**
   * Augment scales with their type and needed inverse methods.
   */
  function create(type, constructor) {
    return function scale() {
      var s = constructor();

      if (!s.invertRange) {
        s.invertRange = s.invert ? invertRange(s)
          : s.invertExtent ? invertRangeExtent(s)
          : undefined;
      }

      s.type = type;
      return s;
    };
  }

  function scale(type, scale) {
    if (arguments.length > 1) {
      scales[type] = create(type, scale);
      return this;
    } else {
      return scales.hasOwnProperty(type) ? scales[type] : undefined;
    }
  }

  var scales = {
    // base scale types
    identity:      $$1.scaleIdentity,
    linear:        $$1.scaleLinear,
    log:           $$1.scaleLog,
    ordinal:       $$1.scaleOrdinal,
    pow:           $$1.scalePow,
    sqrt:          $$1.scaleSqrt,
    quantile:      $$1.scaleQuantile,
    quantize:      $$1.scaleQuantize,
    threshold:     $$1.scaleThreshold,
    time:          $$1.scaleTime,
    utc:           $$1.scaleUtc,

    // extended scale types
    band:          band,
    point:         point,
    sequential:    sequential,
    'bin-linear':  binLinear,
    'bin-ordinal': binOrdinal
  };

  for (var key in scales) {
    scale(key, scales[key]);
  }

  function interpolateRange(interpolator, range) {
    var start = range[0],
        span = vegaUtil.peek(range) - start;
    return function(i) { return interpolator(start + i * span); };
  }

  function scaleFraction(scale, min, max) {
    var delta = max - min;
    return !delta || !isFinite(delta) ? vegaUtil.constant(0)
      : scale.type === 'linear' || scale.type === 'sequential'
        ? function(_$$1) { return (_$$1 - min) / delta; }
        : scale.copy().domain([min, max]).range([0, 1]).interpolate(lerp);
  }

  function lerp(a, b) {
    var span = b - a;
    return function(i) { return a + i * span; }
  }

  function interpolate(type, gamma) {
    var interp = $[method(type)];
    return (gamma != null && interp && interp.gamma)
      ? interp.gamma(gamma)
      : interp;
  }

  function method(type) {
    return 'interpolate' + type.toLowerCase()
      .split('-')
      .map(function(s) { return s[0].toUpperCase() + s.slice(1); })
      .join('');
  }

  function colors(specifier) {
    var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
    while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
    return colors;
  }

  var category20 = colors(
    '1f77b4aec7e8ff7f0effbb782ca02c98df8ad62728ff98969467bdc5b0d58c564bc49c94e377c2f7b6d27f7f7fc7c7c7bcbd22dbdb8d17becf9edae5'
  );

  var category20b = colors(
    '393b795254a36b6ecf9c9ede6379398ca252b5cf6bcedb9c8c6d31bd9e39e7ba52e7cb94843c39ad494ad6616be7969c7b4173a55194ce6dbdde9ed6'
  );

  var category20c = colors(
    '3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9'
  );

  var tableau10 = colors(
    '4c78a8f58518e4575672b7b254a24beeca3bb279a2ff9da69d755dbab0ac'
  );

  var tableau20 = colors(
    '4c78a89ecae9f58518ffbf7954a24b88d27ab79a20f2cf5b43989483bcb6e45756ff9d9879706ebab0acd67195fcbfd2b279a2d6a5c99e765fd8b5a5'
  );

  var blueOrange = new Array(3).concat(
    "67a9cff7f7f7f1a340",
    "0571b092c5defdb863e66101",
    "0571b092c5def7f7f7fdb863e66101",
    "2166ac67a9cfd1e5f0fee0b6f1a340b35806",
    "2166ac67a9cfd1e5f0f7f7f7fee0b6f1a340b35806",
    "2166ac4393c392c5ded1e5f0fee0b6fdb863e08214b35806",
    "2166ac4393c392c5ded1e5f0f7f7f7fee0b6fdb863e08214b35806",
    "0530612166ac4393c392c5ded1e5f0fee0b6fdb863e08214b358067f3b08",
    "0530612166ac4393c392c5ded1e5f0f7f7f7fee0b6fdb863e08214b358067f3b08"
  ).map(colors);

  var discretized = {
    blueorange:  blueOrange
  };

  var schemes = {
    // d3 categorical palettes
    category10:  _.schemeCategory10,
    accent:      _.schemeAccent,
    dark2:       _.schemeDark2,
    paired:      _.schemePaired,
    pastel1:     _.schemePastel1,
    pastel2:     _.schemePastel2,
    set1:        _.schemeSet1,
    set2:        _.schemeSet2,
    set3:        _.schemeSet3,

    // additional categorical palettes
    category20:  category20,
    category20b: category20b,
    category20c: category20c,
    tableau10:   tableau10,
    tableau20:   tableau20,

    // sequential multi-hue interpolators
    viridis:     _.interpolateViridis,
    magma:       _.interpolateMagma,
    inferno:     _.interpolateInferno,
    plasma:      _.interpolatePlasma,

    // cyclic interpolators
    rainbow:     _.interpolateRainbow,
    sinebow:     _.interpolateSinebow,

    // extended interpolators
    blueorange:  $.interpolateRgbBasis(vegaUtil.peek(blueOrange))
  };

  function add(name, suffix) {
    schemes[name] = _['interpolate' + suffix];
    discretized[name] = _['scheme' + suffix];
  }

  // sequential single-hue
  add('blues',    'Blues');
  add('greens',   'Greens');
  add('greys',    'Greys');
  add('purples',  'Purples');
  add('reds',     'Reds');
  add('oranges',  'Oranges');

  // diverging
  add('brownbluegreen',    'BrBG');
  add('purplegreen',       'PRGn');
  add('pinkyellowgreen',   'PiYG');
  add('purpleorange',      'PuOr');
  add('redblue',           'RdBu');
  add('redgrey',           'RdGy');
  add('redyellowblue',     'RdYlBu');
  add('redyellowgreen',    'RdYlGn');
  add('spectral',          'Spectral');

  // sequential multi-hue
  add('bluegreen',         'BuGn');
  add('bluepurple',        'BuPu');
  add('greenblue',         'GnBu');
  add('orangered',         'OrRd');
  add('purplebluegreen',   'PuBuGn');
  add('purpleblue',        'PuBu');
  add('purplered',         'PuRd');
  add('redpurple',         'RdPu');
  add('yellowgreenblue',   'YlGnBu');
  add('yellowgreen',       'YlGn');
  add('yelloworangebrown', 'YlOrBr');
  add('yelloworangered',   'YlOrRd');

  function scheme(name, scheme) {
    if (arguments.length > 1) {
      schemes[name] = scheme;
      return this;
    }

    var part = name.split('-');
    name = part[0];
    part = +part[1] + 1;

    return part && discretized.hasOwnProperty(name) ? discretized[name][part-1]
      : !part && schemes.hasOwnProperty(name) ? schemes[name]
      : undefined;
  }

  function schemeDiscretized(name, schemeArray, interpolator) {
    if (arguments.length > 1) {
      discretized[name] = schemeArray;
      schemes[name] = interpolator || $.interpolateRgbBasis(vegaUtil.peek(schemeArray));
      return this;
    }

    return discretized.hasOwnProperty(name)
      ? discretized[name]
      : undefined;
  }

  var time = {
    millisecond: d3Time.timeMillisecond,
    second:      d3Time.timeSecond,
    minute:      d3Time.timeMinute,
    hour:        d3Time.timeHour,
    day:         d3Time.timeDay,
    week:        d3Time.timeWeek,
    month:       d3Time.timeMonth,
    year:        d3Time.timeYear
  };

  var utc = {
    millisecond: d3Time.utcMillisecond,
    second:      d3Time.utcSecond,
    minute:      d3Time.utcMinute,
    hour:        d3Time.utcHour,
    day:         d3Time.utcDay,
    week:        d3Time.utcWeek,
    month:       d3Time.utcMonth,
    year:        d3Time.utcYear
  };

  function timeInterval(name) {
    return time.hasOwnProperty(name) && time[name];
  }

  function utcInterval(name) {
    return utc.hasOwnProperty(name) && utc[name];
  }

  exports.scaleImplicit = $$1.scaleImplicit;
  exports.bandSpace = bandSpace;
  exports.scale = scale;
  exports.interpolate = interpolate;
  exports.interpolateRange = interpolateRange;
  exports.scaleFraction = scaleFraction;
  exports.scheme = scheme;
  exports.schemeDiscretized = schemeDiscretized;
  exports.timeInterval = timeInterval;
  exports.utcInterval = utcInterval;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
