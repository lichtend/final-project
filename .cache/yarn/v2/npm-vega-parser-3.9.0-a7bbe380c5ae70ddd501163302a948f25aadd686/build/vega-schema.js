(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vega-util')) :
  typeof define === 'function' && define.amd ? define(['vega-util'], factory) :
  (global.vega = global.vega || {}, global.vega.schema = factory(global.vega));
}(this, (function (vegaUtil) { 'use strict';

  var types = {"enum": ["pad", "fit", "fit-x", "fit-y", "none"]};

  var autosize = {
    "defs": {
      "autosize": {
        "oneOf": [
          types,
          {
            "type": "object",
            "properties": {
              "type": types,
              "resize": {"type": "boolean"},
              "contains": {"enum": ["content", "padding"]}
            },
            "required": ["type"],
            "additionalProperties": false
          }
        ],
        "default": "pad"
      }
    }
  };

  var timeIntervals = [
    "millisecond",
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "year"
  ];

  var rangeDef = [
    {
      "enum": [
        "width",
        "height",
        "symbol",
        "category",
        "ordinal",
        "ramp",
        "diverging",
        "heatmap"
      ]
    },
    {
      "type": "array",
      "items": {
        "oneOf": [
          {"type": "null"},
          {"type": "boolean"},
          {"type": "string"},
          {"type": "number"},
          {"$ref": "#/refs/signal"}
        ]
      }
    },
    {"$ref": "#/refs/signal"}
  ];

  var schemeRangeDef = rangeDef.concat([
    {
      "type": "object",
      "properties": {
        "scheme": {"$ref": "#/refs/stringOrSignal"},
        "count": {"$ref": "#/refs/numberOrSignal"},
        "extent": {
          "oneOf": [
            {
              "type": "array",
              "items": {"$ref": "#/refs/numberOrSignal"},
              "numItems": 2
            },
            {"$ref": "#/refs/signal"}
          ]
        }
      },
      "required": ["scheme"],
      "additionalProperties": false
    }
  ]);

  var bandRangeDef = rangeDef.concat([
    {
      "type": "object",
      "properties": {
        "step": {"$ref": "#/refs/numberOrSignal"}
      },
      "required": ["step"],
      "additionalProperties": false
    }
  ]);

  var scale = {
    "refs": {
      "sortOrder": {
        "oneOf": [
          {"enum": ["ascending", "descending"]},
          {"$ref": "#/refs/signal"}
        ]
      },
      "scaleField": {"$ref": "#/refs/stringOrSignal"},
      "scaleInterpolate": {
        "oneOf": [
          {"type": "string"},
          {"$ref": "#/refs/signal"},
          {
            "type": "object",
            "properties": {
              "type": {"$ref": "#/refs/stringOrSignal"},
              "gamma": {"$ref": "#/refs/numberOrSignal"}
            },
            "required": ["type"]
          }
        ]
      },
      "scaleData": {
        "oneOf": [
          {
            "type": "object",
            "properties": {
              "data": {"type": "string"},
              "field": {"$ref": "#/refs/scaleField"},
              "sort": {
                "oneOf": [
                  {"type": "boolean"},
                  {
                    "type": "object",
                    "properties": {
                      "field": {"$ref": "#/refs/scaleField"},
                      "op": {"$ref": "#/refs/scaleField"},
                      "order": {"$ref": "#/refs/sortOrder"}
                    },
                    "additionalProperties": false,
                  }
                ]
              }
            },
            "required": ["data", "field"],
            "additionalProperties": false
          },
          {
            "type": "object",
            "properties": {
              "data": {"type": "string"},
              "fields": {
                "type": "array",
                "items": {"$ref": "#/refs/scaleField"},
                "minItems": 1
              },
              "sort": {
                "oneOf": [
                  {"type": "boolean"},
                  {
                    "type": "object",
                    "properties": {
                      "op": {"enum": ["count"]},
                      "order": {"$ref": "#/refs/sortOrder"}
                    },
                    "additionalProperties": false,
                  }
                ]
              }
            },
            "required": ["data", "fields"],
            "additionalProperties": false
          },
          {
            "type": "object",
            "properties": {
              "fields": {
                "type": "array",
                "items": {
                  "oneOf": [
                    {
                      "type": "object",
                      "properties": {
                        "data": {"type": "string"},
                        "field": {"$ref": "#/refs/scaleField"},
                      },
                      "required": ["data", "field"],
                      "additionalProperties": false
                    },
                    {
                      "type": "array",
                      "items": {
                        "oneOf": [
                          {"type": "string"},
                          {"type": "number"},
                          {"type": "boolean"}
                        ]
                      }
                    },
                    {"$ref": "#/refs/signal"}
                  ]
                },
                "minItems": 1
              },
              "sort": {
                "oneOf": [
                  {"type": "boolean"},
                  {
                    "type": "object",
                    "properties": {
                      "op": {"enum": ["count"]},
                      "order": {"$ref": "#/refs/sortOrder"}
                    },
                    "additionalProperties": false,
                  }
                ]
              }
            },
            "required": ["fields"],
            "additionalProperties": false
          }
        ]
      }
    },

    "defs": {
      "scale": {
        "title": "Scale mapping",
        "type": "object",

        "allOf": [
          {
            "properties": {
              "name": {"type": "string"},
              "type": {"type": "string", "default": "linear"},
              "domain": {
                "oneOf": [
                  {
                    "type": "array",
                    "items": {
                      "oneOf": [
                        {"type": "null"},
                        {"type": "string"},
                        {"type": "number"},
                        {"type": "boolean"},
                        {"$ref": "#/refs/signal"}
                      ]
                    }
                  },
                  {"$ref": "#/refs/scaleData"},
                  {"$ref": "#/refs/signal"}
                ]
              },
              "domainMin": {"$ref": "#/refs/numberOrSignal"},
              "domainMax": {"$ref": "#/refs/numberOrSignal"},
              "domainMid": {"$ref": "#/refs/numberOrSignal"},
              "domainRaw": {
                "oneOf": [
                  {"type": "null"},
                  {"type": "array"},
                  {"$ref": "#/refs/signal"}
                ]
              },
              "reverse": {"$ref": "#/refs/booleanOrSignal"},
              "round": {"$ref": "#/refs/booleanOrSignal"}
            },
            "required": ["name"]
          },
          {
            "oneOf": [
              {
                "properties": {
                  "type": {"enum": ["ordinal"]},
                  "range": {
                    "oneOf": schemeRangeDef.concat({"$ref": "#/refs/scaleData"})
                  },
                  "domainImplicit": {"$ref": "#/refs/booleanOrSignal"}
                },
                "required": ["type"]
              },
              {
                "properties": {
                  "type": {"enum": ["band"]},
                  "range": {"oneOf": bandRangeDef},
                  "padding": {"$ref": "#/refs/numberOrSignal"},
                  "paddingInner": {"$ref": "#/refs/numberOrSignal"},
                  "paddingOuter": {"$ref": "#/refs/numberOrSignal"},
                  "align": {"$ref": "#/refs/numberOrSignal"}
                },
                "required": ["type"]
              },
              {
                "properties": {
                  "type": {"enum": ["point"]},
                  "range": {"oneOf": bandRangeDef},
                  "padding": {"$ref": "#/refs/numberOrSignal"},
                  "paddingOuter": {"$ref": "#/refs/numberOrSignal"},
                  "align": {"$ref": "#/refs/numberOrSignal"}
                },
                "required": ["type"]
              },
              {
                "properties": {
                  "type": {"enum": ["sequential"]},
                  "range": {"oneOf": schemeRangeDef},
                  "clamp": {"$ref": "#/refs/booleanOrSignal"}
                },
                "required": ["type", "range"]
              },
              {
                "properties": {
                  "type": {"enum": ["time", "utc"]},
                  "range": {"oneOf": schemeRangeDef},
                  "clamp": {"$ref": "#/refs/booleanOrSignal"},
                  "padding": {"$ref": "#/refs/numberOrSignal"},
                  "nice": {
                    "oneOf": [
                      {"type": "boolean"},
                      {"type": "string", "enum": timeIntervals},
                      {
                        "type": "object",
                        "properties": {
                          "interval": {
                            "oneOf": [
                              {"type": "string", "enum": timeIntervals},
                              {"$ref": "#/refs/signal"}
                            ]
                          },
                          "step": {"$ref": "#/refs/numberOrSignal"}
                        },
                        "required": ["interval"]
                      },
                      {"$ref": "#/refs/signal"}
                    ]
                  }
                },
                "required": ["type"]
              },
              {
                "properties": {
                  "type": {"enum": ["identity"]},
                  "nice": {"$ref": "#/refs/booleanOrSignal"}
                },
                "required": ["type"]
              },
              {
                "description": "Discretizing scales",
                "properties": {
                  "type": {"enum": ["quantile", "quantize", "threshold", "bin-ordinal"]},
                  "range": {"oneOf": schemeRangeDef},
                  "nice": {
                    "oneOf": [
                      {"type": "boolean"},
                      {"type": "number"},
                      {"$ref": "#/refs/signal"}
                    ]
                  },
                  "zero": {"$ref": "#/refs/booleanOrSignal"}
                },
                "required": ["type"]
              },
              {
                "description": "Default numeric scale",
                "not": {
                  "properties": {
                    "type": {
                      "enum": [
                        "ordinal", "band", "point",
                        "quantile", "quantize", "threshold",
                        "sequential", "pow", "log", "time", "utc",
                        "identity", "bin-ordinal", "bin-linear"
                      ]
                    }
                  },
                  "required": ["type"]
                },
                "properties": {
                  "range": {"oneOf": schemeRangeDef},
                  "interpolate": {"$ref": "#/refs/scaleInterpolate"},
                  "clamp": {"$ref": "#/refs/booleanOrSignal"},
                  "padding": {"$ref": "#/refs/numberOrSignal"},
                  "nice": {
                    "oneOf": [
                      {"type": "boolean"},
                      {"type": "number"},
                      {"$ref": "#/refs/signal"}
                    ]
                  },
                  "zero": {"$ref": "#/refs/booleanOrSignal"}
                }
              },
              {
                "properties": {
                  "type": {"enum": ["log"]},
                  "range": {"oneOf": schemeRangeDef},
                  "interpolate": {"$ref": "#/refs/scaleInterpolate"},
                  "base": {"$ref": "#/refs/numberOrSignal"},
                  "clamp": {"$ref": "#/refs/booleanOrSignal"},
                  "padding": {"$ref": "#/refs/numberOrSignal"},
                  "nice": {
                    "oneOf": [
                      {"type": "boolean"},
                      {"type": "number"},
                      {"$ref": "#/refs/signal"}
                    ]
                  },
                  "zero": {"$ref": "#/refs/booleanOrSignal"}
                },
                "required": ["type"]
              },
              {
                "properties": {
                  "type": {"enum": ["pow"]},
                  "range": {"oneOf": schemeRangeDef},
                  "interpolate": {"$ref": "#/refs/scaleInterpolate"},
                  "clamp": {"$ref": "#/refs/booleanOrSignal"},
                  "exponent": {"$ref": "#/refs/numberOrSignal"},
                  "padding": {"$ref": "#/refs/numberOrSignal"},
                  "nice": {
                    "oneOf": [
                      {"type": "boolean"},
                      {"type": "number"},
                      {"$ref": "#/refs/signal"}
                    ]
                  },
                  "zero": {"$ref": "#/refs/booleanOrSignal"}
                },
                "required": ["type"]
              },
              {
                "properties": {
                  "type": {"enum": ["bin-linear"]},
                  "range": {"oneOf": schemeRangeDef},
                  "interpolate": {"$ref": "#/refs/scaleInterpolate"}
                },
                "required": ["type"]
              }
            ]
          }
        ]
      }
    }
  };

  var fontWeightEnum = [
    null, "normal", "bold", "lighter", "bolder",
    "100", "200", "300", "400", "500", "600", "700", "800", "900",
    100, 200, 300, 400, 500, 600, 700, 800, 900
  ];

  var alignEnum = ["left", "right", "center"];

  var baselineEnum = ["top", "middle", "bottom", "alphabetic"];

  var areaOrientEnum = ["horizontal", "vertical"];

  function valueSchema(type, nullable) {
    type = vegaUtil.isArray(type) ? {"enum": type} : {"type": type};

    var modType = type.type === "number" ? "number" : "string",
        valueType = nullable ? {"oneOf": [type, {"type": "null"}]} : type;

    var valueRef = {
      "type": "object",
      "allOf": [
        { "$ref": "#/refs/" + modType + "Modifiers" },
        {
          "anyOf": [
            {
              "oneOf": [
                { "$ref": "#/refs/signal" },
                {
                  "properties": {"value": valueType},
                  "required": ["value"]
                },
                {
                  "properties": {"field": {"$ref": "#/refs/field"}},
                  "required": ["field"]
                },
                {
                  "properties": {"range": {"type": ["number", "boolean"]}},
                  "required": ["range"]
                }
              ]
            },
            {
              "required": ["scale", "value"]
            },
            {
              "required": ["scale", "band"]
            },
            {
              "required": ["offset"]
            }
          ]
        }
      ]
    };

    return {
      "oneOf": [
        {
          "type": "array",
          "items": {
            "allOf": [
              {"$ref": "#/defs/rule"},
              valueRef
            ]
          }
        },
        valueRef
      ]
    };
  }

  var encode = {
    "refs": {

      "field": {
        "title": "FieldRef",
        "oneOf": [
          {"type": "string"},
          {
            "oneOf": [
              { "$ref": "#/refs/signal" },
              {
                "type": "object",
                "properties": {
                  "datum": {"$ref": "#/refs/field"}
                },
                "required": ["datum"],
                "additionalProperties": false
              },
              {
                "type": "object",
                "properties": {
                  "group": {"$ref": "#/refs/field"},
                  "level": {"type": "number"}
                },
                "required": ["group"],
                "additionalProperties": false
              },
              {
                "type": "object",
                "properties": {
                  "parent": {"$ref": "#/refs/field"},
                  "level": {"type": "number"}
                },
                "required": ["parent"],
                "additionalProperties": false
              }
            ]
          }
        ]
      },

      "scale": {
        "$ref": "#/refs/field"
      },

      "stringModifiers": {
        "properties": {
          "scale": {"$ref": "#/refs/scale"}
        }
      },

      "numberModifiers": {
        "properties": {
          "exponent": {
            "oneOf": [
              {"type": "number"},
              {"$ref": "#/refs/numberValue"}
            ]
          },
          "mult": {
            "oneOf": [
              {"type": "number"},
              {"$ref": "#/refs/numberValue"}
            ]
          },
          "offset": {
            "oneOf": [
              {"type": "number"},
              {"$ref": "#/refs/numberValue"}
            ]
          },
          "round": {"type": "boolean", "default": false},
          "scale": {"$ref": "#/refs/scale"},
          "band": {"type": ["number", "boolean"]},
          "extra": {"type": "boolean"}
        }
      },

      "value": valueSchema({}, "value"),
      "numberValue": valueSchema("number"),
      "stringValue": valueSchema("string"),
      "booleanValue": valueSchema("boolean"),
      "arrayValue": valueSchema("array"),
      "nullableStringValue": valueSchema("string", true),
      "fontWeightValue": valueSchema(fontWeightEnum),

      "alignValue": valueSchema(alignEnum),
      "baselineValue": valueSchema(baselineEnum),
      "orientValue": valueSchema(areaOrientEnum),

      "colorRGB": {
        "type": "object",
        "properties": {
          "r": {"$ref": "#/refs/numberValue"},
          "g": {"$ref": "#/refs/numberValue"},
          "b": {"$ref": "#/refs/numberValue"}
        },
        "required": ["r", "g", "b"]
      },

      "colorHSL": {
        "type": "object",
        "properties": {
          "h": {"$ref": "#/refs/numberValue"},
          "s": {"$ref": "#/refs/numberValue"},
          "l": {"$ref": "#/refs/numberValue"}
        },
        "required": ["h", "s", "l"]
      },

      "colorLAB": {
        "type": "object",
        "properties": {
          "l": {"$ref": "#/refs/numberValue"},
          "a": {"$ref": "#/refs/numberValue"},
          "b": {"$ref": "#/refs/numberValue"}
        },
        "required": ["l", "a", "b"]
      },

      "colorHCL": {
        "type": "object",
        "properties": {
          "h": {"$ref": "#/refs/numberValue"},
          "c": {"$ref": "#/refs/numberValue"},
          "l": {"$ref": "#/refs/numberValue"}
        },
        "required": ["h", "c", "l"]
      },

      "colorValue": {
        "title": "ColorRef",
        "oneOf": [
          {"$ref": "#/refs/nullableStringValue"},
          {
            "type": "object",
            "properties": {
              "gradient": {"$ref": "#/refs/scale"}
            },
            "additionalProperties": false,
            "required": ["gradient"]
          },
          {
            "type": "object",
            "properties": {
              "color": {
                "oneOf": [
                  {"$ref": "#/refs/colorRGB"},
                  {"$ref": "#/refs/colorHSL"},
                  {"$ref": "#/refs/colorLAB"},
                  {"$ref": "#/refs/colorHCL"}
                ]
              }
            },
            "additionalProperties": false,
            "required": ["color"]
          }
        ]
      }
    },

    "defs": {
      "rule": {
        "type": "object",
        "properties": {
          "test": {"type": "string"}
        }
      },
      "encodeEntry": {
        "title": "Mark encode property set",
        "type": "object",
        "properties": {
          // Common Properties
          "x": {"$ref": "#/refs/numberValue"},
          "x2": {"$ref": "#/refs/numberValue"},
          "xc": {"$ref": "#/refs/numberValue"},
          "width": {"$ref": "#/refs/numberValue"},
          "y": {"$ref": "#/refs/numberValue"},
          "y2": {"$ref": "#/refs/numberValue"},
          "yc": {"$ref": "#/refs/numberValue"},
          "height": {"$ref": "#/refs/numberValue"},
          "opacity": {"$ref": "#/refs/numberValue"},
          "fill": {"$ref": "#/refs/colorValue"},
          "fillOpacity": {"$ref": "#/refs/numberValue"},
          "stroke": {"$ref": "#/refs/colorValue"},
          "strokeWidth": {"$ref": "#/refs/numberValue"},
          "strokeOpacity": {"$ref": "#/refs/numberValue"},
          "strokeDash": {"$ref": "#/refs/arrayValue"},
          "strokeDashOffset": {"$ref": "#/refs/numberValue"},
          "cursor": {"$ref": "#/refs/stringValue"},

          // Group-mark properties
          "clip": {"$ref": "#/refs/booleanValue"},

          // Symbol-mark properties
          "size": {"$ref": "#/refs/numberValue"},
          "shape": {"$ref": "#/refs/stringValue"},

          // Path-mark properties
          "path": {"$ref": "#/refs/stringValue"},

          // Arc-mark properties
          "innerRadius": {"$ref": "#/refs/numberValue"},
          "outerRadius": {"$ref": "#/refs/numberValue"},
          "startAngle": {"$ref": "#/refs/numberValue"},
          "endAngle": {"$ref": "#/refs/numberValue"},

          // Area- and line-mark properties
          "interpolate": {"$ref": "#/refs/stringValue"},
          "tension": {"$ref": "#/refs/numberValue"},
          "orient": {"$ref": "#/refs/orientValue"},

          // Image-mark properties
          "url": {"$ref": "#/refs/stringValue"},
          "align": {"$ref": "#/refs/alignValue"},
          "baseline": {"$ref": "#/refs/baselineValue"},

          // Text-mark properties
          "text": {"$ref": "#/refs/stringValue"},
          "dir": {"$ref": "#/refs/stringValue"},
          "ellipsis": {"$ref": "#/refs/stringValue"},
          "limit": {"$ref": "#/refs/numberValue"},
          "dx": {"$ref": "#/refs/numberValue"},
          "dy": {"$ref": "#/refs/numberValue"},
          "radius":{"$ref": "#/refs/numberValue"},
          "theta": {"$ref": "#/refs/numberValue"},
          "angle": {"$ref": "#/refs/numberValue"},
          "font": {"$ref": "#/refs/stringValue"},
          "fontSize": {"$ref": "#/refs/numberValue"},
          "fontWeight": {"$ref": "#/refs/fontWeightValue"},
          "fontStyle": {"$ref": "#/refs/stringValue"}
        },
        "additionalProperties": true
      },
      "encode": {
        "type": "object",
        "patternProperties": {
          "^.+$": {"$ref": "#/defs/encodeEntry"},
        },
        "additionalProperties": false
      }
    }
  };

  var anchorEnum = ['start', 'middle', 'end'];

  var alignValue = {
    "oneOf": [
      {"enum": alignEnum},
      {"$ref": "#/refs/alignValue"}
    ]
  };

  var anchorValue = {
    "oneOf": [
      {"enum": anchorEnum, "default": "middle"},
      valueSchema(anchorEnum)
    ]
  };

  var baselineValue = {
    "oneOf": [
      {"enum": baselineEnum},
      {"$ref": "#/refs/baselineValue"}
    ]
  };

  var booleanValue = {
    "oneOf": [
      {"type": "boolean"},
      {"$ref": "#/refs/booleanValue"}
    ]
  };

  var colorValue = {
    "oneOf": [
      {"type": "null"},
      {"type": "string"},
      {"$ref": "#/refs/colorValue"}
    ]
  };

  var dashArrayValue = {
    "oneOf": [
      {
        "type": "array",
        "items": {"type": "number"}
      },
      {"$ref": "#/refs/arrayValue"}
    ]
  };

  var fontWeightValue = {
    "oneOf": [
      {"enum": fontWeightEnum},
      {"$ref": "#/refs/fontWeightValue"}
    ]
  };

  var numberValue = {
    "oneOf": [
      {"type": "number"},
      {"$ref": "#/refs/numberValue"}
    ]
  };

  var stringValue = {
    "oneOf": [
      {"type": "string"},
      {"$ref": "#/refs/stringValue"}
    ]
  };

  var booleanOrNumberOrSignal = {
    "oneOf": [
      {"type": "boolean"},
      {"type": "number"},
      {"$ref": "#/refs/signal"}
    ]
  };

  var booleanOrSignal = {
    "$ref": "#/refs/booleanOrSignal"
  };

  var arrayOrSignal = {
    "$ref": "#/refs/arrayOrSignal"
  };

  var numberOrSignal = {
    "$ref": "#/refs/numberOrSignal"
  };

  var stringOrSignal = {
    "$ref": "#/refs/stringOrSignal"
  };

  var axis = {
    "refs": {
      "labelOverlap": {
        "oneOf": [
          {"type": "boolean"},
          {"enum": ["parity", "greedy"], "type": "string"},
          {"$ref": "#/refs/signal"}
        ]
      },
      "tickCount": {
        "oneOf": [
          {"type": "number"},
          {"type": "string", "enum": timeIntervals},
          {
            "type": "object",
            "properties": {
              "interval": {
                "oneOf": [
                  {"type": "string", "enum": timeIntervals},
                  {"$ref": "#/refs/signal"}
                ]
              },
              "step": numberOrSignal
            },
            "required": ["interval"]
          },
          {"$ref": "#/refs/signal"}
        ]
      }
    },
    "defs": {
      "axis": {
        "type": "object",
        "properties": {
          "orient": {"enum": ["top", "bottom", "left", "right"]},
          "scale": {"type": "string"},
          "format": stringOrSignal,
          "minExtent": numberValue,
          "maxExtent": numberValue,
          "offset": numberValue,
          "position": numberValue,
          "bandPosition": numberValue,
          "values": arrayOrSignal,
          "zindex": {"type": "number"},

          // TITLE CONFIG
          "title": stringOrSignal,
          "titlePadding": numberValue,
          "titleAlign": alignValue,
          "titleAngle": numberValue,
          "titleX": numberValue,
          "titleY": numberValue,
          "titleBaseline": baselineValue,
          "titleColor": colorValue,
          "titleFont": stringValue,
          "titleFontSize": numberValue,
          "titleFontWeight": fontWeightValue,
          "titleLimit": numberValue,
          "titleOpacity": numberValue,

          // DOMAIN CONFIG
          "domain": {"type": "boolean"},
          "domainColor": colorValue,
          "domainOpacity": numberValue,
          "domainWidth": numberValue,

          // TICK CONFIG
          "ticks": {"type": "boolean"},
          "tickColor": colorValue,
          "tickOffset": numberValue,
          "tickOpacity": numberValue,
          "tickRound": booleanValue,
          "tickSize": numberValue,
          "tickWidth": numberValue,

          "tickCount": {"$ref": "#/refs/tickCount"},
          "tickExtra": booleanOrSignal,

          // GRID CONFIG
          "grid": {"type": "boolean"},
          "gridScale": {"type": "string"},
          "gridColor": colorValue,
          "gridDash": dashArrayValue,
          "gridOpacity": numberValue,
          "gridWidth": numberValue,

          // LABEL CONFIG
          "labels": {"type": "boolean"},
          "labelAlign": alignValue,
          "labelBaseline": baselineValue,
          "labelBound": booleanOrNumberOrSignal,
          "labelFlush": booleanOrNumberOrSignal,
          "labelFlushOffset": numberOrSignal,
          "labelOverlap": {"$ref": "#/refs/labelOverlap"},
          "labelAngle": numberValue,
          "labelColor": colorValue,
          "labelFont": stringValue,
          "labelFontSize": numberValue,
          "labelFontWeight": fontWeightValue,
          "labelLimit": numberValue,
          "labelOpacity": numberValue,
          "labelPadding": numberValue,

          // CUSTOMIZED ENCODERS
          "encode": {
            "type": "object",
            "properties": {
              "axis": {"$ref": "#/defs/guideEncode"},
              "ticks": {"$ref": "#/defs/guideEncode"},
              "labels": {"$ref": "#/defs/guideEncode"},
              "title": {"$ref": "#/defs/guideEncode"},
              "grid": {"$ref": "#/defs/guideEncode"},
              "domain": {"$ref": "#/defs/guideEncode"}
            },
            "additionalProperties": false
          }
        },
        "additionalProperties": false,
        "required": ["orient", "scale"]
      }
    }
  };

  var background = {
    "defs": {
      "background": {"type": "string"}
    }
  };

  var bind = {
    "refs": {
      "element": {
        "type": "string"
      }
    },
    "defs": {
      "bind": {
        "oneOf": [
          {
            "type": "object",
            "properties": {
              "input": {"enum": ["checkbox"]},
              "element": {"$ref": "#/refs/element"},
              "debounce": {"type": "number"},
              "name": {"type": "string"}
            },
            "required": ["input"]
          },
          {
            "type": "object",
            "properties": {
              "input": {"enum": ["radio", "select"]},
              "element": {"$ref": "#/refs/element"},
              "options": {"type": "array"},
              "debounce": {"type": "number"},
              "name": {"type": "string"}
            },
            "additionalProperties": false,
            "required": ["input", "options"]
          },
          {
            "type": "object",
            "properties": {
              "input": {"enum": ["range"]},
              "element": {"$ref": "#/refs/element"},
              "min": {"type": "number"},
              "max": {"type": "number"},
              "step": {"type": "number"},
              "debounce": {"type": "number"},
              "name": {"type": "string"}
            },
            "additionalProperties": false,
            "required": ["input"]
          },
          {
            "type": "object",
            "properties": {
              "input": {
                "not": {"enum": ["checkbox", "radio", "range", "select"]}
              },
              "element": {"$ref": "#/refs/element"},
              "debounce": {"type": "number"},
              "name": {"type": "string"}
            },
            "additionalProperties": true
          },
        ]
      }
    }
  };

  var parseDef = {
    "oneOf": [
      {"enum": ["auto"]},
      {
        "type": "object",
        "additionalProperties": {
          "oneOf": [
            {
              "enum": ["boolean", "number", "date", "string"]
            },
            {
              "type": "string",
              "pattern": "^(date|utc):.*$"
            }
          ]
        }
      }
    ]
  };

  var data = {
    "refs": {
      "paramField": {
        "type": "object",
        "properties": {
          "field": {"type": "string"},
          "as": {"type": "string"}
        },
        "additionalProperties": false,
        "required": ["field"]
      }
    },
    "defs": {
      "dataFormat": {
        "type": "object",
        "anyOf": [
          {
            "properties": {
              "type": {"enum": ["json"]},
              "parse": parseDef,
              "property": {"type": "string"},
              "copy": {"type": "boolean"}
            },
            "additionalProperties": false
          },
          {
            "properties": {
              "type": {"enum": ["csv", "tsv"]},
              "parse": parseDef
            },
            "additionalProperties": false
          },
          {
            "properties": {
              "type": {"enum": ["dsv"]},
              "delimiter": {"type": "string"},
              "parse": parseDef
            },
            "additionalProperties": false
          },
          {
            "oneOf": [
              {
                "properties": {
                  "type": {"enum": ["topojson"]},
                  "feature": {"type": "string"},
                  "property": {"type": "string"}
                },
                "additionalProperties": false
              },
              {
                "properties": {
                  "type": {"enum": ["topojson"]},
                  "mesh": {"type": "string"},
                  "property": {"type": "string"}
                },
                "additionalProperties": false
              }
            ]
          }
        ]
      },
      "data": {
        "title": "Input data set definition",
        "type": "object",
        "allOf": [
          {
            "properties": {
              "name": {"type": "string"},
              "transform": {
                "type": "array",
                "items": {"$ref": "#/defs/transform"}
              },
              "on": {"$ref": "#/defs/onTrigger"}
            },
            "required": ["name"]
          },
          {
            "anyOf": [
              {
                "required": ["name"]
              },
              {
                "oneOf": [
                  {
                    "properties": {
                      "source": {
                        "oneOf": [
                          {"type": "string"},
                          {
                            "type": "array",
                            "items": {"type": "string"},
                            "minItems": 1
                          }
                        ]
                      }
                    },
                    "required": ["source"]
                  },
                  {
                    "properties": {
                      "values": {"type": "array"},
                      "format": {"$ref": "#/defs/dataFormat"}
                    },
                    "required": ["values"]
                  },
                  {
                    "properties": {
                      "url": stringOrSignal,
                      "format": {
                        "oneOf": [
                          {"$ref": "#/defs/dataFormat"},
                          {"$ref": "#/refs/signal"}
                        ]
                      }
                    },
                    "required": ["url"]
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  };

  var expr = {
    "refs": {
      "expr": {
        "title": "ExpressionRef",
        "type": "object",
        "properties": {
          "expr": {"type": "string"},
          "as": {"type": "string"}
        },
        "required": ["expr"]
      },
      "exprString": {
        "title": "Expression String",
        "type": "string"
      }
    }
  };

  var layoutAlignEnum = ["all", "each", "none"];

  var layoutAlign = {
    "oneOf": [
      {"enum": layoutAlignEnum},
      {"$ref": "#/refs/signal"}
    ]
  };

  var band = {
    "oneOf": [
      {"$ref": "#/refs/numberOrSignal"},
      {"type": "null"},
      {
        "type": "object",
        "properties": {
          "row": {"$ref": "#/refs/numberOrSignal"},
          "column": {"$ref": "#/refs/numberOrSignal"}
        },
        "additionalProperties": false
      }
    ]
  };

  var layout = {
    "defs": {
      "layout": {
        "oneOf": [
          {
            "type": "object",
            "properties": {
              "align": {
                "oneOf": [
                  layoutAlign,
                  {
                    "type": "object",
                    "properties": {
                      "row": layoutAlign,
                      "column": layoutAlign
                    },
                    "additionalProperties": false
                  }
                ]
              },
              "bounds": {
                "oneOf": [
                  {"enum": ["full", "flush"]},
                  {"$ref": "#/refs/signal"}
                ]
              },
              "center": {
                "oneOf": [
                  {"$ref": "#/refs/booleanOrSignal"},
                  {
                    "type": "object",
                    "properties": {
                      "row": {"$ref": "#/refs/booleanOrSignal"},
                      "column": {"$ref": "#/refs/booleanOrSignal"}
                    },
                    "additionalProperties": false
                  }
                ]
              },
              "columns": {"$ref": "#/refs/numberOrSignal"},
              "padding": {
                "oneOf": [
                  {"$ref": "#/refs/numberOrSignal"},
                  {
                    "type": "object",
                    "properties": {
                      "row": {"$ref": "#/refs/numberOrSignal"},
                      "column": {"$ref": "#/refs/numberOrSignal"}
                    },
                    "additionalProperties": false
                  }
                ]
              },
              "offset": {
                "oneOf": [
                  {"$ref": "#/refs/numberOrSignal"},
                  {
                    "type": "object",
                    "properties": {
                      "rowHeader": {"$ref": "#/refs/numberOrSignal"},
                      "rowFooter": {"$ref": "#/refs/numberOrSignal"},
                      "rowTitle": {"$ref": "#/refs/numberOrSignal"},
                      "columnHeader": {"$ref": "#/refs/numberOrSignal"},
                      "columnFooter": {"$ref": "#/refs/numberOrSignal"},
                      "columnTitle": {"$ref": "#/refs/numberOrSignal"}
                    },
                    "additionalProperties": false
                  }
                ]
              },
              "headerBand": band,
              "footerBand": band,
              "titleBand": band
            }
          },
          {"$ref": "#/refs/signal"}
        ]
      }
    }
  };

  var legend = {
    "defs": {
      "guideEncode": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "interactive": {"type": "boolean", "default": false},
          "style": {"$ref": "#/refs/style"}
        },
        "patternProperties": {
          "^(?!interactive|name|style).+$": {"$ref": "#/defs/encodeEntry"},
        },
        "additionalProperties": false
      },
      "legend": {
        "type": "object",
        "properties": {
          "size":       {"type": "string"},
          "shape":      {"type": "string"},
          "fill":       {"type": "string"},
          "stroke":     {"type": "string"},
          "opacity":    {"type": "string"},
          "strokeDash": {"type": "string"},
          "type": {
            "enum": ["gradient", "symbol"]
          },
          "direction": {
            "enum": ["vertical", "horizontal"]
          },
          "orient": {
            "enum": [
              "none",
              "left",
              "right",
              "top",
              "bottom",
              "top-left",
              "top-right",
              "bottom-left",
              "bottom-right"
            ],
            "default": "right"
          },
          "format": stringOrSignal,
          "title": stringOrSignal,
          "tickCount": {"$ref": "#/refs/tickCount"},
          "values": arrayOrSignal,
          "zindex": {"type": "number"},

          // LEGEND GROUP CONFIG
          "cornerRadius": numberValue,
          "fillColor": colorValue,
          "offset": numberValue,
          "padding": numberValue,
          "strokeColor": colorValue,
          "strokeWidth": numberValue,

          // LEGEND TITLE CONFIG
          "titleAlign": alignValue,
          "titleBaseline": baselineValue,
          "titleColor": colorValue,
          "titleFont": stringValue,
          "titleFontSize": numberValue,
          "titleFontWeight": fontWeightValue,
          "titleLimit": numberValue,
          "titleOpacity": numberValue,
          "titlePadding": numberValue,

          // GRADIENT CONFIG
          "gradientLength": numberOrSignal,
          "gradientOpacity": numberValue,
          "gradientStrokeColor": colorValue,
          "gradientStrokeWidth": numberValue,
          "gradientThickness": numberOrSignal,

          // SYMBOL LAYOUT CONFIG
          "clipHeight": numberOrSignal,
          "columns": numberOrSignal,
          "columnPadding": numberOrSignal,
          "rowPadding": numberOrSignal,
          "gridAlign": layoutAlign,

          // SYMBOL CONFIG
          "symbolFillColor": colorValue,
          "symbolOffset": numberValue,
          "symbolOpacity": numberValue,
          "symbolSize": numberValue,
          "symbolStrokeColor": colorValue,
          "symbolStrokeWidth": numberValue,
          "symbolType": stringValue,

          // LABEL CONFIG
          "labelAlign": alignValue,
          "labelBaseline": baselineValue,
          "labelColor": colorValue,
          "labelFont": stringValue,
          "labelFontSize": numberValue,
          "labelFontWeight": fontWeightValue,
          "labelLimit": numberValue,
          "labelOffset": numberValue,
          "labelOpacity": numberValue,
          "labelOverlap": {"$ref": "#/refs/labelOverlap"},

          // CUSTOMIZED ENCODERS
          "encode": {
            "type": "object",
            "properties": {
              "title": {"$ref": "#/defs/guideEncode"},
              "labels": {"$ref": "#/defs/guideEncode"},
              "legend": {"$ref": "#/defs/guideEncode"},
              "entries": {"$ref": "#/defs/guideEncode"},
              "symbols": {"$ref": "#/defs/guideEncode"},
              "gradient": {"$ref": "#/defs/guideEncode"}
            },
            "additionalProperties": false
          }
        },
        "additionalProperties": false,
        "anyOf": [
          {"required": ["size"]},
          {"required": ["shape"]},
          {"required": ["fill"]},
          {"required": ["stroke"]},
          {"required": ["opacity"]},
          {"required": ["strokeDash"]}
        ]
      }
    }
  };

  var mark = {
    "refs": {
      "compare": {
        "oneOf": [
          {
            "type": "object",
            "properties": {
              "field": {
                "oneOf": [
                  {"type": "string"},
                  {"$ref": "#/refs/signal"}
                ]
              },
              "order": {"$ref": "#/refs/sortOrder"}
            }
          },
          {
            "type": "object",
            "properties": {
              "field": {
                "type": "array",
                "items": {
                  "anyOf": [
                    {"type": "string"},
                    {"$ref": "#/refs/signal"}
                  ]
                }
              },
              "order": {
                "type": "array",
                "items": {"$ref": "#/refs/sortOrder"}
              }
            }
          }
        ]
      },
      "from": {
        "type": "object",
        "properties": {
          "data": {"type": "string"},
        },
        "additionalProperties": false
      },
      "facet": {
        "type": "object",
        "properties": {
          "data": {"type": "string"},
          "facet": {
            "oneOf": [
              {
                "type": "object",
                "properties": {
                  "name": {"type": "string"},
                  "data": {"type": "string"},
                  "field": {"type": "string"}
                },
                "additionalProperties": false,
                "required": ["name", "data", "field"]
              },
              {
                "type": "object",
                "properties": {
                  "name": {"type": "string"},
                  "data": {"type": "string"},
                  // TODO revisit for signal support
                  "groupby": {
                    "oneOf": [
                      {"type": "string"},
                      {"type": "array", "items": {"type": "string"}}
                    ]
                  },
                  "aggregate": {
                    "type": "object",
                    "properties": {
                      "cross": {"type": "boolean"},
                      "fields": {"type": "array", "items": {"type": "string"}},
                      "ops": {"type": "array", "items": {"type": "string"}},
                      "as": {"type": "array", "items": {"type": "string"}}
                    }
                  }
                },
                "additionalProperties": false,
                "required": ["name", "data", "groupby"]
              },
            ]
          }
        },
        "additionalProperties": false,
        "required": ["facet"]
      },
      "markclip": {
        "oneOf": [
          {"$ref": "#/refs/booleanOrSignal"},
          {
            "type": "object",
            "properties": {
              "path": {"$ref": "#/refs/stringOrSignal"}
            },
            "required": ["path"],
            "additionalProperties": false
          },
          {
            "type": "object",
            "properties": {
              "sphere": {"$ref": "#/refs/stringOrSignal"}
            },
            "required": ["sphere"],
            "additionalProperties": false
          }
        ]
      },
      "style": {
        "oneOf": [
          {
            "type": "string"
          },
          {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        ]
      }
    },

    "defs": {
      "mark": {
        "type": "object",
        "properties": {
          "type": {"$ref": "#/refs/marktype"},
          "role": {"type": "string"},
          "name": {"type": "string"},
          "style": {"$ref": "#/refs/style"},
          "key": {"type": "string"},
          "clip": {"$ref": "#/refs/markclip"},
          "sort": {"$ref": "#/refs/compare"},
          "interactive": {"$ref": "#/refs/booleanOrSignal"},
          "encode": {"$ref": "#/defs/encode"},
          "transform": {
            "type": "array",
            "items": {"$ref": "#/defs/transformMark"}
          },
          "on": {"$ref": "#/defs/onMarkTrigger"}
        },
        "required": ["type"]
      },
      "markGroup": {
        "allOf": [
          {
            "properties": { "type": {"enum": ["group"]} },
            "required": ["type"]
          },
          {"$ref": "#/defs/mark"},
          {"$ref": "#/defs/scope"},
          {
            "type": "object",
            "properties": {
              "from": {
                "oneOf": [
                  {"$ref": "#/refs/from"},
                  {"$ref": "#/refs/facet"}
                ]
              }
            }
          }
        ]
      },
      "markVisual": {
        "allOf": [
          {"not": {"properties": { "type": {"enum": ["group"]} }}},
          {"$ref": "#/defs/mark"},
          {
            "type": "object",
            "properties": {
              "from": {"$ref": "#/refs/from"}
            }
          }
        ]
      }
    }
  };

  var marktype = {
    "refs": {
      "marktype": {
        "title": "Mark Type definition",
        "type": "string"
      }
    }
  };

  var onEvents = {
    "defs": {
      "listener": {
        "oneOf": [
          {"$ref": "#/refs/signal"},
          {
            "type": "object",
            "properties": {
              "scale": {"type": "string"}
            },
            "required": ["scale"]
          },
          {"$ref": "#/defs/stream"}
        ]
      },

      "onEvents": {
        "type": "array",
        "items": {
          "allOf": [
            {
              "type": "object",
              "properties": {
                "events": {
                  "oneOf": [
                    {"$ref": "#/refs/selector"},
                    {"$ref": "#/defs/listener"},
                    {
                      "type": "array",
                      "minItems": 1,
                      "items": {"$ref": "#/defs/listener"}
                    }
                  ]
                },
                "force": {"type": "boolean"}
              },
              "required": ["events"]
            },
            {
              "oneOf": [
                {
                  "type": "object",
                  "properties": {
                    "encode": {"type": "string"}
                  },
                  "required": ["encode"]
                },
                {
                  "type": "object",
                  "properties": {
                    "update": {
                      "oneOf": [
                        {"$ref": "#/refs/exprString"},
                        {"$ref": "#/refs/expr"},
                        {"$ref": "#/refs/signal"},
                        {
                          "type": "object",
                          "properties": {"value": {}},
                          "required": ["value"]
                        }
                      ]
                    }
                  },
                  "required": ["update"]
                }
              ]
            }
          ]
        }
      }
    }
  };

  var onTrigger = {
    "defs": {
      "onTrigger": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "trigger": {"$ref": "#/refs/exprString"},
            "insert": {"$ref": "#/refs/exprString"},
            "remove": {
              "oneOf": [
                {"type": "boolean"},
                {"$ref": "#/refs/exprString"}
              ]
            },
            "toggle": {"$ref": "#/refs/exprString"},
            "modify": {"$ref": "#/refs/exprString"},
            "values": {"$ref": "#/refs/exprString"}
          },
          "required": ["trigger"]
        }
      },
      "onMarkTrigger": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "trigger": {"$ref": "#/refs/exprString"},
            "modify": {"$ref": "#/refs/exprString"},
            "values": {"$ref": "#/refs/exprString"}
          },
          "required": ["trigger"]
        }
      }
    }
  };

  var padding = {
    "defs": {
      "padding": {
        "oneOf": [
          {
            "type": "number"
          },
          {
            "type": "object",
            "properties": {
              "top": {"type": "number"},
              "bottom": {"type": "number"},
              "left": {"type": "number"},
              "right": {"type": "number"}
            },
            "additionalProperties": false
          }
        ]
      }
    }
  };

  function orSignal(obj) {
    return {
      "oneOf": [
        {"$ref": "#/refs/signal"},
        obj
      ]
    };
  }

  var projection = {
    "defs": {
      "projection": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "type": {"$ref": "#/refs/stringOrSignal"},
          "clipAngle": {"$ref": "#/refs/numberOrSignal"},
          "clipExtent": orSignal({
            "type": "array",
            "items": orSignal({
              "type": "array",
              "items": {"$ref": "#/refs/numberOrSignal"},
              "minItems": 2,
              "maxItems": 2
            })
          }),
          "scale": {"$ref": "#/refs/numberOrSignal"},
          "translate": orSignal({
            "type": "array",
            "items": {"$ref": "#/refs/numberOrSignal"},
            "minItems": 2,
            "maxItems": 2
          }),
          "center": orSignal({
            "type": "array",
            "items": {"$ref": "#/refs/numberOrSignal"},
            "minItems": 2,
            "maxItems": 2
          }),
          "rotate": orSignal({
            "type": "array",
            "items": {"$ref": "#/refs/numberOrSignal"},
            "minItems": 2,
            "maxItems": 3
          }),
          "parallels": orSignal({
            "type": "array",
            "items": {"$ref": "#/refs/numberOrSignal"},
            "minItems": 2,
            "maxItems": 2
          }),
          "precision": {"$ref": "#/refs/numberOrSignal"},
          "pointRadius": {"$ref": "#/refs/numberOrSignal"},
          "fit": {
            "oneOf": [
              {"type": "object"},
              {"type": "array"}
            ]
          },
          "extent": orSignal({
            "type": "array",
            "items": orSignal({
              "type": "array",
              "items": {"$ref": "#/refs/numberOrSignal"},
              "minItems": 2,
              "maxItems": 2
            }),
            "minItems": 2,
            "maxItems": 2
          }),
          "size": orSignal({
            "type": "array",
            "items": {"$ref": "#/refs/numberOrSignal"},
            "minItems": 2,
            "maxItems": 2
          })
        },
        "additionalProperties": true,
        "required": ["name"]
      }
    }
  };

  var scope = {
    "defs": {
      "scope": {
        "type": "object",
        "properties": {
          "encode": {"$ref": "#/defs/encode"},
          "layout": {"$ref": "#/defs/layout"},
          "signals": {
            "type": "array",
            "items": {"$ref": "#/defs/signal"}
          },
          "data": {
            "type": "array",
            "items": {"$ref": "#/defs/data"}
          },
          "scales": {
            "type": "array",
            "items": {"$ref": "#/defs/scale"}
          },
          "projections": {
            "type": "array",
            "items": {"$ref": "#/defs/projection"}
          },
          "axes": {
            "type": "array",
            "items": {"$ref": "#/defs/axis"}
          },
          "legends": {
            "type": "array",
            "items": {"$ref": "#/defs/legend"}
          },
          "title": {"$ref": "#/defs/title"},
          "marks": {
            "type": "array",
            "items": {
              "oneOf": [
                {"$ref": "#/defs/markGroup"},
                {"$ref": "#/defs/markVisual"}
              ]
            }
          }
        }
      }
    }
  };

  var selector = {
    "refs": {
      "selector": {
        "title": "Event Selector String",
        "type": "string"
      }
    }
  };

  var signal = {
    "refs": {
      "signal": {
        "title": "SignalRef",
        "type": "object",
        "properties": {
          "signal": {"type": "string"}
        },
        "required": ["signal"]
      },
      "arrayOrSignal": {
        "oneOf": [
          {"type": "array"},
          {"$ref": "#/refs/signal"}
        ]
      },
      "booleanOrSignal": {
        "oneOf": [
          {"type": "boolean"},
          {"$ref": "#/refs/signal"}
        ]
      },
      "numberOrSignal": {
        "oneOf": [
          {"type": "number"},
          {"$ref": "#/refs/signal"}
        ]
      },
      "stringOrSignal": {
        "oneOf": [
          {"type": "string"},
          {"$ref": "#/refs/signal"}
        ]
      }
    },

    "defs": {
      "signal": {
        "oneOf": [
          {"$ref": "#/defs/signalPush"},
          {"$ref": "#/defs/signalNew"},
          {"$ref": "#/defs/signalInit"}
        ]
      },
      "signalName": {
        "type": "string",
        "not": {"enum": ["parent", "datum", "event", "item"]}
      },
      "signalNew": {
        "type": "object",
        "properties": {
          "name": {"$ref": "#/defs/signalName"},
          "description": {"type": "string"},
          "value": {},
          "react": {"type": "boolean", "default": true},
          "update": {"$ref": "#/refs/exprString"},
          "on": {"$ref": "#/defs/onEvents"},
          "bind": {"$ref": "#/defs/bind"}
        },
        "additionalProperties": false,
        "required": ["name"]
      },
      "signalInit": {
        "type": "object",
        "properties": {
          "name": {"$ref": "#/defs/signalName"},
          "description": {"type": "string"},
          "value": {},
          "init": {"$ref": "#/refs/exprString"},
          "on": {"$ref": "#/defs/onEvents"},
          "bind": {"$ref": "#/defs/bind"}
        },
        "additionalProperties": false,
        "required": ["name", "init"]
      },
      "signalPush": {
        "type": "object",
        "properties": {
          "name": {"$ref": "#/defs/signalName"},
          "push": {"enum": ["outer"]},
          "description": {"type": "string"},
          "on": {"$ref": "#/defs/onEvents"}
        },
        "additionalProperties": false,
        "required": ["name", "push"]
      }
    }
  };

  var stream = {
    "defs": {
      "streamParams": {
        "properties": {
          "between": {
            "type": "array",
            "minItems": 2,
            "maxItems": 2,
            "items": {"$ref": "#/defs/stream"}
          },
          "marktype": {"type": "string"},
          "markname": {"type": "string"},
          "filter": {
            "oneOf": [
              {"$ref": "#/refs/exprString"},
              {
                "type": "array",
                "minItems": 1,
                "items": {"$ref": "#/refs/exprString"},
              }
            ]
          },
          "throttle": {"type": "number"},
          "debounce": {"type": "number"},
          "consume": {"type": "boolean"}
        }
      },
      "streamEvents": {
        "properties": {
          "source": {"type": "string"},
          "type": {"type": "string"}
        },
        "required": ["type"]
      },
      "stream": {
        "title": "Input event stream definition",
        "type": "object",
        "allOf": [
          {"$ref": "#/defs/streamParams"},
          {
            "oneOf": [
              {"$ref": "#/defs/streamEvents"},
              {
                "type": "object",
                "properties": {
                  "stream": {"$ref": "#/defs/stream"}
                },
                "required": ["stream"]
              },
              {
                "type": "object",
                "properties": {
                  "merge": {
                    "type": "array",
                    "minItems": 1,
                    "items": {"$ref": "#/defs/stream"}
                  }
                },
                "required": ["merge"]
              }
            ]
          }
        ]
      }
    }
  };

  var title = {
    "defs": {
      "titleEncode": {
        "type": "object",
        "patternProperties": {
          "^(?!interactive|name|style).+$": {"$ref": "#/defs/encodeEntry"},
        },
        "additionalProperties": false
      },
      "title": {
        "oneOf": [
          {"type": "string"},
          {
            "type": "object",
            "properties": {
              "name": {"type": "string"},
              "orient": {
                "enum": [
                  "none",
                  "left",
                  "right",
                  "top",
                  "bottom"
                ],
                "default": "top"
              },
              "anchor": anchorValue,
              "frame": {
                "oneOf": [
                  {"enum": ["group", "bounds"]},
                  {"$ref": "#/refs/stringValue"}
                ]
              },
              "offset": numberValue,
              "style": {"$ref": "#/refs/style"},
              "text": stringOrSignal,
              "zindex": {"type": "number"},
              "interactive": {"type": "boolean"},

              "align": alignValue,
              "angle": numberValue,
              "baseline": baselineValue,
              "color": colorValue,
              "font": stringValue,
              "fontSize": numberValue,
              "fontWeight": fontWeightValue,
              "limit": numberValue,

              "encode": {"$ref": "#/defs/titleEncode"}
            },
            "required": ["text"],
            "additionalProperties": false
          }
        ]
      }
    }
  };

  function transformSchema(name, def) {
    function parameters(list) {
      list.forEach(function(param) {
        if (param.type === 'param') {
          var schema = {
            "oneOf": param.params.map(subParameterSchema)
          };
          props[param.name] = param.array
            ? {"type": "array", "items": schema}
            : schema;
        } else if (param.params) {
          parameters(param.params);
        } else {
          props[param.name] = parameterSchema(param);
          if (param.required) required.push(param.name);
        }
      });
    }

    var props = {
          "type": {"enum": [name]},
          "signal": {"type": "string"}
        },
        required = ["type"];

    parameters(def.params || []);

    var schema = {
      "type": "object",
      "properties": props,
      "additionalProperties": false,
      "required": required
    };

    return schema;
  }

  function parameterSchema(param) {
    var p = {};

    switch (param.type) {
      case 'projection':
      case 'data':
        p = {"type": "string"};
        break;
      case 'field':
        p = {
          "oneOf": [
            {"$ref": "#/refs/scaleField"},
            {"$ref": "#/refs/paramField"},
            {"$ref": "#/refs/expr"}
          ]
        };
        break;
      case 'compare':
        p = {"$ref": "#/refs/compare"};
        break;
      case 'enum':
        p = {
          "anyOf": [
            {"enum": param.values},
            {"$ref": "#/refs/signal"}
          ]
        };
        break;
      case 'expr':
        p = {"$ref": "#/refs/exprString"};
        break;
      case 'string':
        p = {"anyOf": [{"type": "string"}, {"$ref": "#/refs/signal"}]};
        break;
      case 'number':
        p = {"anyOf": [{"type": "number"}, {"$ref": "#/refs/signal"}]};
        break;
      case 'boolean':
        p = {"anyOf": [{"type": "boolean"}, {"$ref": "#/refs/signal"}]};
        break;
      case 'signal':
        p = {"$ref": "#/refs/signal"};
        break;
    }

    if (param.expr) {
      (p.anyOf || p.oneOf || (p = {"oneOf": [p]}).oneOf)
        .push({"$ref": "#/refs/expr"}, {"$ref": "#/refs/paramField"});
    }

    if (param.null) {
      (p.anyOf || p.oneOf || (p = {"oneOf": [p]}).oneOf)
        .push({"type": "null"});
    }

    if (param.array) {
      p = {
        "oneOf": [
          {"type": "array", "items": p},
          {"$ref": "#/refs/signal"}
        ]
      };
      if (param.length != null) {
        p.minItems = p.maxItems = param.length;
      }
      if (param.array === "nullable") {
        p.oneOf.push({"type": "null"});
      }
    }

    if (param.default) {
      p.default = param.default;
    }

    return p;
  }

  function subParameterSchema(sub) {
    var props = {},
        required = [],
        key = sub.key;

    for (var name in key) {
      props[name] = {"enum": [key[name]]};
      required.push(name);
    }

    sub.params.forEach(function(param) {
      props[param.name] = parameterSchema(param);
      if (param.required) required.push(param.name);
    });

    var schema = {
      "type": "object",
      "properties": props,
      "additionalProperties": false,
      "required": required
    };

    return schema;
  }

  function transform(definitions) {
    var transforms = [],
        marks = [],
        defs = {
          transform: {"oneOf": transforms},
          transformMark: {"oneOf": marks}
        };

    for (var i=0, n=definitions.length; i<n; ++i) {
      var def = definitions[i],
          name = def.type.toLowerCase(),
          key = name + 'Transform',
          ref = {"$ref": "#/defs/" + key},
          md = def.metadata;

      defs[key] = transformSchema(name, def);
      if (!(md.generates || md.changes)) marks.push(ref);
      transforms.push(ref);
    }

    return {"defs": defs};
  }

  function extend(target, source) {
    for (var key in source) {
      target[key] = source[key];
    }
  }

  function addModule(schema, module) {
    if (module.refs) extend(schema.refs, module.refs);
    if (module.defs) extend(schema.defs, module.defs);
  }

  function index(definitions) {
    var schema = {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "title": "Vega Visualization Specification Language",
      "defs": {},
      "refs": {},
      "type": "object",
      "allOf": [
        {"$ref": "#/defs/scope"},
        {
          "properties": {
            "$schema": {"type": "string", "format": "uri"},
            "usermeta": {"type": "object"},
            "config": {"type": "object"},
            "description": {"type": "string"},
            "width": {"type": "number"},
            "height": {"type": "number"},
            "padding": {"$ref": "#/defs/padding"},
            "autosize": {"$ref": "#/defs/autosize"},
            "background": {"$ref": "#/defs/background"}
          }
        }
      ]
    };

    [
      autosize,
      axis,
      background,
      bind,
      data,
      encode,
      expr,
      layout,
      legend,
      mark,
      marktype,
      onEvents,
      onTrigger,
      padding,
      projection,
      scale,
      scope,
      selector,
      signal,
      stream,
      title,
      transform(definitions)
    ].forEach(function(module) {
      addModule(schema, module);
    });

    return schema;
  }

  return index;

})));
