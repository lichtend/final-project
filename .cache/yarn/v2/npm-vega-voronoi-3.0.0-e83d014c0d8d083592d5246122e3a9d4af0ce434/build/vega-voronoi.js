(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vega-dataflow'), require('vega-util'), require('d3-voronoi')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vega-dataflow', 'vega-util', 'd3-voronoi'], factory) :
  (factory((global.vega = global.vega || {}, global.vega.transforms = {}),global.vega,global.vega,global.d3));
}(this, (function (exports,vegaDataflow,vegaUtil,d3Voronoi) { 'use strict';

  function Voronoi(params) {
    vegaDataflow.Transform.call(this, null, params);
  }

  Voronoi.Definition = {
    "type": "Voronoi",
    "metadata": {"modifies": true},
    "params": [
      { "name": "x", "type": "field", "required": true },
      { "name": "y", "type": "field", "required": true },
      { "name": "size", "type": "number", "array": true, "length": 2 },
      { "name": "extent", "type": "array", "array": true, "length": 2,
        "default": [[-1e5, -1e5], [1e5, 1e5]],
        "content": {"type": "number", "array": true, "length": 2} },
      { "name": "as", "type": "string", "default": "path" }
    ]
  };

  var prototype = vegaUtil.inherits(Voronoi, vegaDataflow.Transform);

  var defaultExtent = [[-1e5, -1e5], [1e5, 1e5]];

  prototype.transform = function(_, pulse) {
    var as = _.as || 'path',
        data = pulse.source,
        diagram, polygons, i, n;

    // configure and construct voronoi diagram
    diagram = d3Voronoi.voronoi().x(_.x).y(_.y);
    if (_.size) diagram.size(_.size);
    else diagram.extent(_.extent || defaultExtent);

    this.value = (diagram = diagram(data));

    // map polygons to paths
    polygons = diagram.polygons();
    for (i=0, n=data.length; i<n; ++i) {
      data[i][as] = polygons[i]
        ? 'M' + polygons[i].join('L') + 'Z'
        : null;
    }

    return pulse.reflow(_.modified()).modifies(as);
  };

  exports.voronoi = Voronoi;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
