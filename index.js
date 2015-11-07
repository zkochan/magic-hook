'use strict';

var magicHook = function(obj, methods) {
  var pres = {};

  obj.pre = function(name, fn) {
    if (typeof name !== 'string') {
      throw new Error('name should be a string');
    }
    if (typeof fn !== 'function') {
      throw new Error('fn should be a function');
    }
    pres[name] = pres[name] || [];
    pres[name].push(fn);
  };

  function hook(name, fn) {
    obj[name] = function() {
      //var context = this;
      var current = -1;

      function next() {
        current++;
        if (!pres[name] || pres[name].length <= current) {
          return fn.apply(this, arguments);
        }
        var args = Array.prototype.slice.call(arguments);
        return pres[name][current].apply(this, [next].concat(args));
      }
      return next.apply(this, arguments);
    };
  }

  for (var i = methods.length; i--;) {
    hook(methods[i], obj[methods[i]]);
  }
};

module.exports = magicHook;
