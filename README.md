# magic-hook

Extends functions with pre hooks.

[![Dependency Status](https://david-dm.org/zkochan/magic-hook/status.svg?style=flat)](https://david-dm.org/zkochan/magic-hook)
[![Build Status](https://travis-ci.org/zkochan/magic-hook.svg?branch=master)](https://travis-ci.org/zkochan/magic-hook)
[![npm version](https://badge.fury.io/js/magic-hook.svg)](http://badge.fury.io/js/magic-hook)
[![Coverage Status](https://coveralls.io/repos/github/zkochan/magic-hook/badge.svg?branch=master)](https://coveralls.io/github/zkochan/magic-hook?branch=master)


## Installation

```
npm install --save magic-hook
```


## Usage

You can add `pre hooks` to extend your methods.

```js
const hook = require('magic-hook')

// The target function
function log(msg) { console.log(msg) }

// The hooked function
const hookedLog = hook(log)

// A pre hook
let msgNo = 0
function counterHook(log, msg) {
  log('message #' + (++msgNo) + ': ' + msg)
}
hookedLog.pre(counterHook)

for (let i = 3; i--;) hookedLog('Hello world!')
//> message #1: Hello world!
//> message #2: Hello world!
//> message #3: Hello world!
```

Hooks can be removed using `removePre`:

```js
hookedLog.removePre(counterHook)

hookedLog('Hello world!')
//> Hello world!

// To remove all the pre hooks associated with a hook just call removePre with no arguments:
hookedLog.removePre()
```

To abort the target function's execution just don't call the `next` function in the pre hook:

```js
hookedLog.pre(log => console.log('The original function was overwritten'))

hookedLog("Doesn't matter what goes here")
//> The original function was overwritten
```

You can overwrite the target function's result as well:

```js
const hookedSum = hook((a, b) => a + b)

hookedSum.pre(function(sum, a, b) {
  if (a === 1 && b === 1) return 3

  return sum(a, b)
})

hookedSum(2, 2)
//> 4

hookedSum(1, 1)
//> 3
```


## Motivation

Suppose you have an object with a `save` method.

It would be nice to be able to declare code that runs before `save`.
For example, you might want to run validation code before every `save`.
Or you might want to create plugins that will modify the input parameters of
your `save` method.


## License

MIT © [Zoltan Kochan](https://www.kochan.io)
