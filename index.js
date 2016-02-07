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
    let result

    function next() {
      current++
      if (pres.length <= current) {
        result = fn.apply(this, arguments)
        return
      }
      let args = slice.call(arguments)
      pres[current].apply(this, [next].concat(args))
    }
    next.apply(this, arguments)
    return result
  }

  hookedFunc.pre = function() {
    if (arguments.length === 0) {
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
    if (arguments.length === 0) {
      // Remove all pre callbacks for hook `name`
      pres = []
      return
    }
    pres = pres.filter(function(currFn) {
      return currFn !== fnToRemove
    })
  }

  return hookedFunc
}
