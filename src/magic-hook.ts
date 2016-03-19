import flatten from 'flatten'
const slice = Array.prototype.slice

function merge<T1, T2>(onto: T1, from: T2): T1 & T2 {
  if (typeof from !== 'object' || from instanceof Array) {
    throw new Error("merge: 'from' must be an ordinary object");
  }
  Object.keys(from).forEach(key => onto[key] = from[key]);
  return onto as T1 & T2;
}

export type FuncReturns<T> = (...args: any[]) => T

export type PreHook<T extends FuncReturns<Y>, Y> = (next: NextFunc<T, Y>, ...args: any[]) => Y

export type Hooks<T extends FuncReturns<Y>, Y> = {
  pre(...preHooks: PreHook<T, Y>[]): void
  removePre(preHook?: PreHook<T, Y>): void
}

export default function hook<T extends FuncReturns<Y>, Y>(fn: T & FuncReturns<Y>): Hooks<T, Y> & T {
  if (typeof fn !== 'function') {
    throw new Error('fn should be a function')
  }

  if (typeof fn['pre'] !== 'undefined') {
    throw new Error('The passed function is already hooked')
  }

  let pres: PreHook<T, Y>[] = []

  const hookedFunc: Hooks<T, Y> & T = merge(<T><Function>function () {
    return seq<T, Y>((pres as Function[]).concat(fn), this).apply(this, arguments)
  }, {
    pre (...preHooks: PreHook<T, Y>[]) {
      if (!preHooks.length) {
        throw new Error('No pre hooks passed')
      }

      const newPres = flatten(slice.call(preHooks))

      newPres.forEach((pre: PreHook<T, Y>) => {
        if (typeof pre !== 'function') {
          throw new Error('Pre hook should be a function')
        }

        pres.push(pre)
      })
    },
    removePre (fnToRemove: PreHook<T, Y>) {
      if (!arguments.length) {
        pres = []
        return
      }

      pres = pres.filter(currFn => currFn !== fnToRemove)
    }
  })

  return hookedFunc
}

export type NextFunc<T extends FuncReturns<Y>, Y> = T & {
  applySame(): Y
}

function seq<T extends FuncReturns<Y>, Y>(funcs: Function[], context: any): T {
  return <T><Function>strictOnce(function() {
    const func = funcs[0]

    if (funcs.length === 1) {
      return func.apply(context, arguments)
    }

    const hookArgs = slice.call(arguments)

    const next: NextFunc<T, Y> = merge(seq<T, Y>(funcs.slice(1), context), {
      applySame: function() {
        if (arguments.length) {
          throw new Error('Arguments are not allowed')
        }

        return next.apply(context, hookArgs)
      }
    })

    return func.apply(context, [next].concat(hookArgs))
  })
}

function strictOnce(fn: Function) {
  const f = merge(function() {
    if (f.called) {
      throw Error('next was called second time in a pre hook')
    }
    f.called = true
    return fn.apply(this, arguments)
  }, {
    called: false
  })
  return f
}
