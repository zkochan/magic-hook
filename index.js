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

    function next() {
      current++

      if (pres.length <= current) {
        return fn.apply(this, arguments)
      }

      let args = slice.call(arguments)
      return pres[current].apply(this, [next.bind(this)].concat(args))
    }

    return next.apply(this, arguments)
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
