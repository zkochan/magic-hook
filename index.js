'use strict'
const flatten = require('flatten')
const slice = Array.prototype.slice;

module.exports = magicHook

function magicHook(fn) {
  if (typeof fn !== 'function') {
    throw new Error('fn should be a function')
  }

  if (typeof fn.pre !== 'undefined') {
    throw new Error('The passed function is already hooked')
  }

  let pres = []

  function hookedFunc() {
    /*jshint validthis:true */
    let current = -1
    let context = this

    function next() {
      current++

      if (pres.length <= current) {
        return fn.apply(context, arguments)
      }

      let hookArgs = slice.call(arguments)

      next.applySame = function() {
        if (arguments.length) {
          throw new Error('Arguments are not allowed')
        }
        return next.apply(context, hookArgs)
      }

      return pres[current].apply(context, [next].concat(hookArgs))
    }

    return next.apply(context, arguments)
  }

  hookedFunc.pre = function() {
    if (!arguments.length) {
      throw new Error('No pre hooks passed')
    }

    let newPres = flatten(slice.call(arguments))

    newPres.forEach(pre => {
      if (typeof pre !== 'function') {
        throw new Error('Pre hook should be a function')
      }

      pres.push(pre)
    })
  }

  hookedFunc.removePre = function(fnToRemove) {
    if (!arguments.length) {
      pres = []
      return
    }

    pres = pres.filter(currFn => currFn !== fnToRemove)
  }

  return hookedFunc
}
