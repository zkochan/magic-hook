'use strict'
module.exports = magicHook

function magicHook(fn) {
  if (typeof fn !== 'function') {
    throw new Error('fn should be a function')
  }
  if (typeof fn.pre !== 'undefined') {
    throw new Error('Hooked object already has a pre property')
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
      let args = Array.prototype.slice.call(arguments)
      pres[current].apply(this, [next].concat(args))
    }
    next.apply(this, arguments)
    return result
  }

  hookedFunc.pre = function(fn) {
    if (typeof fn !== 'function') {
      throw new Error('fn should be a function')
    }
    pres.push(fn)
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
