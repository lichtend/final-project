(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array'), require('d3-contour'), require('d3-geo'), require('vega-dataflow'), require('vega-projection'), require('vega-util')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-array', 'd3-contour', 'd3-geo', 'vega-dataflow', 'vega-projection', 'vega-util'], factory) :
  (factory((global.vega = global.vega || {}, global.vega.transforms = {}),global.d3,global.d3,global.d3,global.vega,global.vega,global.vega));
}(this, (function (exports,d3Array,d3Contour,d3Geo,vegaDataflow,vegaProjection,vegaUtil) { 'use strict';

  var CONTOUR_PARAMS = ['size', 'smooth'];
  var DENSITY_PARAMS = ['x', 'y', 'weight', 'size', 'cellSize', 'bandwidth'];

  /**
   * Generate contours based on kernel-density estimation of point data.
   * @constructor
   * @param {object} params - The parameters for this operator.
   * @param {Array<number>} params.size - The dimensions [width, height] over which to compute contours.
   *  If the values parameter is provided, this must be the dimensions of the input data.
   *  If density estimation is performed, this is the output view dimensions in pixels.
   * @param {Array<number>} [params.values] - An array of numeric values representing an
   *  width x height grid of values over which to compute contours. If unspecified, this
   *  transform will instead attempt to compute contours for the kernel density estimate
   *  using values drawn from data tuples in the input pulse.
   * @param {function(object): number} [params.x] - The pixel x-coordinate accessor for density estimation.
   * @param {function(object): number} [params.y] - The pixel y-coordinate accessor for density estimation.
   * @param {function(object): number} [params.weight] - The data point weight accessor for density estimation.
   * @param {number} [params.cellSize] - Contour density calculation cell size.
   * @param {number} [params.bandwidth] - Kernel density estimation bandwidth.
   * @param {Array<number>} [params.thresholds] - Contour threshold array. If
   *   this parameter is set, the count and nice parameters will be ignored.
   * @param {number} [params.count] - The desired number of contours.
   * @param {boolean} [params.nice] - Boolean flag indicating if the contour
   *   threshold values should be automatically aligned to "nice"
   *   human-friendly values. Setting this flag may cause the number of
   *   thresholds to deviate from the specified count.
   * @param {boolean} [params.smooth] - Boolean flag indicating if the contour
   *   polygons should be smoothed using linear interpolation. The default is
   *   true. The parameter is ignored when using density estimation.
   */
  function Contour(params) {
    vegaDataflow.Transform.call(this, null, params);
  }

  Contour.Definition = {
    "type": "Contour",
    "metadata": {"generates": true},
    "params": [
      { "name": "size", "type": "number", "array": true, "length": 2, "required": true },
      { "name": "values", "type": "number", "array": true },
      { "name": "x", "type": "field" },
      { "name": "y", "type": "field" },
      { "name": "weight", "type": "field" },
      { "name": "cellSize", "type": "number" },
      { "name": "bandwidth", "type": "number" },
      { "name": "count", "type": "number" },
      { "name": "smooth", "type": "boolean" },
      { "name": "nice", "type": "boolean", "default": false },
      { "name": "thresholds", "type": "number", "array": true }
    ]
  };

  var prototype = vegaUtil.inherits(Contour, vegaDataflow.Transform);

  prototype.transform = function(_, pulse) {
    if (this.value && !pulse.changed() && !_.modified())
      return pulse.StopPropagation;

    var out = pulse.fork(pulse.NO_SOURCE | pulse.NO_FIELDS),
        count = _.count || 10,
        contour, params, values;

    if (_.values) {
      contour = d3Contour.contours();
      params = CONTOUR_PARAMS;
      values = _.values;
    } else {
      contour = d3Contour.contourDensity();
      params = DENSITY_PARAMS;
      values = pulse.materialize(pulse.SOURCE).source;
    }

    // set threshold parameter
    contour.thresholds(_.thresholds || (_.nice ? count : quantize(count)));

    // set all other parameters
    params.forEach(function(param) {
      if (_[param] != null) contour[param](_[param]);
    });

    if (this.value) out.rem = this.value;
    values = values && values.length ? contour(values).map(vegaDataflow.ingest) : [];
    this.value = out.source = out.add = values;

    return out;
  };

  function quantize(k) {
    return function(values) {
      var ex = d3Array.extent(values), x0 = ex[0], dx = ex[1] - x0,
          t = [], i = 1;
      for (; i<=k; ++i) t.push(x0 + dx * i / (k + 1));
      return t;
    };
  }

  var Feature = 'Feature';
  var FeatureCollection = 'FeatureCollection';
  var MultiPoint = 'MultiPoint';

  /**
   * Consolidate an array of [longitude, latitude] points or GeoJSON features
   * into a combined GeoJSON object. This transform is particularly useful for
   * combining geo data for a Projection's fit argument. The resulting GeoJSON
   * data is available as this transform's value. Input pulses are unchanged.
   * @constructor
   * @param {object} params - The parameters for this operator.
   * @param {Array<function(object): *>} [params.fields] - A two-element array
   *   of field accessors for the longitude and latitude values.
   * @param {function(object): *} params.geojson - A field accessor for
   *   retrieving GeoJSON feature data.
   */
  function GeoJSON(params) {
    vegaDataflow.Transform.call(this, null, params);
  }

  GeoJSON.Definition = {
    "type": "GeoJSON",
    "metadata": {},
    "params": [
      { "name": "fields", "type": "field", "array": true, "length": 2 },
      { "name": "geojson", "type": "field" },
    ]
  };

  var prototype$1 = vegaUtil.inherits(GeoJSON, vegaDataflow.Transform);

  prototype$1.transform = function(_, pulse) {
    var features = this._features,
        points = this._points,
        fields = _.fields,
        lon = fields && fields[0],
        lat = fields && fields[1],
        geojson = _.geojson,
        flag = pulse.ADD,
        mod;

    mod = _.modified()
      || pulse.changed(pulse.REM)
      || pulse.modified(vegaUtil.accessorFields(geojson))
      || (lon && (pulse.modified(vegaUtil.accessorFields(lon))))
      || (lat && (pulse.modified(vegaUtil.accessorFields(lat))));

    if (!this.value || mod) {
      flag = pulse.SOURCE;
      this._features = (features = []);
      this._points = (points = []);
    }

    if (geojson) {
      pulse.visit(flag, function(t) {
        features.push(geojson(t));
      });
    }

    if (lon && lat) {
      pulse.visit(flag, function(t) {
        var x = lon(t),
            y = lat(t);
        if (x != null && y != null && (x = +x) === x && (y = +y) === y) {
          points.push([x, y]);
        }
      });
      features = features.concat({
        type: Feature,
        geometry: {
          type: MultiPoint,
          coordinates: points
        }
      });
    }

    this.value = {
      type: FeatureCollection,
      features: features
    };
  };

  /**
   * Map GeoJSON data to an SVG path string.
   * @constructor
   * @param {object} params - The parameters for this operator.
   * @param {function(number, number): *} params.projection - The cartographic
   *   projection to apply.
   * @param {function(object): *} [params.field] - The field with GeoJSON data,
   *   or null if the tuple itself is a GeoJSON feature.
   * @param {string} [params.as='path'] - The output field in which to store
   *   the generated path data (default 'path').
   */
  function GeoPath(params) {
    vegaDataflow.Transform.call(this, null, params);
  }

  GeoPath.Definition = {
    "type": "GeoPath",
    "metadata": {"modifies": true},
    "params": [
      { "name": "projection", "type": "projection" },
      { "name": "field", "type": "field" },
      { "name": "pointRadius", "type": "number", "expr": true },
      { "name": "as", "type": "string", "default": "path" }
    ]
  };

  var prototype$2 = vegaUtil.inherits(GeoPath, vegaDataflow.Transform);

  prototype$2.transform = function(_, pulse) {
    var out = pulse.fork(pulse.ALL),
        path = this.value,
        field = _.field || vegaUtil.identity,
        as = _.as || 'path',
        flag = out.SOURCE;

    function set(t) { t[as] = path(field(t)); }

    if (!path || _.modified()) {
      // parameters updated, reset and reflow
      this.value = path = vegaProjection.getProjectionPath(_.projection);
      out.materialize().reflow();
    } else {
      flag = field === vegaUtil.identity || pulse.modified(field.fields)
        ? out.ADD_MOD
        : out.ADD;
    }

    var prev = initPath(path, _.pointRadius);
    out.visit(flag, set);
    path.pointRadius(prev);

    return out.modifies(as);
  };

  function initPath(path, pointRadius) {
    var prev = path.pointRadius();
    path.context(null);
    if (pointRadius != null) {
      path.pointRadius(pointRadius);
    }
    return prev;
  }

  /**
   * Geo-code a longitude/latitude point to an x/y coordinate.
   * @constructor
   * @param {object} params - The parameters for this operator.
   * @param {function(number, number): *} params.projection - The cartographic
   *   projection to apply.
   * @param {Array<function(object): *>} params.fields - A two-element array of
   *   field accessors for the longitude and latitude values.
   * @param {Array<string>} [params.as] - A two-element array of field names
   *   under which to store the result. Defaults to ['x','y'].
   */
  function GeoPoint(params) {
    vegaDataflow.Transform.call(this, null, params);
  }

  GeoPoint.Definition = {
    "type": "GeoPoint",
    "metadata": {"modifies": true},
    "params": [
      { "name": "projection", "type": "projection", "required": true },
      { "name": "fields", "type": "field", "array": true, "required": true, "length": 2 },
      { "name": "as", "type": "string", "array": true, "length": 2, "default": ["x", "y"] }
    ]
  };

  var prototype$3 = vegaUtil.inherits(GeoPoint, vegaDataflow.Transform);

  prototype$3.transform = function(_, pulse) {
    var proj = _.projection,
        lon = _.fields[0],
        lat = _.fields[1],
        as = _.as || ['x', 'y'],
        x = as[0],
        y = as[1],
        mod;

    function set(t) {
      var xy = proj([lon(t), lat(t)]);
      if (xy) {
        t[x] = xy[0];
        t[y] = xy[1];
      } else {
        t[x] = undefined;
        t[y] = undefined;
      }
    }

    if (_.modified()) {
      // parameters updated, reflow
      pulse = pulse.materialize().reflow(true).visit(pulse.SOURCE, set);
    } else {
      mod = pulse.modified(lon.fields) || pulse.modified(lat.fields);
      pulse.visit(mod ? pulse.ADD_MOD : pulse.ADD, set);
    }

    return pulse.modifies(as);
  };

  /**
   * Annotate items with a geopath shape generator.
   * @constructor
   * @param {object} params - The parameters for this operator.
   * @param {function(number, number): *} params.projection - The cartographic
   *   projection to apply.
   * @param {function(object): *} [params.field] - The field with GeoJSON data,
   *   or null if the tuple itself is a GeoJSON feature.
   * @param {string} [params.as='shape'] - The output field in which to store
   *   the generated path data (default 'shape').
   */
  function GeoShape(params) {
    vegaDataflow.Transform.call(this, null, params);
  }

  GeoShape.Definition = {
    "type": "GeoShape",
    "metadata": {"modifies": true},
    "params": [
      { "name": "projection", "type": "projection" },
      { "name": "field", "type": "field", "default": "datum" },
      { "name": "pointRadius", "type": "number", "expr": true },
      { "name": "as", "type": "string", "default": "shape" }
    ]
  };

  var prototype$4 = vegaUtil.inherits(GeoShape, vegaDataflow.Transform);

  prototype$4.transform = function(_, pulse) {
    var out = pulse.fork(pulse.ALL),
        shape = this.value,
        datum = _.field || vegaUtil.field('datum'),
        as = _.as || 'shape',
        flag = out.ADD_MOD;

    if (!shape || _.modified()) {
      // parameters updated, reset and reflow
      this.value = shape = shapeGenerator(
        vegaProjection.getProjectionPath(_.projection),
        datum,
        _.pointRadius
      );
      out.materialize().reflow();
      flag = out.SOURCE;
    }

    out.visit(flag, function(t) { t[as] = shape; });

    return out.modifies(as);
  };

  function shapeGenerator(path, field, pointRadius) {
    var shape = pointRadius == null
      ? function(_) { return path(field(_)); }
      : function(_) {
        var prev = path.pointRadius(),
            value = path.pointRadius(pointRadius)(field(_));
        path.pointRadius(prev);
        return value;
      };
    shape.context = function(_) {
      path.context(_);
      return shape;
    };

    return shape;
  }

  /**
   * GeoJSON feature generator for creating graticules.
   * @constructor
   */
  function Graticule(params) {
    vegaDataflow.Transform.call(this, [], params);
    this.generator = d3Geo.geoGraticule();
  }

  Graticule.Definition = {
    "type": "Graticule",
    "metadata": {"changes": true},
    "params": [
      { "name": "extent", "type": "array", "array": true, "length": 2,
        "content": {"type": "number", "array": true, "length": 2} },
      { "name": "extentMajor", "type": "array", "array": true, "length": 2,
        "content": {"type": "number", "array": true, "length": 2} },
      { "name": "extentMinor", "type": "array", "array": true, "length": 2,
        "content": {"type": "number", "array": true, "length": 2} },
      { "name": "step", "type": "number", "array": true, "length": 2 },
      { "name": "stepMajor", "type": "number", "array": true, "length": 2, "default": [90, 360] },
      { "name": "stepMinor", "type": "number", "array": true, "length": 2, "default": [10, 10] },
      { "name": "precision", "type": "number", "default": 2.5 }
    ]
  };

  var prototype$5 = vegaUtil.inherits(Graticule, vegaDataflow.Transform);

  prototype$5.transform = function(_, pulse) {
    var src = this.value,
        gen = this.generator, t;

    if (!src.length || _.modified()) {
      for (var prop in _) {
        if (vegaUtil.isFunction(gen[prop])) {
          gen[prop](_[prop]);
        }
      }
    }

    t = gen();
    if (src.length) {
      pulse.mod.push(vegaDataflow.replace(src[0], t));
    } else {
      pulse.add.push(vegaDataflow.ingest(t));
    }
    src[0] = t;

    return pulse;
  };

  /**
   * Maintains a cartographic projection.
   * @constructor
   * @param {object} params - The parameters for this operator.
   */
  function Projection(params) {
    vegaDataflow.Transform.call(this, null, params);
    this.modified(true); // always treat as modified
  }

  var prototype$6 = vegaUtil.inherits(Projection, vegaDataflow.Transform);

  prototype$6.transform = function(_, pulse) {
    var proj = this.value;

    if (!proj || _.modified('type')) {
      this.value = (proj = create(_.type));
      vegaProjection.projectionProperties.forEach(function(prop) {
        if (_[prop] != null) set(proj, prop, _[prop]);
      });
    } else {
      vegaProjection.projectionProperties.forEach(function(prop) {
        if (_.modified(prop)) set(proj, prop, _[prop]);
      });
    }

    if (_.pointRadius != null) proj.path.pointRadius(_.pointRadius);
    if (_.fit) fit(proj, _);

    return pulse.fork(pulse.NO_SOURCE | pulse.NO_FIELDS);
  };

  function fit(proj, _) {
    var data = collectGeoJSON(_.fit);
    _.extent ? proj.fitExtent(_.extent, data)
      : _.size ? proj.fitSize(_.size, data) : 0;
  }

  function create(type) {
    var constructor = vegaProjection.projection((type || 'mercator').toLowerCase());
    if (!constructor) vegaUtil.error('Unrecognized projection type: ' + type);
    return constructor();
  }

  function set(proj, key, value) {
     if (vegaUtil.isFunction(proj[key])) proj[key](value);
  }

  function collectGeoJSON(features) {
    features = vegaUtil.array(features);
    return features.length === 1
      ? features[0]
      : {
          type: FeatureCollection,
          features: features.reduce(function(list, f) {
              (f && f.type === FeatureCollection) ? list.push.apply(list, f.features)
                : vegaUtil.isArray(f) ? list.push.apply(list, f)
                : list.push(f);
              return list;
            }, [])
        };
  }

  exports.contour = Contour;
  exports.geojson = GeoJSON;
  exports.geopath = GeoPath;
  exports.geopoint = GeoPoint;
  exports.geoshape = GeoShape;
  exports.graticule = Graticule;
  exports.projection = Projection;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
