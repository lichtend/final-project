(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vega-dataflow'), require('vega-util')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vega-dataflow', 'vega-util'], factory) :
  (factory((global.vega = {}),global.vega,global.vega));
}(this, (function (exports,vegaDataflow,vegaUtil) { 'use strict';

  /**
   * Parse an expression given the argument signature and body code.
   */
  function expression(args, code, ctx) {
    // wrap code in return statement if expression does not terminate
    if (code[code.length-1] !== ';') {
      code = 'return(' + code + ');';
    }
    var fn = Function.apply(null, args.concat(code));
    return ctx && ctx.functions ? fn.bind(ctx.functions) : fn;
  }

  /**
   * Parse an expression used to update an operator value.
   */
  function operatorExpression(code, ctx) {
    return expression(['_'], code, ctx);
  }

  /**
   * Parse an expression provided as an operator parameter value.
   */
  function parameterExpression(code, ctx) {
    return expression(['datum', '_'], code, ctx);
  }

  /**
   * Parse an expression applied to an event stream.
   */
  function eventExpression(code, ctx) {
    return expression(['event'], code, ctx);
  }

  /**
   * Parse an expression used to handle an event-driven operator update.
   */
  function handlerExpression(code, ctx) {
    return expression(['_', 'event'], code, ctx);
  }

  /**
   * Parse an expression that performs visual encoding.
   */
  function encodeExpression(code, ctx) {
    return expression(['item', '_'], code, ctx);
  }

  /**
   * Parse a set of operator parameters.
   */
  function parseParameters(spec, ctx, params) {
    params = params || {};
    var key, value;

    for (key in spec) {
      value = spec[key];

      params[key] = vegaUtil.isArray(value)
        ? value.map(function(v) { return parseParameter(v, ctx, params); })
        : parseParameter(value, ctx, params);
    }
    return params;
  }

  /**
   * Parse a single parameter.
   */
  function parseParameter(spec, ctx, params) {
    if (!spec || !vegaUtil.isObject(spec)) return spec;

    for (var i=0, n=PARSERS.length, p; i<n; ++i) {
      p = PARSERS[i];
      if (spec.hasOwnProperty(p.key)) {
        return p.parse(spec, ctx, params);
      }
    }
    return spec;
  }

  /** Reference parsers. */
  var PARSERS = [
    {key: '$ref',      parse: getOperator},
    {key: '$key',      parse: getKey},
    {key: '$expr',     parse: getExpression},
    {key: '$field',    parse: getField},
    {key: '$encode',   parse: getEncode},
    {key: '$compare',  parse: getCompare},
    {key: '$context',  parse: getContext},
    {key: '$subflow',  parse: getSubflow},
    {key: '$tupleid',  parse: getTupleId}
  ];

  /**
   * Resolve an operator reference.
   */
  function getOperator(_, ctx) {
    return ctx.get(_.$ref) || vegaUtil.error('Operator not defined: ' + _.$ref);
  }

  /**
   * Resolve an expression reference.
   */
  function getExpression(_, ctx, params) {
    if (_.$params) { // parse expression parameters
      parseParameters(_.$params, ctx, params);
    }
    var k = 'e:' + _.$expr + '_' + _.$name;
    return ctx.fn[k]
      || (ctx.fn[k] = vegaUtil.accessor(parameterExpression(_.$expr, ctx), _.$fields, _.$name));
  }

  /**
   * Resolve a key accessor reference.
   */
  function getKey(_, ctx) {
    var k = 'k:' + _.$key + '_' + (!!_.$flat);
    return ctx.fn[k] || (ctx.fn[k] = vegaUtil.key(_.$key, _.$flat));
  }

  /**
   * Resolve a field accessor reference.
   */
  function getField(_, ctx) {
    if (!_.$field) return null;
    var k = 'f:' + _.$field + '_' + _.$name;
    return ctx.fn[k] || (ctx.fn[k] = vegaUtil.field(_.$field, _.$name));
  }

  /**
   * Resolve a comparator function reference.
   */
  function getCompare(_, ctx) {
    var k = 'c:' + _.$compare + '_' + _.$order,
        c = vegaUtil.array(_.$compare).map(function(_) {
          return (_ && _.$tupleid) ? vegaDataflow.tupleid : _;
        });
    return ctx.fn[k] || (ctx.fn[k] = vegaUtil.compare(c, _.$order));
  }

  /**
   * Resolve an encode operator reference.
   */
  function getEncode(_, ctx) {
    var spec = _.$encode,
        encode = {}, name, enc;

    for (name in spec) {
      enc = spec[name];
      encode[name] = vegaUtil.accessor(encodeExpression(enc.$expr, ctx), enc.$fields);
      encode[name].output = enc.$output;
    }
    return encode;
  }

  /**
   * Resolve a context reference.
   */
  function getContext(_, ctx) {
    return ctx;
  }

  /**
   * Resolve a recursive subflow specification.
   */
  function getSubflow(_, ctx) {
    var spec = _.$subflow;
    return function(dataflow, key, parent) {
      var subctx = parseDataflow(spec, ctx.fork()),
          op = subctx.get(spec.operators[0].id),
          p = subctx.signals.parent;
      if (p) p.set(parent);
      return op;
    };
  }

  /**
   * Resolve a tuple id reference.
   */
  function getTupleId() {
    return vegaDataflow.tupleid;
  }

  function canonicalType(type) {
    return (type + '').toLowerCase();
  }
  function isOperator(type) {
     return canonicalType(type) === 'operator';
  }

  function isCollect(type) {
    return canonicalType(type) === 'collect';
  }

  /**
   * Parse a dataflow operator.
   */
  function parseOperator(spec, ctx) {
    if (isOperator(spec.type) || !spec.type) {
      ctx.operator(spec,
        spec.update ? operatorExpression(spec.update, ctx) : null);
    } else {
      ctx.transform(spec, spec.type);
    }
  }

  /**
   * Parse and assign operator parameters.
   */
  function parseOperatorParameters(spec, ctx) {
    if (spec.params) {
      var op = ctx.get(spec.id);
      if (!op) vegaUtil.error('Invalid operator id: ' + spec.id);
      ctx.dataflow.connect(op, op.parameters(
        parseParameters(spec.params, ctx),
        spec.react,
        spec.initonly
      ));
    }
  }

  /**
   * Parse an event stream specification.
   */
  function parseStream(spec, ctx) {
    var filter = spec.filter != null ? eventExpression(spec.filter, ctx) : undefined,
        stream = spec.stream != null ? ctx.get(spec.stream) : undefined,
        args;

    if (spec.source) {
      stream = ctx.events(spec.source, spec.type, filter);
    }
    else if (spec.merge) {
      args = spec.merge.map(ctx.get.bind(ctx));
      stream = args[0].merge.apply(args[0], args.slice(1));
    }

    if (spec.between) {
      args = spec.between.map(ctx.get.bind(ctx));
      stream = stream.between(args[0], args[1]);
    }

    if (spec.filter) {
      stream = stream.filter(filter);
    }

    if (spec.throttle != null) {
      stream = stream.throttle(+spec.throttle);
    }

    if (spec.debounce != null) {
      stream = stream.debounce(+spec.debounce);
    }

    if (stream == null) {
      vegaUtil.error('Invalid stream definition: ' + JSON.stringify(spec));
    }

    if (spec.consume) stream.consume(true);

    ctx.stream(spec, stream);
  }

  /**
   * Parse an event-driven operator update.
   */
  function parseUpdate(spec, ctx) {
    var srcid = vegaUtil.isObject(srcid = spec.source) ? srcid.$ref : srcid,
        source = ctx.get(srcid),
        target = null,
        update = spec.update,
        params = undefined;

    if (!source) vegaUtil.error('Source not defined: ' + spec.source);

    if (spec.target && spec.target.$expr) {
      target = eventExpression(spec.target.$expr, ctx);
    } else {
      target = ctx.get(spec.target);
    }

    if (update && update.$expr) {
      if (update.$params) {
        params = parseParameters(update.$params, ctx);
      }
      update = handlerExpression(update.$expr, ctx);
    }

    ctx.update(spec, source, target, update, params);
  }

  /**
   * Parse a serialized dataflow specification.
   */
  function parseDataflow(spec, ctx) {
    var operators = spec.operators || [];

    // parse background
    if (spec.background) {
      ctx.background = spec.background;
    }

    // parse event configuration
    if (spec.eventConfig) {
      ctx.eventConfig = spec.eventConfig;
    }

    // parse operators
    operators.forEach(function(entry) {
      parseOperator(entry, ctx);
    });

    // parse operator parameters
    operators.forEach(function(entry) {
      parseOperatorParameters(entry, ctx);
    });

    // parse streams
    (spec.streams || []).forEach(function(entry) {
      parseStream(entry, ctx);
    });

    // parse updates
    (spec.updates || []).forEach(function(entry) {
      parseUpdate(entry, ctx);
    });

    return ctx.resolve();
  }

  var SKIP = {skip: true};

  function getState(options) {
    var ctx = this,
        state = {};

    if (options.signals) {
      var signals = (state.signals = {});
      Object.keys(ctx.signals).forEach(function(key) {
        var op = ctx.signals[key];
        if (options.signals(key, op)) {
          signals[key] = op.value;
        }
      });
    }

    if (options.data) {
      var data = (state.data = {});
      Object.keys(ctx.data).forEach(function(key) {
        var dataset = ctx.data[key];
        if (options.data(key, dataset)) {
          data[key] = dataset.input.value;
        }
      });
    }

    if (ctx.subcontext && options.recurse !== false) {
      state.subcontext = ctx.subcontext.map(function(ctx) {
        return ctx.getState(options);
      });
    }

    return state;
  }

  function setState(state) {
    var ctx = this,
        df = ctx.dataflow,
        data = state.data,
        signals = state.signals;

    Object.keys(signals || {}).forEach(function(key) {
      df.update(ctx.signals[key], signals[key], SKIP);
    });

    Object.keys(data || {}).forEach(function(key) {
      df.pulse(
        ctx.data[key].input,
        df.changeset().remove(vegaUtil.truthy).insert(data[key])
      );
    });

    (state.subcontext  || []).forEach(function(substate, i) {
      var subctx = ctx.subcontext[i];
      if (subctx) subctx.setState(substate);
    });
  }

  /**
   * Context objects store the current parse state.
   * Enables lookup of parsed operators, event streams, accessors, etc.
   * Provides a 'fork' method for creating child contexts for subflows.
   */
  function context(df, transforms, functions) {
    return new Context(df, transforms, functions);
  }

  function Context(df, transforms, functions) {
    this.dataflow = df;
    this.transforms = transforms;
    this.events = df.events.bind(df);
    this.signals = {};
    this.scales = {};
    this.nodes = {};
    this.data = {};
    this.fn = {};
    if (functions) {
      this.functions = Object.create(functions);
      this.functions.context = this;
    }
  }

  function ContextFork(ctx) {
    this.dataflow = ctx.dataflow;
    this.transforms = ctx.transforms;
    this.functions = ctx.functions;
    this.events = ctx.events;
    this.signals = Object.create(ctx.signals);
    this.scales = Object.create(ctx.scales);
    this.nodes = Object.create(ctx.nodes);
    this.data = Object.create(ctx.data);
    this.fn = Object.create(ctx.fn);
    if (ctx.functions) {
      this.functions = Object.create(ctx.functions);
      this.functions.context = this;
    }
  }

  Context.prototype = ContextFork.prototype = {
    fork: function() {
      var ctx = new ContextFork(this);
      (this.subcontext || (this.subcontext = [])).push(ctx);
      return ctx;
    },
    get: function(id) {
      return this.nodes[id];
    },
    set: function(id, node) {
      return this.nodes[id] = node;
    },
    add: function(spec, op) {
      var ctx = this,
          df = ctx.dataflow,
          data;

      ctx.set(spec.id, op);

      if (isCollect(spec.type) && (data = spec.value)) {
        if (data.$ingest) {
          df.ingest(op, data.$ingest, data.$format);
        } else if (data.$load) {
          ctx.get(data.$load.$ref).target = op;
        } else if (data.$request) {
          df.request(op, data.$request, data.$format);
        } else {
          df.pulse(op, df.changeset().insert(data));
        }
      }

      if (spec.root) {
        ctx.root = op;
      }

      if (spec.parent) {
        var p = ctx.get(spec.parent.$ref);
        if (p) {
          df.connect(p, [op]);
          op.targets().add(p);
        } else {
          (ctx.unresolved = ctx.unresolved || []).push(function() {
            p = ctx.get(spec.parent.$ref);
            df.connect(p, [op]);
            op.targets().add(p);
          });
        }
      }

      if (spec.signal) {
        ctx.signals[spec.signal] = op;
      }

      if (spec.scale) {
        ctx.scales[spec.scale] = op;
      }

      if (spec.data) {
        for (var name in spec.data) {
          data = ctx.data[name] || (ctx.data[name] = {});
          spec.data[name].forEach(function(role) { data[role] = op; });
        }
      }
    },
    resolve: function() {
      (this.unresolved || []).forEach(function(fn) { fn(); });
      delete this.unresolved;
      return this;
    },
    operator: function(spec, update) {
      this.add(spec, this.dataflow.add(spec.value, update));
    },
    transform: function(spec, type) {
      this.add(spec, this.dataflow.add(this.transforms[canonicalType(type)]));
    },
    stream: function(spec, stream) {
      this.set(spec.id, stream);
    },
    update: function(spec, stream, target, update, params) {
      this.dataflow.on(stream, target, update, params, spec.options);
    },
    getState: getState,
    setState: setState
  };

  exports.parse = parseDataflow;
  exports.context = context;
  exports.expression = expression;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
