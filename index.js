'use strict'
module.exports = hook

const flatten = require('flatten')
const slice = Array.prototype.slice

function hook(fn) {
  if (typeof fn !== 'function') {
    throw new Error('fn should be a function')
  }

  if (typeof fn.pre !== 'undefined') {
    throw new Error('The passed function is already hooked')
  }

  let pres = []

  function hookedFunc() {
    /*jshint validthis:true */
    return seq(pres.concat(fn), this).apply(this, arguments)
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

function seq(funcs, context) {
  return strictOnce(function() {
    const func = funcs[0]

    if (funcs.length === 1) {
      return func.apply(context, arguments)
    }

    const hookArgs = slice.call(arguments)

    const next = seq(funcs.slice(1), context)

    next.applySame = function() {
      if (arguments.length) {
        throw new Error('Arguments are not allowed')
      }

      return next.apply(context, hookArgs)
    }

    return func.apply(context, [next].concat(hookArgs))
  })
}

function strictOnce(fn) {
  function f() {
    // jshint validthis:true
    if (f.called) throw Error('next was called second time in a pre hook')
    f.called = true
    return fn.apply(this, arguments)
  }
  f.called = false
  return f
}
