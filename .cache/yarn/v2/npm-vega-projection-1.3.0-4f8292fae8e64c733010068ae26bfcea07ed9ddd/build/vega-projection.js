(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-geo')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-geo'], factory) :
  (global = global || self, factory(global.vega = {}, global.d3));
}(this, function (exports, d3Geo) { 'use strict';

  var defaultPath = d3Geo.geoPath();

  var projectionProperties = [
    // standard properties in d3-geo
    'clipAngle',
    'clipExtent',
    'scale',
    'translate',
    'center',
    'rotate',
    'parallels',
    'precision',
    'reflectX',
    'reflectY',

    // extended properties in d3-geo-projections
    'coefficient',
    'distance',
    'fraction',
    'lobes',
    'parallel',
    'radius',
    'ratio',
    'spacing',
    'tilt'
  ];

  /**
   * Augment projections with their type and a copy method.
   */
  function create(type, constructor) {
    return function projection() {
      var p = constructor();

      p.type = type;

      p.path = d3Geo.geoPath().projection(p);

      p.copy = p.copy || function() {
        var c = projection();
        projectionProperties.forEach(function(prop) {
          if (p[prop]) c[prop](p[prop]());
        });
        c.path.pointRadius(p.path.pointRadius());
        return c;
      };

      return p;
    };
  }

  function projection(type, proj) {
    if (!type || typeof type !== 'string') {
      throw new Error('Projection type must be a name string.');
    }
    type = type.toLowerCase();
    if (arguments.length > 1) {
      projections[type] = create(type, proj);
      return this;
    } else {
      return projections[type] || null;
    }
  }

  function getProjectionPath(proj) {
    return (proj && proj.path) || defaultPath;
  }

  var projections = {
    // base d3-geo projection types
    albers:               d3Geo.geoAlbers,
    albersusa:            d3Geo.geoAlbersUsa,
    azimuthalequalarea:   d3Geo.geoAzimuthalEqualArea,
    azimuthalequidistant: d3Geo.geoAzimuthalEquidistant,
    conicconformal:       d3Geo.geoConicConformal,
    conicequalarea:       d3Geo.geoConicEqualArea,
    conicequidistant:     d3Geo.geoConicEquidistant,
    equalEarth:           d3Geo.geoEqualEarth,
    equirectangular:      d3Geo.geoEquirectangular,
    gnomonic:             d3Geo.geoGnomonic,
    identity:             d3Geo.geoIdentity,
    mercator:             d3Geo.geoMercator,
    naturalEarth1:        d3Geo.geoNaturalEarth1,
    orthographic:         d3Geo.geoOrthographic,
    stereographic:        d3Geo.geoStereographic,
    transversemercator:   d3Geo.geoTransverseMercator
  };

  for (var key in projections) {
    projection(key, projections[key]);
  }

  exports.getProjectionPath = getProjectionPath;
  exports.projection = projection;
  exports.projectionProperties = projectionProperties;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
