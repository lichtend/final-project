(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-array'], factory) :
  (global = global || self, factory(global.vega = {}, global.d3));
}(this, function (exports, d3Array) { 'use strict';

  function bin(_) {
    // determine range
    var maxb = _.maxbins || 20,
        base = _.base || 10,
        logb = Math.log(base),
        div  = _.divide || [5, 2],
        min  = _.extent[0],
        max  = _.extent[1],
        span = _.span || (max - min) || Math.abs(min) || 1,
        step, level, minstep, precision, v, i, n, eps;

    if (_.step) {
      // if step size is explicitly given, use that
      step = _.step;
    } else if (_.steps) {
      // if provided, limit choice to acceptable step sizes
      v = span / maxb;
      for (i=0, n=_.steps.length; i < n && _.steps[i] < v; ++i);
      step = _.steps[Math.max(0, i-1)];
    } else {
      // else use span to determine step size
      level = Math.ceil(Math.log(maxb) / logb);
      minstep = _.minstep || 0;
      step = Math.max(
        minstep,
        Math.pow(base, Math.round(Math.log(span) / logb) - level)
      );

      // increase step size if too many bins
      while (Math.ceil(span/step) > maxb) { step *= base; }

      // decrease step size if allowed
      for (i=0, n=div.length; i<n; ++i) {
        v = step / div[i];
        if (v >= minstep && span / v <= maxb) step = v;
      }
    }

    // update precision, min and max
    v = Math.log(step);
    precision = v >= 0 ? 0 : ~~(-v / logb) + 1;
    eps = Math.pow(base, -precision - 1);
    if (_.nice || _.nice === undefined) {
      v = Math.floor(min / step + eps) * step;
      min = min < v ? v - step : v;
      max = Math.ceil(max / step) * step;
    }

    return {
      start: min,
      stop:  max === min ? min + step : max,
      step:  step
    };
  }

  function* numbers(values, valueof) {
    if (valueof === undefined) {
      for (let value of values) {
        if (value != null && (value = +value) >= value) {
          yield value;
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
          yield value;
        }
      }
    }
  }

  exports.random = Math.random;

  function setRandom(r) {
    exports.random = r;
  }

  function bootstrapCI(array, samples, alpha, f) {
    if (!array.length) return [undefined, undefined];

    var values = Float64Array.from(numbers(array, f)),
        n = values.length,
        m = samples,
        a, i, j, mu;

    for (j=0, mu=Array(m); j<m; ++j) {
      for (a=0, i=0; i<n; ++i) {
        a += values[~~(exports.random() * n)];
      }
      mu[j] = a / n;
    }

    mu.sort(d3Array.ascending);

    return [
      d3Array.quantile(mu, alpha/2),
      d3Array.quantile(mu, 1-(alpha/2))
    ];
  }

  // Dot density binning for dot plot construction.
  // Based on Leland Wilkinson, Dot Plots, The American Statistician, 1999.
  // https://www.cs.uic.edu/~wilkinson/Publications/dotplots.pdf
  function dotbin(array, step, smooth, f) {
    f = f || (_ => _);

    let i = 0, j = 1,
        n = array.length,
        v = new Float64Array(n),
        a = f(array[0]),
        b = a,
        w = a + step,
        x;

    for (; j<n; ++j) {
      x = f(array[j]);
      if (x >= w) {
        b = (a + b) / 2;
        for (; i<j; ++i) v[i] = b;
        w = x + step;
        a = x;
      }
      b = x;
    }

    b = (a + b) / 2;
    for (; i<j; ++i) v[i] = b;

    return smooth ? smoothing(v, step + step / 4) : v;
  }

  // perform smoothing to reduce variance
  // swap points between "adjacent" stacks
  // Wilkinson defines adjacent as within step/4 units
  function smoothing(v, thresh) {
    let n = v.length,
        a = 0,
        b = 1,
        c, d;

    // get left stack
    while (v[a] === v[b]) ++b;

    while (b < n) {
      // get right stack
      c = b + 1;
      while (v[b] === v[c]) ++c;

      // are stacks adjacent?
      // if so, compare sizes and swap as needed
      if (v[b] - v[b-1] < thresh) {
        d = b + ((a + c - b - b) >> 1);
        while (d < b) v[d++] = v[b];
        while (d > b) v[d--] = v[a];
      }

      // update left stack indices
      a = b;
      b = c;
    }

    return v;
  }

  function quantiles(array, p, f) {
    var values = Float64Array.from(numbers(array, f));

    // don't depend on return value from typed array sort call
    // protects against undefined sort results in Safari (vega/vega-lite#4964)
    values.sort(d3Array.ascending);

    return p.map(_ => d3Array.quantileSorted(values, _));
  }

  function quartiles(array, f) {
    return quantiles(array, [0.25, 0.50, 0.75], f);
  }

  function lcg(seed) {
    // Random numbers using a Linear Congruential Generator with seed value
    // Uses glibc values from https://en.wikipedia.org/wiki/Linear_congruential_generator
    return function() {
      seed = (1103515245 * seed + 12345) % 2147483647;
      return seed / 2147483647;
    };
  }

  function integer(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }

    var dist = {},
        a, b, d;

    dist.min = function(_) {
      if (arguments.length) {
        a = _ || 0;
        d = b - a;
        return dist;
      } else {
        return a;
      }
    };

    dist.max = function(_) {
      if (arguments.length) {
        b = _ || 0;
        d = b - a;
        return dist;
      } else {
        return b;
      }
    };

    dist.sample = function() {
      return a + Math.floor(d * exports.random());
    };

    dist.pdf = function(x) {
      return (x === Math.floor(x) && x >= a && x < b) ? 1 / d : 0;
    };

    dist.cdf = function(x) {
      var v = Math.floor(x);
      return v < a ? 0 : v >= b ? 1 : (v - a + 1) / d;
    };

    dist.icdf = function(p) {
      return (p >= 0 && p <= 1) ? a - 1 + Math.floor(p * d) : NaN;
    };

    return dist.min(min).max(max);
  }

  const SQRT2PI = Math.sqrt(2 * Math.PI);
  const SQRT2 = Math.SQRT2;

  let nextSample = NaN;

  function sampleNormal(mean, stdev) {
    mean = mean || 0;
    stdev = stdev == null ? 1 : stdev;

    let x = 0, y = 0, rds, c;
    if (nextSample === nextSample) {
      x = nextSample;
      nextSample = NaN;
    } else {
      do {
        x = exports.random() * 2 - 1;
        y = exports.random() * 2 - 1;
        rds = x * x + y * y;
      } while (rds === 0 || rds > 1);
      c = Math.sqrt(-2 * Math.log(rds) / rds); // Box-Muller transform
      x *= c;
      nextSample = y * c;
    }
    return mean + x * stdev;
  }

  function densityNormal(value, mean, stdev) {
    stdev = stdev == null ? 1 : stdev;
    const z = (value - (mean || 0)) / stdev;
    return Math.exp(-0.5 * z * z) / (stdev * SQRT2PI);
  }

  // Approximation from West (2009)
  // Better Approximations to Cumulative Normal Functions
  function cumulativeNormal(value, mean, stdev) {
    mean = mean || 0;
    stdev = stdev == null ? 1 : stdev;

    let cd,
        z = (value - mean) / stdev,
        Z = Math.abs(z);

    if (Z > 37) {
      cd = 0;
    } else {
      let sum, exp = Math.exp(-Z * Z / 2);
      if (Z < 7.07106781186547) {
        sum = 3.52624965998911e-02 * Z + 0.700383064443688;
        sum = sum * Z + 6.37396220353165;
        sum = sum * Z + 33.912866078383;
        sum = sum * Z + 112.079291497871;
        sum = sum * Z + 221.213596169931;
        sum = sum * Z + 220.206867912376;
        cd = exp * sum;
        sum = 8.83883476483184e-02 * Z + 1.75566716318264;
        sum = sum * Z + 16.064177579207;
        sum = sum * Z + 86.7807322029461;
        sum = sum * Z + 296.564248779674;
        sum = sum * Z + 637.333633378831;
        sum = sum * Z + 793.826512519948;
        sum = sum * Z + 440.413735824752;
        cd = cd / sum;
      } else {
        sum = Z + 0.65;
        sum = Z + 4 / sum;
        sum = Z + 3 / sum;
        sum = Z + 2 / sum;
        sum = Z + 1 / sum;
        cd = exp / sum / 2.506628274631;
      }
    }
    return z > 0 ? 1 - cd : cd;
  }

  // Approximation of Probit function using inverse error function.
  function quantileNormal(p, mean, stdev) {
    if (p < 0 || p > 1) return NaN;
    return (mean || 0) + (stdev == null ? 1 : stdev) * SQRT2 * erfinv(2 * p - 1);
  }

  // Approximate inverse error function. Implementation from "Approximating
  // the erfinv function" by Mike Giles, GPU Computing Gems, volume 2, 2010.
  // Ported from Apache Commons Math, http://www.apache.org/licenses/LICENSE-2.0
  function erfinv(x) {
    // beware that the logarithm argument must be
    // commputed as (1.0 - x) * (1.0 + x),
    // it must NOT be simplified as 1.0 - x * x as this
    // would induce rounding errors near the boundaries +/-1
    let w = - Math.log((1 - x) * (1 + x)), p;

    if (w < 6.25) {
        w -= 3.125;
        p =  -3.6444120640178196996e-21;
        p =   -1.685059138182016589e-19 + p * w;
        p =   1.2858480715256400167e-18 + p * w;
        p =    1.115787767802518096e-17 + p * w;
        p =   -1.333171662854620906e-16 + p * w;
        p =   2.0972767875968561637e-17 + p * w;
        p =   6.6376381343583238325e-15 + p * w;
        p =  -4.0545662729752068639e-14 + p * w;
        p =  -8.1519341976054721522e-14 + p * w;
        p =   2.6335093153082322977e-12 + p * w;
        p =  -1.2975133253453532498e-11 + p * w;
        p =  -5.4154120542946279317e-11 + p * w;
        p =    1.051212273321532285e-09 + p * w;
        p =  -4.1126339803469836976e-09 + p * w;
        p =  -2.9070369957882005086e-08 + p * w;
        p =   4.2347877827932403518e-07 + p * w;
        p =  -1.3654692000834678645e-06 + p * w;
        p =  -1.3882523362786468719e-05 + p * w;
        p =    0.0001867342080340571352 + p * w;
        p =  -0.00074070253416626697512 + p * w;
        p =   -0.0060336708714301490533 + p * w;
        p =      0.24015818242558961693 + p * w;
        p =       1.6536545626831027356 + p * w;
    } else if (w < 16.0) {
        w = Math.sqrt(w) - 3.25;
        p =   2.2137376921775787049e-09;
        p =   9.0756561938885390979e-08 + p * w;
        p =  -2.7517406297064545428e-07 + p * w;
        p =   1.8239629214389227755e-08 + p * w;
        p =   1.5027403968909827627e-06 + p * w;
        p =   -4.013867526981545969e-06 + p * w;
        p =   2.9234449089955446044e-06 + p * w;
        p =   1.2475304481671778723e-05 + p * w;
        p =  -4.7318229009055733981e-05 + p * w;
        p =   6.8284851459573175448e-05 + p * w;
        p =   2.4031110387097893999e-05 + p * w;
        p =   -0.0003550375203628474796 + p * w;
        p =   0.00095328937973738049703 + p * w;
        p =   -0.0016882755560235047313 + p * w;
        p =    0.0024914420961078508066 + p * w;
        p =   -0.0037512085075692412107 + p * w;
        p =     0.005370914553590063617 + p * w;
        p =       1.0052589676941592334 + p * w;
        p =       3.0838856104922207635 + p * w;
    } else if (Number.isFinite(w)) {
        w = Math.sqrt(w) - 5.0;
        p =  -2.7109920616438573243e-11;
        p =  -2.5556418169965252055e-10 + p * w;
        p =   1.5076572693500548083e-09 + p * w;
        p =  -3.7894654401267369937e-09 + p * w;
        p =   7.6157012080783393804e-09 + p * w;
        p =  -1.4960026627149240478e-08 + p * w;
        p =   2.9147953450901080826e-08 + p * w;
        p =  -6.7711997758452339498e-08 + p * w;
        p =   2.2900482228026654717e-07 + p * w;
        p =  -9.9298272942317002539e-07 + p * w;
        p =   4.5260625972231537039e-06 + p * w;
        p =  -1.9681778105531670567e-05 + p * w;
        p =   7.5995277030017761139e-05 + p * w;
        p =  -0.00021503011930044477347 + p * w;
        p =  -0.00013871931833623122026 + p * w;
        p =       1.0103004648645343977 + p * w;
        p =       4.8499064014085844221 + p * w;
    } else {
        p = Infinity;
    }

    return p * x;
  }

  function gaussian(mean, stdev) {
    var mu,
        sigma,
        dist = {
          mean: function(_) {
            if (arguments.length) {
              mu = _ || 0;
              return dist;
            } else {
              return mu;
            }
          },
          stdev: function(_) {
            if (arguments.length) {
              sigma = _ == null ? 1 : _;
              return dist;
            } else {
              return sigma;
            }
          },
          sample: () => sampleNormal(mu, sigma),
          pdf: value => densityNormal(value, mu, sigma),
          cdf: value => cumulativeNormal(value, mu, sigma),
          icdf: p => quantileNormal(p, mu, sigma)
        };

    return dist.mean(mean).stdev(stdev);
  }

  // TODO: support for additional kernels?
  function kde(support, bandwidth) {
    var kernel = gaussian(),
        dist = {},
        n = 0;

    dist.data = function(_) {
      if (arguments.length) {
        support = _;
        n = _ ? _.length : 0;
        return dist.bandwidth(bandwidth);
      } else {
        return support;
      }
    };

    dist.bandwidth = function(_) {
      if (!arguments.length) return bandwidth;
      bandwidth = _;
      if (!bandwidth && support) bandwidth = estimateBandwidth(support);
      return dist;
    };

    dist.sample = function() {
      return support[~~(exports.random() * n)] + bandwidth * kernel.sample();
    };

    dist.pdf = function(x) {
      for (var y=0, i=0; i<n; ++i) {
        y += kernel.pdf((x - support[i]) / bandwidth);
      }
      return y / bandwidth / n;
    };

    dist.cdf = function(x) {
      for (var y=0, i=0; i<n; ++i) {
        y += kernel.cdf((x - support[i]) / bandwidth);
      }
      return y / n;
    };

    dist.icdf = function() {
      throw Error('KDE icdf not supported.');
    };

    return dist.data(support);
  }

  // Scott, D. W. (1992) Multivariate Density Estimation:
  // Theory, Practice, and Visualization. Wiley.
  function estimateBandwidth(array) {
    var n = array.length,
        q = quartiles(array),
        h = (q[2] - q[0]) / 1.34;
    return 1.06 * Math.min(Math.sqrt(d3Array.variance(array)), h) * Math.pow(n, -0.2);
  }

  function sampleLogNormal(mean, stdev) {
    mean = mean || 0;
    stdev = stdev == null ? 1 : stdev;
    return Math.exp(mean + sampleNormal() * stdev);
  }

  function densityLogNormal(value, mean, stdev) {
    if (value <= 0) return 0;
    mean = mean || 0;
    stdev = stdev == null ? 1 : stdev;
    const z = (Math.log(value) - mean) / stdev;
    return Math.exp(-0.5 * z * z) / (stdev * SQRT2PI * value);
  }

  function cumulativeLogNormal(value, mean, stdev) {
    return cumulativeNormal(Math.log(value), mean, stdev);
  }

  function quantileLogNormal(p, mean, stdev) {
    return Math.exp(quantileNormal(p, mean, stdev));
  }

  function lognormal(mean, stdev) {
    var mu,
        sigma,
        dist = {
          mean: function(_) {
            if (arguments.length) {
              mu = _ || 0;
              return dist;
            } else {
              return mu;
            }
          },
          stdev: function(_) {
            if (arguments.length) {
              sigma = _ == null ? 1 : _;
              return dist;
            } else {
              return sigma;
            }
          },
          sample: () => sampleLogNormal(mu, sigma),
          pdf: value => densityLogNormal(value, mu, sigma),
          cdf: value => cumulativeLogNormal(value, mu, sigma),
          icdf: p => quantileLogNormal(p, mu, sigma)
        };

    return dist.mean(mean).stdev(stdev);
  }

  function mixture(dists, weights) {
    var dist = {}, m = 0, w;

    function normalize(x) {
      var w = [], sum = 0, i;
      for (i=0; i<m; ++i) { sum += (w[i] = (x[i]==null ? 1 : +x[i])); }
      for (i=0; i<m; ++i) { w[i] /= sum; }
      return w;
    }

    dist.weights = function(_) {
      if (arguments.length) {
        w = normalize(weights = (_ || []));
        return dist;
      }
      return weights;
    };

    dist.distributions = function(_) {
      if (arguments.length) {
        if (_) {
          m = _.length;
          dists = _;
        } else {
          m = 0;
          dists = [];
        }
        return dist.weights(weights);
      }
      return dists;
    };

    dist.sample = function() {
      var r = exports.random(),
          d = dists[m-1],
          v = w[0],
          i = 0;

      // first select distribution
      for (; i<m-1; v += w[++i]) {
        if (r < v) { d = dists[i]; break; }
      }
      // then sample from it
      return d.sample();
    };

    dist.pdf = function(x) {
      for (var p=0, i=0; i<m; ++i) {
        p += w[i] * dists[i].pdf(x);
      }
      return p;
    };

    dist.cdf = function(x) {
      for (var p=0, i=0; i<m; ++i) {
        p += w[i] * dists[i].cdf(x);
      }
      return p;
    };

    dist.icdf = function() {
      throw Error('Mixture icdf not supported.');
    };

    return dist.distributions(dists).weights(weights);
  }

  function sampleUniform(min, max) {
    if (max == null) {
      max = (min == null ? 1 : min);
      min = 0;
    }
    return min + (max - min) * exports.random();
  }

  function densityUniform(value, min, max) {
    if (max == null) {
      max = (min == null ? 1 : min);
      min = 0;
    }
    return (value >= min && value <= max) ? 1 / (max - min) : 0;
  }

  function cumulativeUniform(value, min, max) {
    if (max == null) {
      max = (min == null ? 1 : min);
      min = 0;
    }
    return value < min ? 0 : value > max ? 1 : (value - min) / (max - min);
  }

  function quantileUniform(p, min, max) {
    if (max == null) {
      max = (min == null ? 1 : min);
      min = 0;
    }
    return (p >= 0 && p <= 1) ? min + p * (max - min) : NaN;
  }

  function uniform(min, max) {
    var a, b,
        dist = {
          min: function(_) {
            if (arguments.length) {
              a = _ || 0;
              return dist;
            } else {
              return a;
            }
          },
          max: function(_) {
            if (arguments.length) {
              b = _ == null ? 1 : _;
              return dist;
            } else {
              return b;
            }
          },
          sample: () => sampleUniform(a, b),
          pdf: value => densityUniform(value, a, b),
          cdf: value => cumulativeUniform(value, a, b),
          icdf: p => quantileUniform(p, a, b)
        };

    if (max == null) {
      max = (min == null ? 1 : min);
      min = 0;
    }
    return dist.min(min).max(max);
  }

  // Ordinary Least Squares
  function ols(uX, uY, uXY, uX2) {
    const delta = uX2 - uX * uX,
          slope = Math.abs(delta) < 1e-24 ? 0 : (uXY - uX * uY) / delta,
          intercept = uY - slope * uX;

    return [intercept, slope];
  }

  function points(data, x, y, sort) {
    data = data.filter(d => {
      let u = x(d), v = y(d);
      return u != null && (u = +u) >= u && v != null && (v = +v) >= v;
    });

    if (sort) {
      data.sort((a, b) => x(a) - x(b));
    }

    const X = new Float64Array(data.length),
          Y = new Float64Array(data.length);

    let i = 0;
    for (let d of data) {
      X[i] = x(d);
      Y[i] = y(d);
      ++i;
    }

    return [X, Y];
  }

  function visitPoints(data, x, y, callback) {
    let index = -1, i = -1, u, v;

    for (let d of data) {
      u = x(d, ++index, data);
      v = y(d, index, data);
      if (u != null && (u = +u) >= u && v != null && (v = +v) >= v) {
        callback(u, v, ++i);
      }
    }
  }

  // Adapted from d3-regression by Harry Stevens
  // License: https://github.com/HarryStevens/d3-regression/blob/master/LICENSE
  function rSquared(data, x, y, uY, predict) {
    let SSE = 0, SST = 0;

    visitPoints(data, x, y, (dx, dy) => {
      const sse = dy - predict(dx),
            sst = dy - uY;

      SSE += sse * sse;
      SST += sst * sst;
    });

    return 1 - SSE / SST;
  }

  // Adapted from d3-regression by Harry Stevens
  // License: https://github.com/HarryStevens/d3-regression/blob/master/LICENSE
  function linear(data, x, y) {
    let X = 0, Y = 0, XY = 0, X2 = 0, n = 0;

    visitPoints(data, x, y, (dx, dy) => {
      X += dx;
      Y += dy;
      XY += dx * dy;
      X2 += dx * dx;
      ++n;
    });

    const coef = ols(X / n, Y / n, XY / n, X2 / n),
          predict = x => coef[0] + coef[1] * x;

    return {
      coef: coef,
      predict: predict,
      rSquared: rSquared(data, x, y, Y / n, predict)
    };
  }

  // Adapted from d3-regression by Harry Stevens
  // License: https://github.com/HarryStevens/d3-regression/blob/master/LICENSE
  function log(data, x, y) {
    let X = 0, Y = 0, XY = 0, X2 = 0, n = 0;

    visitPoints(data, x, y, (dx, dy) => {
      dx = Math.log(dx);
      X += dx;
      Y += dy;
      XY += dx * dy;
      X2 += dx * dx;
      ++n;
    });

    const coef = ols(X / n, Y / n, XY / n, X2 / n),
          predict = x => coef[0] + coef[1] * Math.log(x);

    return {
      coef: coef,
      predict: predict,
      rSquared: rSquared(data, x, y, Y / n, predict)
    };
  }

  function exp(data, x, y) {
    let Y = 0, YL = 0, XY = 0, XYL = 0, X2Y = 0, n = 0;

    visitPoints(data, x, y, (dx, dy) => {
      const ly = Math.log(dy),
            xy = dx * dy;
      Y += dy;
      XY += xy;
      X2Y += dx * xy;
      YL += dy * ly;
      XYL += xy * ly;
      ++n;
    });

    const coef = ols(XY / Y, YL / Y, XYL / Y, X2Y / Y),
          predict = x => coef[0] * Math.exp(coef[1] * x);

    coef[0] = Math.exp(coef[0]);

    return {
      coef: coef,
      predict: predict,
      rSquared: rSquared(data, x, y, Y / n, predict)
    };
  }

  // Adapted from d3-regression by Harry Stevens
  // License: https://github.com/HarryStevens/d3-regression/blob/master/LICENSE
  function pow(data, x, y) {
    let X = 0, Y = 0, XY = 0, X2 = 0, YS = 0, n = 0;

    visitPoints(data, x, y, (dx, dy) => {
      const lx = Math.log(dx),
            ly = Math.log(dy);
      X += lx;
      Y += ly;
      XY += lx * ly;
      X2 += lx * lx;
      YS += dy;
      ++n;
    });

    const coef = ols(X / n, Y / n, XY / n, X2 / n),
          predict = x => coef[0] * Math.pow(x, coef[1]);

    coef[0] = Math.exp(coef[0]);

    return {
      coef: coef,
      predict: predict,
      rSquared: rSquared(data, x, y, YS / n, predict)
    };
  }

  function quad(data, x, y) {
    let X = 0, Y = 0, X2 = 0, X3 = 0, X4 = 0, XY = 0, X2Y = 0, n = 0;

    visitPoints(data, x, y, (dx, dy) => {
      const x2 = dx * dx;
      X += dx;
      Y += dy;
      X2 += x2;
      X3 += x2 * dx;
      X4 += x2 * x2;
      XY += dx * dy;
      X2Y += x2 * dy;
      ++n;
    });

    Y = Y / n;
    XY = XY - X * Y;
    X2Y = X2Y - X2 * Y;

    const XX = X2 - X * X / n,
          XX2 = X3 - (X2 * X / n),
          X2X2 = X4 - (X2 * X2 / n),
          d = (XX * X2X2 - XX2 * XX2),
          a = (X2Y * XX - XY * XX2) / d,
          b = (XY * X2X2 - X2Y * XX2) / d,
          c = Y - (b * (X / n)) - (a * (X2 / n)),
          predict = x => a * x * x + b * x + c;

    return {
      coef: [c, b, a],
      predict: predict,
      rSquared: rSquared(data, x, y, Y, predict)
    };
  }

  // Adapted from d3-regression by Harry Stevens
  // License: https://github.com/HarryStevens/d3-regression/blob/master/LICENSE
  // ... which was adapted from regression-js by Tom Alexander
  // Source: https://github.com/Tom-Alexander/regression-js/blob/master/src/regression.js#L246
  // License: https://github.com/Tom-Alexander/regression-js/blob/master/LICENSE
  function poly(data, x, y, order) {
    // use more efficient methods for lower orders
    if (order === 1) return linear(data, x, y);
    if (order === 2) return quad(data, x, y);

    const [xv, yv] = points(data, x, y),
          n = xv.length,
          lhs = [],
          rhs = [],
          k = order + 1;

    let Y = 0, i, j, l, v, c;

    for (i = 0; i < n; ++i) {
      Y += yv[i];
    }

    for (i = 0; i < k; ++i) {
      for (l = 0, v = 0; l < n; ++l) {
        v += Math.pow(xv[l], i) * yv[l];
      }
      lhs.push(v);

      c = new Float64Array(k);
      for (j = 0; j < k; ++j) {
        for (l = 0, v = 0; l < n; ++l) {
          v += Math.pow(xv[l], i + j);
        }
        c[j] = v;
      }
      rhs.push(c);
    }
    rhs.push(lhs);

    const coef = gaussianElimination(rhs),
          predict = x => {
            let y = 0, i = 0, n = coef.length;
            for (; i < n; ++i) y += coef[i] * Math.pow(x, i);
            return y;
          };

    return {
      coef: coef,
      predict: predict,
      rSquared: rSquared(data, x, y, Y / n, predict)
    };
  }

  // Given an array for a two-dimensional matrix and the polynomial order,
  // solve A * x = b using Gaussian elimination.
  function gaussianElimination(matrix) {
    const n = matrix.length - 1,
          coef = [];

    let i, j, k, r, t;

    for (i = 0; i < n; ++i) {
      r = i; // max row
      for (j = i + 1; j < n; ++j) {
        if (Math.abs(matrix[i][j]) > Math.abs(matrix[i][r])) {
          r = j;
        }
      }

      for (k = i; k < n + 1; ++k) {
        t = matrix[k][i];
        matrix[k][i] = matrix[k][r];
        matrix[k][r] = t;
      }

      for (j = i + 1; j < n; ++j) {
        for (k = n; k >= i; k--) {
          matrix[k][j] -= (matrix[k][i] * matrix[i][j]) / matrix[i][i];
        }
      }
    }

    for (j = n - 1; j >= 0; --j) {
      t = 0;
      for (k = j + 1; k < n; ++k) {
        t += matrix[k][j] * coef[k];
      }
      coef[j] = (matrix[n][j] - t) / matrix[j][j];
    }

    return coef;
  }

  const maxiters = 2,
        epsilon = 1e-12;

  // Adapted from science.js by Jason Davies
  // Source: https://github.com/jasondavies/science.js/blob/master/src/stats/loess.js
  // License: https://github.com/jasondavies/science.js/blob/master/LICENSE
  function loess(data, x, y, bandwidth) {
    const [xv, yv] = points(data, x, y, true),
          n = xv.length,
          bw = Math.max(2, ~~(bandwidth * n)), // # nearest neighbors
          yhat = new Float64Array(n),
          residuals = new Float64Array(n),
          robustWeights = new Float64Array(n).fill(1);

    for (let iter = -1; ++iter <= maxiters; ) {
      const interval = [0, bw - 1];

      for (let i = 0; i < n; ++i) {
        const dx = xv[i],
              i0 = interval[0],
              i1 = interval[1],
              edge = (dx - xv[i0]) > (xv[i1] - dx) ? i0 : i1;

        let W = 0, X = 0, Y = 0, XY = 0, X2 = 0,
            denom = 1 / Math.abs(xv[edge] - dx || 1); // avoid singularity!

        for (let k = i0; k <= i1; ++k) {
          const xk = xv[k],
                yk = yv[k],
                w = tricube(Math.abs(dx - xk) * denom) * robustWeights[k],
                xkw = xk * w;

          W += w;
          X += xkw;
          Y += yk * w;
          XY += yk * xkw;
          X2 += xk * xkw;
        }

        // linear regression fit
        const [a, b] = ols(X / W, Y / W, XY / W, X2 / W);
        yhat[i] = a + b * dx;
        residuals[i] = Math.abs(yv[i] - yhat[i]);

        updateInterval(xv, i + 1, interval);
      }

      if (iter === maxiters) {
        break;
      }

      const medianResidual = d3Array.median(residuals);
      if (Math.abs(medianResidual) < epsilon) break;

      for (let i = 0, arg, w; i < n; ++i){
        arg = residuals[i] / (6 * medianResidual);
        // default to epsilon (rather than zero) for large deviations
        // keeping weights tiny but non-zero prevents singularites
        robustWeights[i] = (arg >= 1) ? epsilon : ((w = 1 - arg * arg) * w);
      }
    }

    return output(xv, yhat);
  }

  // weighting kernel for local regression
  function tricube(x) {
    return (x = 1 - x * x * x) * x * x;
  }

  // advance sliding window interval of nearest neighbors
  function updateInterval(xv, i, interval) {
    let val = xv[i],
        left = interval[0],
        right = interval[1] + 1;

    if (right >= xv.length) return;

    // step right if distance to new right edge is <= distance to old left edge
    // step when distance is equal to ensure movement over duplicate x values
    while (i > left && (xv[right] - val) <= (val - xv[left])) {
      interval[0] = ++left;
      interval[1] = right;
      ++right;
    }
  }

  // generate smoothed output points
  // average points with repeated x values
  function output(xv, yhat) {
    const n = xv.length,
          out = [];

    for (let i=0, cnt=0, prev=[], v; i<n; ++i) {
      v = xv[i];
      if (prev[0] === v) {
        // average output values via online update
        prev[1] += (yhat[i] - prev[1]) / (++cnt);
      } else {
        // add new output point
        cnt = 0;
        prev = [v, yhat[i]];
        out.push(prev);
      }
    }
    return out;
  }

  // subdivide up to accuracy of 0.1 degrees
  const MIN_RADIANS = 0.1 * Math.PI / 180;

  // Adaptively sample an interpolated function over a domain extent
  function sampleCurve(f, extent, minSteps, maxSteps) {
    minSteps = minSteps || 25;
    maxSteps = Math.max(minSteps, maxSteps || 200);

    const point = x => [x, f(x)],
          minX = extent[0],
          maxX = extent[1],
          span = maxX - minX,
          stop = span / maxSteps,
          prev = [point(minX)],
          next = [];

    if (minSteps === maxSteps) {
      // no adaptation, sample uniform grid directly and return
      for (let i = 1; i < maxSteps; ++i) {
        prev.push(point(minX + (i / minSteps) * span));
      }
      prev.push(point(maxX));
      return prev;
    } else {
      // sample minimum points on uniform grid
      // then move on to perform adaptive refinement
      next.push(point(maxX));
      for (let i = minSteps; --i > 0;) {
        next.push(point(minX + (i / minSteps) * span));
      }
    }

    let p0 = prev[0],
        p1 = next[next.length - 1];

    while (p1) {
      // midpoint for potential curve subdivision
      const pm = point((p0[0] + p1[0]) / 2);

      if (pm[0] - p0[0] >= stop && angleDelta(p0, pm, p1) > MIN_RADIANS) {
        // maximum resolution has not yet been met, and
        // subdivision midpoint sufficiently different from endpoint
        // save subdivision, push midpoint onto the visitation stack
        next.push(pm);
      } else {
        // subdivision midpoint sufficiently similar to endpoint
        // skip subdivision, store endpoint, move to next point on the stack
        p0 = p1;
        prev.push(p1);
        next.pop();
      }
      p1 = next[next.length - 1];
    }

    return prev;
  }

  function angleDelta(p, q, r) {
    const a0 = Math.atan2(r[1] - p[1], r[0] - p[0]),
          a1 = Math.atan2(q[1] - p[1], q[0] - p[0]);
    return Math.abs(a0 - a1);
  }

  exports.bin = bin;
  exports.bootstrapCI = bootstrapCI;
  exports.cumulativeLogNormal = cumulativeLogNormal;
  exports.cumulativeNormal = cumulativeNormal;
  exports.cumulativeUniform = cumulativeUniform;
  exports.densityLogNormal = densityLogNormal;
  exports.densityNormal = densityNormal;
  exports.densityUniform = densityUniform;
  exports.dotbin = dotbin;
  exports.quantileLogNormal = quantileLogNormal;
  exports.quantileNormal = quantileNormal;
  exports.quantileUniform = quantileUniform;
  exports.quantiles = quantiles;
  exports.quartiles = quartiles;
  exports.randomInteger = integer;
  exports.randomKDE = kde;
  exports.randomLCG = lcg;
  exports.randomLogNormal = lognormal;
  exports.randomMixture = mixture;
  exports.randomNormal = gaussian;
  exports.randomUniform = uniform;
  exports.regressionExp = exp;
  exports.regressionLinear = linear;
  exports.regressionLoess = loess;
  exports.regressionLog = log;
  exports.regressionPoly = poly;
  exports.regressionPow = pow;
  exports.regressionQuad = quad;
  exports.sampleCurve = sampleCurve;
  exports.sampleLogNormal = sampleLogNormal;
  exports.sampleNormal = sampleNormal;
  exports.sampleUniform = sampleUniform;
  exports.setRandom = setRandom;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
