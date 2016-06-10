# magic-hook

> Extends functions with pre hooks.

<!--@shields.flatSquare('travis', 'coveralls', 'npm')-->
[![Build Status](https://img.shields.io/travis/zkochan/magic-hook/master.svg?style=flat-square)](https://travis-ci.org/zkochan/magic-hook) [![Coverage Status](https://img.shields.io/coveralls/zkochan/magic-hook/master.svg?style=flat-square)](https://coveralls.io/r/zkochan/magic-hook?branch=master) [![npm version](https://img.shields.io/npm/v/magic-hook.svg?style=flat-square)](https://www.npmjs.com/package/magic-hook)
<!--/@-->

## Installation

```sh
npm i -S magic-hook
```

## Usage

You can add `pre hooks` to extend your methods.

<!--@example('./example/hook-logger.js')-->
```js
'use strict'
const hook = require('magic-hook')

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
//> concatenation #1: Hello world!
//> concatenation #2: Hello world!
//> concatenation #3: Hello world!
```

Hooks can be removed using `removePre`:

```js
hookedConcat.removePre(counterHook)

console.log(hookedConcat('Hello ', 'world!'))
//> Hello world!
```

To remove all pres associated with a hook
just call removePre with no arguments:

```js
hookedConcat.removePre()
```

To abort the target function's execution just
don't call the `next` function in the pre hook:

```js
hookedConcat.pre(next => 'The original function was overwritten')

console.log(hookedConcat("Doesn't matter what goes here"))
//> The original function was overwritten
```

You can overwrite the target function's result as well:

```js
const hookedSum = hook((a, b) => a + b)

hookedSum.pre(function(sum, a, b) {
  if (a === 1 && b === 1) return 3

  return sum(a, b)
})

console.log(hookedSum(2, 2))
//> 4

console.log(hookedSum(1, 1))
//> 3
```
<!--/@-->

## Motivation

Suppose you have an object with a `save` method.

It would be nice to be able to declare code that runs before `save`.
For example, you might want to run validation code before every `save`.
Or you might want to create plugins that will modify the input parameters of
your `save` method.

## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)
