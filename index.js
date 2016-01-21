'use strict'
function magicHook(obj, methods) {
  if (typeof obj !== 'object') {
    throw new Error('obj should be an object')
  }
  if (arguments.length > 1 && !(methods instanceof Array)) {
    throw new Error('methods should be an Array')
  }
  if (typeof obj.pre !== 'undefined') {
    throw new Error('Hooked object already has a pre property')
  }

  let pres = {}
  if (!methods) {
    methods = Object.getOwnPropertyNames(obj).filter(function(propName) {
      return typeof obj[propName] === 'function'
    })
  }

  function hook(name, fn) {
    pres[name] = pres[name] || []

    obj[name] = function() {
      let current = -1
      let result

      function next() {
        current++
        if (pres[name].length <= current) {
          result = fn.apply(obj, arguments)
          return
        }
        let args = Array.prototype.slice.call(arguments)
        pres[name][current].apply(obj, [next].concat(args))
      }
      next.apply(obj, arguments)
      return result
    }
  }

  for (let i = methods.length; i--;) {
    hook(methods[i], obj[methods[i]])
  }

  obj.pre = function(name, fn) {
    if (typeof name !== 'string') {
      throw new Error('name should be a string')
    }
    if (typeof fn !== 'function') {
      throw new Error('fn should be a function')
    }
    if (!pres[name]) {
      throw new Error('There\'s no hook with the passed name')
    }
    pres[name].push(fn)
  }
  obj.removePre = function(name, fnToRemove) {
    if (typeof name !== 'string') {
      throw new Error('name should be a string')
    }
    if (!obj[name]) {
      return
    }
    if (arguments.length === 1) {
      /* Remove all pre callbacks for hook `name` */
      pres[name] = []
      return
    }
    pres[name] = pres[name].filter(function(currFn) {
      return currFn !== fnToRemove
    })
  }
}

module.exports = magicHook
