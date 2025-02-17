(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array'), require('vega-parser'), require('vega-runtime'), require('d3-timer'), require('vega-dataflow'), require('vega-util'), require('vega-scenegraph')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-array', 'vega-parser', 'vega-runtime', 'd3-timer', 'vega-dataflow', 'vega-util', 'vega-scenegraph'], factory) :
  (factory((global.vega = {}),global.d3,global.vega,global.vega,global.d3,global.vega,global.vega,global.vega));
}(this, (function (exports,d3Array,vegaParser,vegaRuntime,d3Timer,vegaDataflow,vegaUtil,vegaScenegraph) { 'use strict';

  var Default = 'default';

  function cursor(view) {
    var cursor = view._signals.cursor;

    // add cursor signal to dataflow, if needed
    if (!cursor) {
      view._signals.cursor = (cursor = view.add({user: Default, item: null}));
    }

    // evaluate cursor on each mousemove event
    view.on(view.events('view', 'mousemove'), cursor,
      function(_, event) {
        var value = cursor.value,
            user = value ? (vegaUtil.isString(value) ? value : value.user) : Default,
            item = event.item && event.item.cursor || null;

        return (value && user === value.user && item == value.item) ? value
          : {user: user, item: item};
      }
    );

    // when cursor signal updates, set visible cursor
    view.add(null, function(_) {
      var user = _.cursor,
          item = this.value;

      if (!vegaUtil.isString(user)) {
        item = user.item;
        user = user.user;
      }

      setCursor(user && user !== Default ? user : (item || user));

      return item;
    }, {cursor: cursor});
  }

  function setCursor(cursor) {
    // set cursor on document body
    // this ensures cursor applies even if dragging out of view
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.cursor = cursor;
    }
  }

  function dataref(view, name) {
    var data = view._runtime.data;
    if (!data.hasOwnProperty(name)) {
      vegaUtil.error('Unrecognized data set: ' + name);
    }
    return data[name];
  }

  function data(name) {
    return dataref(this, name).values.value;
  }

  function change(name, changes) {
    if (!vegaDataflow.isChangeSet(changes)) {
      vegaUtil.error('Second argument to changes must be a changeset.');
    }
    var dataset = dataref(this, name);
    dataset.modified = true;
    return this.pulse(dataset.input, changes);
  }

  function insert(name, _) {
    return change.call(this, name, vegaDataflow.changeset().insert(_));
  }

  function remove(name, _) {
    return change.call(this, name, vegaDataflow.changeset().remove(_));
  }

  function width(view) {
    var padding = view.padding();
    return Math.max(0, view._viewWidth + padding.left + padding.right);
  }

  function height(view) {
    var padding = view.padding();
    return Math.max(0, view._viewHeight + padding.top + padding.bottom);
  }

  function offset(view) {
    var padding = view.padding(),
        origin = view._origin;
    return [
      padding.left + origin[0],
      padding.top + origin[1]
    ];
  }

  function resizeRenderer(view) {
    var origin = offset(view),
        w = width(view),
        h = height(view);

    view._renderer.background(view._background);
    view._renderer.resize(w, h, origin);
    view._handler.origin(origin);

    view._resizeListeners.forEach(function(handler) {
      try {
        handler(w, h);
      } catch (error) {
        view.error(error);
      }
    });
  }

  /**
   * Extend an event with additional view-specific methods.
   * Adds a new property ('vega') to an event that provides a number
   * of methods for querying information about the current interaction.
   * The vega object provides the following methods:
   *   view - Returns the backing View instance.
   *   item - Returns the currently active scenegraph item (if any).
   *   group - Returns the currently active scenegraph group (if any).
   *     This method accepts a single string-typed argument indicating the name
   *     of the desired parent group. The scenegraph will be traversed from
   *     the item up towards the root to search for a matching group. If no
   *     argument is provided the enclosing group for the active item is
   *     returned, unless the item it itself a group, in which case it is
   *     returned directly.
   *   xy - Returns a two-element array containing the x and y coordinates for
   *     mouse or touch events. For touch events, this is based on the first
   *     elements in the changedTouches array. This method accepts a single
   *     argument: either an item instance or mark name that should serve as
   *     the reference coordinate system. If no argument is provided the
   *     top-level view coordinate system is assumed.
   *   x - Returns the current x-coordinate, accepts the same arguments as xy.
   *   y - Returns the current y-coordinate, accepts the same arguments as xy.
   * @param {Event} event - The input event to extend.
   * @param {Item} item - The currently active scenegraph item (if any).
   * @return {Event} - The extended input event.
   */
  function eventExtend(view, event, item) {
    var el = view._renderer.canvas(),
        p, e, translate;

    if (el) {
      translate = offset(view);
      e = event.changedTouches ? event.changedTouches[0] : event;
      p = vegaScenegraph.point(e, el);
      p[0] -= translate[0];
      p[1] -= translate[1];
    }

    event.dataflow = view;
    event.vega = extension(view, item, p);
    event.item = item;
    return event;
  }

  function extension(view, item, point) {
    var itemGroup = item
      ? item.mark.marktype === 'group' ? item : item.mark.group
      : null;

    function group(name) {
      var g = itemGroup, i;
      if (name) for (i = item; i; i = i.mark.group) {
        if (i.mark.name === name) { g = i; break; }
      }
      return g && g.mark && g.mark.interactive ? g : {};
    }

    function xy(item) {
      if (!item) return point;
      if (vegaUtil.isString(item)) item = group(item);

      var p = point.slice();
      while (item) {
        p[0] -= item.x || 0;
        p[1] -= item.y || 0;
        item = item.mark && item.mark.group;
      }
      return p;
    }

    return {
      view:  vegaUtil.constant(view),
      item:  vegaUtil.constant(item || {}),
      group: group,
      xy:    xy,
      x:     function(item) { return xy(item)[0]; },
      y:     function(item) { return xy(item)[1]; }
    };
  }

  var VIEW = 'view',
      TIMER = 'timer',
      WINDOW = 'window',
      NO_TRAP = {trap: false};

  /**
   * Initialize event handling configuration.
   * @param {object} config - The configuration settings.
   * @return {object}
   */
  function initializeEventConfig(config) {
    config = vegaUtil.extend({}, config);

    var def = config.defaults;
    if (def) {
      if (vegaUtil.isArray(def.prevent)) {
        def.prevent = vegaUtil.toSet(def.prevent);
      }
      if (vegaUtil.isArray(def.allow)) {
        def.allow = vegaUtil.toSet(def.allow);
      }
    }

    return config;
  }

  function prevent(view, type) {
    var def = view._eventConfig.defaults,
        prevent = def && def.prevent,
        allow = def && def.allow;

    return prevent === false || allow === true ? false
      : prevent === true || allow === false ? true
      : prevent ? prevent[type]
      : allow ? !allow[type]
      : view.preventDefault();
  }

  /**
   * Create a new event stream from an event source.
   * @param {object} source - The event source to monitor.
   * @param {string} type - The event type.
   * @param {function(object): boolean} [filter] - Event filter function.
   * @return {EventStream}
   */
  function events(source, type, filter) {
    var view = this,
        s = new vegaDataflow.EventStream(filter),
        send = function(e, item) {
          if (source === VIEW && prevent(view, type)) {
            e.preventDefault();
          }
          try {
            s.receive(eventExtend(view, e, item));
          } catch (error) {
            view.error(error);
          } finally {
            view.run();
          }
        },
        sources;

    if (source === TIMER) {
      view.timer(send, type);
    }

    else if (source === VIEW) {
      // send traps errors, so use {trap: false} option
      view.addEventListener(type, send, NO_TRAP);
    }

    else {
      if (source === WINDOW) {
        if (typeof window !== 'undefined') sources = [window];
      } else if (typeof document !== 'undefined') {
        sources = document.querySelectorAll(source);
      }

      if (!sources) {
        view.warn('Can not resolve event source: ' + source);
      } else {
        for (var i=0, n=sources.length; i<n; ++i) {
          sources[i].addEventListener(type, send);
        }

        view._eventListeners.push({
          type:    type,
          sources: sources,
          handler: send
        });
      }
    }

    return s;
  }

  function itemFilter(event) {
    return event.item;
  }

  function markTarget(event) {
    // grab upstream collector feeding the mark operator
    var source = event.item.mark.source;
    return source.source || source;
  }

  function invoke(name) {
    return function(_, event) {
      return event.vega.view()
        .changeset()
        .encode(event.item, name);
    };
  }

  function hover(hoverSet, leaveSet) {
    hoverSet = [hoverSet || 'hover'];
    leaveSet = [leaveSet || 'update', hoverSet[0]];

    // invoke hover set upon mouseover
    this.on(
      this.events('view', 'mouseover', itemFilter),
      markTarget,
      invoke(hoverSet)
    );

    // invoke leave set upon mouseout
    this.on(
      this.events('view', 'mouseout', itemFilter),
      markTarget,
      invoke(leaveSet)
    );

    return this;
  }

  /**
   * Finalize a View instance that is being removed.
   * Cancel any running timers.
   * Remove all external event listeners.
   * Remove any currently displayed tooltip.
   */
  function finalize() {
    var tooltip = this._tooltip,
        timers = this._timers,
        listeners = this._eventListeners,
        n, m, e;

    n = timers.length;
    while (--n >= 0) {
      timers[n].stop();
    }

    n = listeners.length;
    while (--n >= 0) {
      e = listeners[n];
      m = e.sources.length;
      while (--m >= 0) {
        e.sources[m].removeEventListener(e.type, e.handler);
      }
    }

    if (tooltip) {
      tooltip.call(this, this._handler, null, null, null);
    }

    return this;
  }

  function element(tag, attr, text) {
    var el = document.createElement(tag);
    for (var key in attr) el.setAttribute(key, attr[key]);
    if (text != null) el.textContent = text;
    return el;
  }

  var BindClass = 'vega-bind',
      NameClass = 'vega-bind-name',
      RadioClass = 'vega-bind-radio',
      OptionClass = 'vega-option-';

  /**
   * Bind a signal to an external HTML input element. The resulting two-way
   * binding will propagate input changes to signals, and propagate signal
   * changes to the input element state. If this view instance has no parent
   * element, we assume the view is headless and no bindings are created.
   * @param {Element|string} el - The parent DOM element to which the input
   *   element should be appended as a child. If string-valued, this argument
   *   will be treated as a CSS selector. If null or undefined, the parent
   *   element of this view will be used as the element.
   * @param {object} param - The binding parameters which specify the signal
   *   to bind to, the input element type, and type-specific configuration.
   * @return {View} - This view instance.
   */
  function bind(view, el, binding) {
    if (!el) return;

    var param = binding.param,
        bind = binding.state;

    if (!bind) {
      bind = binding.state = {
        elements: null,
        active: false,
        set: null,
        update: function(value) {
          if (value !== view.signal(param.signal)) {
            bind.source = true;
            view.signal(param.signal, value).run();
          }
        }
      };
      if (param.debounce) {
        bind.update = vegaUtil.debounce(param.debounce, bind.update);
      }
    }

    generate(bind, el, param, view.signal(param.signal));

    if (!bind.active) {
      view.on(view._signals[param.signal], null, function() {
        bind.source
          ? (bind.source = false)
          : bind.set(view.signal(param.signal));
      });
      bind.active = true;
    }

    return bind;
  }

  /**
   * Generate an HTML input form element and bind it to a signal.
   */
  function generate(bind, el, param, value) {
    var div = element('div', {'class': BindClass});

    div.appendChild(element('span',
      {'class': NameClass},
      (param.name || param.signal)
    ));

    el.appendChild(div);

    var input = form;
    switch (param.input) {
      case 'checkbox': input = checkbox; break;
      case 'select':   input = select; break;
      case 'radio':    input = radio; break;
      case 'range':    input = range; break;
    }

    input(bind, div, param, value);
  }

  /**
   * Generates an arbitrary input form element.
   * The input type is controlled via user-provided parameters.
   */
  function form(bind, el, param, value) {
    var node = element('input');

    for (var key in param) {
      if (key !== 'signal' && key !== 'element') {
        node.setAttribute(key === 'input' ? 'type' : key, param[key]);
      }
    }
    node.setAttribute('name', param.signal);
    node.value = value;

    el.appendChild(node);

    node.addEventListener('input', function() {
      bind.update(node.value);
    });

    bind.elements = [node];
    bind.set = function(value) { node.value = value; };
  }

  /**
   * Generates a checkbox input element.
   */
  function checkbox(bind, el, param, value) {
    var attr = {type: 'checkbox', name: param.signal};
    if (value) attr.checked = true;
    var node = element('input', attr);

    el.appendChild(node);

    node.addEventListener('change', function() {
      bind.update(node.checked);
    });

    bind.elements = [node];
    bind.set = function(value) { node.checked = !!value || null; };
  }

  /**
   * Generates a selection list input element.
   */
  function select(bind, el, param, value) {
    var node = element('select', {name: param.signal});

    param.options.forEach(function(option) {
      var attr = {value: option};
      if (valuesEqual(option, value)) attr.selected = true;
      node.appendChild(element('option', attr, option+''));
    });

    el.appendChild(node);

    node.addEventListener('change', function() {
      bind.update(param.options[node.selectedIndex]);
    });

    bind.elements = [node];
    bind.set = function(value) {
      for (var i=0, n=param.options.length; i<n; ++i) {
        if (valuesEqual(param.options[i], value)) {
          node.selectedIndex = i; return;
        }
      }
    };
  }

  /**
   * Generates a radio button group.
   */
  function radio(bind, el, param, value) {
    var group = element('span', {'class': RadioClass});

    el.appendChild(group);

    bind.elements = param.options.map(function(option) {
      var id = OptionClass + param.signal + '-' + option;

      var attr = {
        id:    id,
        type:  'radio',
        name:  param.signal,
        value: option
      };
      if (valuesEqual(option, value)) attr.checked = true;

      var input = element('input', attr);

      input.addEventListener('change', function() {
        bind.update(option);
      });

      group.appendChild(input);
      group.appendChild(element('label', {'for': id}, option+''));

      return input;
    });

    bind.set = function(value) {
      var nodes = bind.elements,
          i = 0,
          n = nodes.length;
      for (; i<n; ++i) {
        if (valuesEqual(nodes[i].value, value)) nodes[i].checked = true;
      }
    };
  }

  /**
   * Generates a slider input element.
   */
  function range(bind, el, param, value) {
    value = value !== undefined ? value : ((+param.max) + (+param.min)) / 2;

    var min = param.min || Math.min(0, +value) || 0,
        max = param.max || Math.max(100, +value) || 100,
        step = param.step || d3Array.tickStep(min, max, 100);

    var node = element('input', {
      type:  'range',
      name:  param.signal,
      min:   min,
      max:   max,
      step:  step
    });
    node.value = value;

    var label = element('label', {}, +value);

    el.appendChild(node);
    el.appendChild(label);

    function update() {
      label.textContent = node.value;
      bind.update(+node.value);
    }

    // subscribe to both input and change
    node.addEventListener('input', update);
    node.addEventListener('change', update);

    bind.elements = [node];
    bind.set = function(value) {
      node.value = value;
      label.textContent = value;
    };
  }

  function valuesEqual(a, b) {
    return a === b || (a+'' === b+'');
  }

  function initializeRenderer(view, r, el, constructor, scaleFactor) {
    r = r || new constructor(view.loader());
    return r
      .initialize(el, width(view), height(view), offset(view), scaleFactor)
      .background(view._background);
  }

  function trap(view, fn) {
    return !fn ? null : function() {
      try {
        fn.apply(this, arguments);
      } catch (error) {
        view.error(error);
      }
    };
  }

  function initializeHandler(view, prevHandler, el, constructor) {
    // instantiate scenegraph handler
    var handler = new constructor(view.loader(), trap(view, view.tooltip()))
      .scene(view.scenegraph().root)
      .initialize(el, offset(view), view);

    // transfer event handlers
    if (prevHandler) {
      prevHandler.handlers().forEach(function(h) {
        handler.on(h.type, h.handler);
      });
    }

    return handler;
  }

  function initialize(el, elBind) {
    var view = this,
        type = view._renderType,
        module = vegaScenegraph.renderModule(type),
        Handler, Renderer;

    // containing dom element
    el = view._el = el ? lookup(view, el) : null;

    // select appropriate renderer & handler
    if (!module) view.error('Unrecognized renderer type: ' + type);
    Handler = module.handler || vegaScenegraph.CanvasHandler;
    Renderer = (el ? module.renderer : module.headless);

    // initialize renderer and input handler
    view._renderer = !Renderer ? null
      : initializeRenderer(view, view._renderer, el, Renderer);
    view._handler = initializeHandler(view, view._handler, el, Handler);
    view._redraw = true;

    // initialize signal bindings
    if (el) {
      elBind = elBind ? lookup(view, elBind)
        : el.appendChild(element('div', {'class': 'vega-bindings'}));

      view._bind.forEach(function(_) {
        if (_.param.element) {
          _.element = lookup(view, _.param.element);
        }
      });

      view._bind.forEach(function(_) {
        bind(view, _.element || elBind, _);
      });
    }

    return view;
  }

  function lookup(view, el) {
    if (typeof el === 'string') {
      if (typeof document !== 'undefined') {
        el = document.querySelector(el);
        if (!el) {
          view.error('Signal bind element not found: ' + el);
          return null;
        }
      } else {
        view.error('DOM document instance not found.');
        return null;
      }
    }
    if (el) {
      try {
        el.innerHTML = '';
      } catch (e) {
        el = null;
        view.error(e);
      }
    }
    return el;
  }

  /**
   * Render the current scene in a headless fashion.
   * This method is asynchronous, returning a Promise instance.
   * @return {Promise} - A Promise that resolves to a renderer.
   */
  function renderHeadless(view, type, scaleFactor) {
    var module = vegaScenegraph.renderModule(type),
        ctr = module && module.headless;
    return !ctr
      ? Promise.reject('Unrecognized renderer type: ' + type)
      : view.runAsync().then(function() {
          return initializeRenderer(view, null, null, ctr, scaleFactor)
            .renderAsync(view._scenegraph.root);
        });
  }

  /**
   * Produce an image URL for the visualization. Depending on the type
   * parameter, the generated URL contains data for either a PNG or SVG image.
   * The URL can be used (for example) to download images of the visualization.
   * This method is asynchronous, returning a Promise instance.
   * @param {string} type - The image type. One of 'svg', 'png' or 'canvas'.
   *   The 'canvas' and 'png' types are synonyms for a PNG image.
   * @return {Promise} - A promise that resolves to an image URL.
   */
  function renderToImageURL(type, scaleFactor) {
    return (type !== vegaScenegraph.RenderType.Canvas && type !== vegaScenegraph.RenderType.SVG && type !== vegaScenegraph.RenderType.PNG)
      ? Promise.reject('Unrecognized image type: ' + type)
      : renderHeadless(this, type, scaleFactor).then(function(renderer) {
          return type === vegaScenegraph.RenderType.SVG
            ? toBlobURL(renderer.svg(), 'image/svg+xml')
            : renderer.canvas().toDataURL('image/png');
        });
  }

  function toBlobURL(data, mime) {
    var blob = new Blob([data], {type: mime});
    return window.URL.createObjectURL(blob);
  }

  /**
   * Produce a Canvas instance containing a rendered visualization.
   * This method is asynchronous, returning a Promise instance.
   * @return {Promise} - A promise that resolves to a Canvas instance.
   */
  function renderToCanvas(scaleFactor) {
    return renderHeadless(this, vegaScenegraph.RenderType.Canvas, scaleFactor)
      .then(function(renderer) { return renderer.canvas(); });
  }

  /**
   * Produce a rendered SVG string of the visualization.
   * This method is asynchronous, returning a Promise instance.
   * @return {Promise} - A promise that resolves to an SVG string.
   */
  function renderToSVG(scaleFactor) {
    return renderHeadless(this, vegaScenegraph.RenderType.SVG, scaleFactor)
      .then(function(renderer) { return renderer.svg(); });
  }

  function runtime(view, spec, functions) {
    var fn = functions || vegaParser.functionContext;
    return vegaRuntime.parse(spec, vegaRuntime.context(view, vegaDataflow.transforms, fn));
  }

  function scale(name) {
    var scales = this._runtime.scales;
    if (!scales.hasOwnProperty(name)) {
      vegaUtil.error('Unrecognized scale or projection: ' + name);
    }
    return scales[name].value;
  }

  var Width = 'width',
      Height = 'height',
      Padding = 'padding',
      Skip = {skip: true};

  function viewWidth(view, width) {
    var a = view.autosize(),
        p = view.padding();
    return width - (a && a.contains === Padding ? p.left + p.right : 0);
  }

  function viewHeight(view, height) {
    var a = view.autosize(),
        p = view.padding();
    return height - (a && a.contains === Padding ? p.top + p.bottom : 0);
  }

  function initializeResize(view) {
    var s = view._signals,
        w = s[Width],
        h = s[Height],
        p = s[Padding];

    function resetSize() {
      view._autosize = view._resize = 1;
    }

    // respond to width signal
    view._resizeWidth = view.add(null,
      function(_) {
        view._width = _.size;
        view._viewWidth = viewWidth(view, _.size);
        resetSize();
      },
      {size: w}
    );

    // respond to height signal
    view._resizeHeight = view.add(null,
      function(_) {
        view._height = _.size;
        view._viewHeight = viewHeight(view, _.size);
        resetSize();
      },
      {size: h}
    );

    // respond to padding signal
    var resizePadding = view.add(null, resetSize, {pad: p});

    // set rank to run immediately after source signal
    view._resizeWidth.rank = w.rank + 1;
    view._resizeHeight.rank = h.rank + 1;
    resizePadding.rank = p.rank + 1;
  }

  function resizeView(viewWidth, viewHeight, width, height, origin, auto) {
    this.runAfter(function(view) {
      var rerun = 0;

      // reset autosize flag
      view._autosize = 0;

      // width value changed: update signal, skip resize op
      if (view.width() !== width) {
        rerun = 1;
        view.signal(Width, width, Skip); // set width, skip update calc
        view._resizeWidth.skip(true); // skip width resize handler
      }

      // height value changed: update signal, skip resize op
      if (view.height() !== height) {
        rerun = 1;
        view.signal(Height, height, Skip); // set height, skip update calc
        view._resizeHeight.skip(true); // skip height resize handler
      }

      // view width changed: update view property, set resize flag
      if (view._viewWidth !== viewWidth) {
        view._resize = 1;
        view._viewWidth = viewWidth;
      }

      // view height changed: update view property, set resize flag
      if (view._viewHeight !== viewHeight) {
        view._resize = 1;
        view._viewHeight = viewHeight;
      }

      // origin changed: update view property, set resize flag
      if (view._origin[0] !== origin[0] || view._origin[1] !== origin[1]) {
        view._resize = 1;
        view._origin = origin;
      }

      // run dataflow on width/height signal change
      if (rerun) view.run('enter');
      if (auto) view.runAfter(function() { view.resize(); });
    }, false, 1);
  }

  /**
   * Get the current view state, consisting of signal values and/or data sets.
   * @param {object} [options] - Options flags indicating which state to export.
   *   If unspecified, all signals and data sets will be exported.
   * @param {function(string, Operator):boolean} [options.signals] - Optional
   *   predicate function for testing if a signal should be included in the
   *   exported state. If unspecified, all signals will be included, except for
   *   those named 'parent' or those which refer to a Transform value.
   * @param {function(string, object):boolean} [options.data] - Optional
   *   predicate function for testing if a data set's input should be included
   *   in the exported state. If unspecified, all data sets that have been
   *   explicitly modified will be included.
   * @param {boolean} [options.recurse=true] - Flag indicating if the exported
   *   state should recursively include state from group mark sub-contexts.
   * @return {object} - An object containing the exported state values.
   */
  function getState(options) {
    return this._runtime.getState(options || {
      data:    dataTest,
      signals: signalTest,
      recurse: true
    });
  }

  function dataTest(name, data) {
    return data.modified
        && vegaUtil.isArray(data.input.value)
        && name.indexOf('_:vega:_');
  }

  function signalTest(name, op) {
    return !(name === 'parent' || op instanceof vegaDataflow.transforms.proxy);
  }

  /**
   * Sets the current view state and updates the view by invoking run.
   * @param {object} state - A state object containing signal and/or
   *   data set values, following the format used by the getState method.
   * @return {View} - This view instance.
   */
  function setState(state) {
    var view = this;
    view.runAfter(function() {
      view._trigger = false;
      view._runtime.setState(state);
      view.run().runAfter(function() { view._trigger = true; });
    });
    return this;
  }

  function timer(callback, delay) {
    function tick(elapsed) {
      callback({timestamp: Date.now(), elapsed: elapsed});
    }
    this._timers.push(d3Timer.interval(tick, delay));
  }

  function defaultTooltip(handler, event, item, value) {
    var el = handler.element();
    if (el) el.setAttribute('title', formatTooltip(value));
  }

  function formatTooltip(value) {
    return value == null ? ''
      : vegaUtil.isArray(value) ? formatArray(value)
      : vegaUtil.isObject(value) && !vegaUtil.isDate(value) ? formatObject(value)
      : value + '';
  }

  function formatObject(obj) {
    return Object.keys(obj).map(function(key) {
      var v = obj[key];
      return key + ': ' + (vegaUtil.isArray(v) ? formatArray(v) : formatValue(v));
    }).join('\n');
  }

  function formatArray(value) {
    return '[' + value.map(formatValue).join(', ') + ']';
  }

  function formatValue(value) {
    return vegaUtil.isArray(value) ? '[\u2026]'
      : vegaUtil.isObject(value) && !vegaUtil.isDate(value) ? '{\u2026}'
      : value;
  }

  /**
   * Create a new View instance from a Vega dataflow runtime specification.
   * The generated View will not immediately be ready for display. Callers
   * should also invoke the initialize method (e.g., to set the parent
   * DOM element in browser-based deployment) and then invoke the run
   * method to evaluate the dataflow graph. Rendering will automatically
   * be peformed upon dataflow runs.
   * @constructor
   * @param {object} spec - The Vega dataflow runtime specification.
   */
  function View(spec, options) {
    var view = this;
    options = options || {};

    vegaDataflow.Dataflow.call(view);
    view.loader(options.loader || view._loader);
    view.logLevel(options.logLevel || 0);

    view._el = null;
    view._renderType = options.renderer || vegaScenegraph.RenderType.Canvas;
    view._scenegraph = new vegaScenegraph.Scenegraph();
    var root = view._scenegraph.root;

    // initialize renderer, handler and event management
    view._renderer = null;
    view._tooltip = options.tooltip || defaultTooltip,
    view._redraw = true;
    view._handler = new vegaScenegraph.CanvasHandler().scene(root);
    view._preventDefault = false;
    view._timers = [];
    view._eventListeners = [];
    view._resizeListeners = [];

    // initialize dataflow graph
    var ctx = runtime(view, spec, options.functions);
    view._runtime = ctx;
    view._signals = ctx.signals;
    view._bind = (spec.bindings || []).map(function(_) {
      return {
        state: null,
        param: vegaUtil.extend({}, _)
      };
    });

    // initialize scenegraph
    if (ctx.root) ctx.root.set(root);
    root.source = ctx.data.root.input;
    view.pulse(
      ctx.data.root.input,
      view.changeset().insert(root.items)
    );

    // initialize background color
    view._background = ctx.background || null;

    // initialize event configuration
    view._eventConfig = initializeEventConfig(ctx.eventConfig);

    // initialize view size
    view._width = view.width();
    view._height = view.height();
    view._viewWidth = viewWidth(view, view._width);
    view._viewHeight = viewHeight(view, view._height);
    view._origin = [0, 0];
    view._resize = 0;
    view._autosize = 1;
    initializeResize(view);

    // initialize cursor
    cursor(view);
  }

  var prototype = vegaUtil.inherits(View, vegaDataflow.Dataflow);

  // -- DATAFLOW / RENDERING ----

  prototype.run = function(encode) {
    // evaluate dataflow
    vegaDataflow.Dataflow.prototype.run.call(this, encode);

    if (this._pending) {
      // resize next cycle if loading data sets
      this.resize();
    } else if (this._redraw || this._resize) {
      // render as needed
      try {
        this.render();
      } catch (e) {
        this.error(e);
      }
    }

    return this;
  };

  prototype.render = function() {
    if (this._renderer) {
      if (this._resize) {
        this._resize = 0;
        resizeRenderer(this);
      }
      this._renderer.render(this._scenegraph.root);
    }
    this._redraw = false;
    return this;
  };

  prototype.dirty = function(item) {
    this._redraw = true;
    this._renderer && this._renderer.dirty(item);
  };

  // -- GET / SET ----

  prototype.container = function() {
    return this._el;
  };

  prototype.scenegraph = function() {
    return this._scenegraph;
  };

  prototype.origin = function() {
    return this._origin.slice();
  };

  function lookupSignal(view, name) {
    return view._signals.hasOwnProperty(name)
      ? view._signals[name]
      : vegaUtil.error('Unrecognized signal name: ' + vegaUtil.stringValue(name));
  }

  prototype.signal = function(name, value, options) {
    var op = lookupSignal(this, name);
    return arguments.length === 1
      ? op.value
      : this.update(op, value, options);
  };

  prototype.background = function(_) {
    if (arguments.length) {
      this._background = _;
      this._resize = 1;
      return this;
    } else {
      return this._background;
    }
  };

  prototype.width = function(_) {
    return arguments.length ? this.signal('width', _) : this.signal('width');
  };

  prototype.height = function(_) {
    return arguments.length ? this.signal('height', _) : this.signal('height');
  };

  prototype.padding = function(_) {
    return arguments.length ? this.signal('padding', _) : this.signal('padding');
  };

  prototype.autosize = function(_) {
    return arguments.length ? this.signal('autosize', _) : this.signal('autosize');
  };

  prototype.renderer = function(type) {
    if (!arguments.length) return this._renderType;
    if (!vegaScenegraph.renderModule(type)) vegaUtil.error('Unrecognized renderer type: ' + type);
    if (type !== this._renderType) {
      this._renderType = type;
      this._resetRenderer();
    }
    return this;
  };

  prototype.tooltip = function(handler) {
    if (!arguments.length) return this._tooltip;
    if (handler !== this._tooltip) {
      this._tooltip = handler;
      this._resetRenderer();
    }
    return this;
  };

  prototype.loader = function(loader) {
    if (!arguments.length) return this._loader;
    if (loader !== this._loader) {
      vegaDataflow.Dataflow.prototype.loader.call(this, loader);
      this._resetRenderer();
    }
    return this;
  };

  prototype.resize = function() {
    // set flag to perform autosize
    this._autosize = 1;
    // touch autosize signal to ensure top-level ViewLayout runs
    return this.touch(lookupSignal(this, 'autosize'));
  };

  prototype._resetRenderer = function() {
    if (this._renderer) {
      this._renderer = null;
      this.initialize(this._el);
    }
  };

  // -- SIZING ----
  prototype._resizeView = resizeView;

  // -- EVENT HANDLING ----

  prototype.addEventListener = function(type, handler, options) {
    var callback = handler;
    if (!(options && options.trap === false)) {
      // wrap callback in error handler
      callback = trap(this, handler);
      callback.raw = handler;
    }
    this._handler.on(type, callback);
    return this;
  };

  prototype.removeEventListener = function(type, handler) {
    var handlers = this._handler.handlers(type),
        i = handlers.length, h, t;

    // search registered handlers, remove if match found
    while (--i >= 0) {
      t = handlers[i].type;
      h = handlers[i].handler;
      if (type === t && (handler === h || handler === h.raw)) {
        this._handler.off(t, h);
        break;
      }
    }
    return this;
  };

  prototype.addResizeListener = function(handler) {
    var l = this._resizeListeners;
    if (l.indexOf(handler) < 0) {
      // add handler if it isn't already registered
      // note: error trapping handled elsewhere, so
      // no need to wrap handlers here
      l.push(handler);
    }
    return this;
  };

  prototype.removeResizeListener = function(handler) {
    var l = this._resizeListeners,
        i = l.indexOf(handler);
    if (i >= 0) {
      l.splice(i, 1);
    }
    return this;
  };

  function findOperatorHandler(op, handler) {
    var t = op._targets || [],
        h = t.filter(function(op) {
              var u = op._update;
              return u && u.handler === handler;
            });
    return h.length ? h[0] : null;
  }

  function addOperatorListener(view, name, op, handler) {
    var h = findOperatorHandler(op, handler);
    if (!h) {
      h = trap(this, function() { handler(name, op.value); });
      h.handler = handler;
      view.on(op, null, h);
    }
    return view;
  }

  function removeOperatorListener(view, op, handler) {
    var h = findOperatorHandler(op, handler);
    if (h) op._targets.remove(h);
    return view;
  }

  prototype.addSignalListener = function(name, handler) {
    return addOperatorListener(this, name, lookupSignal(this, name), handler);
  };

  prototype.removeSignalListener = function(name, handler) {
    return removeOperatorListener(this, lookupSignal(this, name), handler);
  };

  prototype.addDataListener = function(name, handler) {
    return addOperatorListener(this, name, dataref(this, name).values, handler);
  };

  prototype.removeDataListener = function(name, handler) {
    return removeOperatorListener(this, dataref(this, name).values, handler);
  };

  prototype.preventDefault = function(_) {
    if (arguments.length) {
      this._preventDefault = _;
      return this;
    } else {
      return this._preventDefault;
    }
  };

  prototype.timer = timer;
  prototype.events = events;
  prototype.finalize = finalize;
  prototype.hover = hover;

  // -- DATA ----
  prototype.data = data;
  prototype.change = change;
  prototype.insert = insert;
  prototype.remove = remove;

  // -- SCALES --
  prototype.scale = scale;

  // -- INITIALIZATION ----
  prototype.initialize = initialize;

  // -- HEADLESS RENDERING ----
  prototype.toImageURL = renderToImageURL;
  prototype.toCanvas = renderToCanvas;
  prototype.toSVG = renderToSVG;

  // -- SAVE / RESTORE STATE ----
  prototype.getState = getState;
  prototype.setState = setState;

  exports.View = View;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
