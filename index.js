/*
 * delegate-manager
 * Delegate manager
 *
 * @copyright 2013 Enrico Marino and Federico Spini
 * @license MIT
 */ 

/*
 * Expose `Manager`
 */

module.exports = DelegateManager;

/* 
 * Module dependencies
 */

var delegate = require('delegate');

/* 
 * Utilities
 */

var object = {};
var toString = object.toString;

/*
 * DelegateManager
 * Create an event manager.
 *
 * @param {Element} `target` object which events will be bound to
 * @param {Object} `obj` which will receive method calls
 * @return {Manager} the event manager
 */

function DelegateManager(target, obj) {
  if (!(this instanceof DelegateManager)) {
    return new DelegateManager(target, obj);
  }

  this.target = target;
  this.obj = obj;
  this._bindings = {};
}

/**
 * bind
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * @example
 *    events.bind('login') // implies "onlogin"
 *    events.bind('login', 'onLogin')
 *
 * @param {String} event `event` name
 * @param {String} [method] `method` name
 * @return {DelegateManager} the event manager, for chaining
 * @api public
 */

DelegateManager.prototype.bind = function(str, method) {
  if (toString.call(str) === '[object Object]') {
    return this.bind_all(str);
  }
  
  var target = this.target;
  var obj = this.obj;
  var bindings = this._bindings;
  var event = parse(str);
  var name = event.name;
  var selector = event.selector;
  var method = method || 'on' + name;
  var fn = obj[method].bind(obj);
  var callback;

  if (selector !== '') {
    callback = delegate.bind(target, selector, name, fn, false); 
  } else {
    target.addEventListener(name, fn, false);
    callback = fn;
  }

  bindings[name] = bindings[name] || {};
  bindings[name][method] = callback;

  return this;
};

/**
 * bind_all
 * Bind to `event` with optional `method` name
 * for each pair `event`/`method` in `obj`
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * @example
 *    events.bind('login') // implies "onlogin"
 *    events.bind('login', 'onLogin')
 *
 * @param {Object} obj pairs `event`/`method` to bind
 * @return {DelegateManager} the event manager, for chaining
 * @api public
 */

DelegateManager.prototype.bind_all = function(obj) {
  var event;
  for (event in obj) {
    this.bind(event, obj[event]);
  }
  return this;
};

/**
 * unbind
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * @example
 *     events.unbind('login', 'onLogin')
 *     events.unbind('login')
 *     events.unbind()
 *
 * @param {String} [event]
 * @param {String} [method]
 * @return {DelegateManager} the event manager, for chaining
 * @api public
 */

DelegateManager.prototype.unbind = function(str, method) {
  if (0 == arguments.length) {
    return this.unbind_all();
  }
  if (1 == arguments.length) {
    return this.unbind_all_of(event);
  }
  
  var target = this.target;
  var bindings = this._bindings;
  var event = parse(str);
  var name = event.name;
  var selector = event.selector;
  var method = method || 'on' + name;
  var functions = bindings[name];
  
  if (!functions) {
    return this;
  }
  
  var fn = functions[method];

  if (!fn) {
    return this;
  }

  delegate.unbind(target, name, fn, false);
  delete bindings[name][method];
  
  return this;
};

/**
 * unbind_all
 * Unbind all events.
 *
 * @api private
 */

DelegateManager.prototype.unbind_all = function() {
  var bindings = this._bindings;
  var event;
  
  for (event in bindings) {
    this.unbind_all_of(event);
  }

  return this;
};

/**
 * unbind_all_of
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

DelegateManager.prototype.unbind_all_of = function(event) {
  var bindings = this._bindings[event];
  var method;

  if (!bindings) {
    return this;
  }

  for (method in bindings) {
    this.unbind(event, method);
  }
  delete this._bindings[event];

  return this;
};


/*
 * parse
 * Parse event / selector string.
 *
 * @param {String} string
 * @return {Object}
 * @api private
 */

function parse(str) {
  var parts = str.split(' ');
  var event = parts.shift();
  var selector = parts.join(' ');

  return { name: event, selector: selector };
}
