'use strict'
const hook = require('..')

// The target function
function concat(a, b) {
  return a + b
}

// The hooked function
const hookedConcat = hook(concat)

// A pre hook
let msgNo = 0
function counterHook(next, a, b) {
  return next('concatenation #' + (++msgNo) + ': ' + a, b)
}
hookedConcat.pre(counterHook)

for (let i = 3; i--;) console.log(hookedConcat('Hello ', 'world!'))

//! Hooks can be removed using `removePre`:

hookedConcat.removePre(counterHook)

console.log(hookedConcat('Hello ', 'world!'))

/*! To remove all pres associated with a hook
    just call removePre with no arguments: */

hookedConcat.removePre()

/*! To abort the target function's execution just
    don't call the `next` function in the pre hook: */

hookedConcat.pre(next => 'The original function was overwritten')

console.log(hookedConcat("Doesn't matter what goes here"))

//! You can overwrite the target function's result as well:

const hookedSum = hook((a, b) => a + b)

hookedSum.pre(function(sum, a, b) {
  if (a === 1 && b === 1) return 3

  return sum(a, b)
})

console.log(hookedSum(2, 2))

console.log(hookedSum(1, 1))
