'use strict'
module.exports = magicHook

const flatten = require('flatten')
const slice = Array.prototype.slice

function once(fn) {
  function f() {
    // jshint validthis:true
    if (f.called) throw Error('next was called second time in a pre hook')
    f.called = true
    return fn.apply(this, arguments)
  }
  f.called = false
  return f
}

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
    const _this = this

    function createNext(nextPres) {
      return once(function() {
        if (!nextPres.length) {
          return fn.apply(_this, arguments)
        }

        const hookArgs = slice.call(arguments)

        const pre = nextPres.shift()
        const next = createNext(nextPres)
        next.applySame = function() {
          if (arguments.length) {
            throw new Error('Arguments are not allowed')
          }

          return next.apply(_this, hookArgs)
        }

        return pre.apply(_this, [next].concat(hookArgs))
      })
    }

    return createNext([].concat(pres)).apply(_this, arguments)
  }

  hookedFunc.pre = function() {
    if (!arguments.length) {
      throw new Error('No pre hooks passed')
    }

    const newPres = flatten(slice.call(arguments))

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
