<!--@'# ' + pkg.name-->
# magic-hook
<!--/@-->

<!--@pkg.description-->
Extends functions with pre hooks.
<!--/@-->

<!--@shields.flatSquare('travis', 'coveralls', 'npm')-->
[![Build Status](https://img.shields.io/travis/zkochan/magic-hook/master.svg?style=flat-square)](https://travis-ci.org/zkochan/magic-hook) [![Coverage Status](https://img.shields.io/coveralls/zkochan/magic-hook/master.svg?style=flat-square)](https://coveralls.io/r/zkochan/magic-hook?branch=master) [![npm version](https://img.shields.io/npm/v/magic-hook.svg?style=flat-square)](https://www.npmjs.com/package/magic-hook)
<!--/@-->

<!--@installation({useShortAlias: true})-->
## Installation

```sh
npm i -S magic-hook
```
<!--/@-->

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

<!--@license()-->
## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)
<!--/@-->

* * *

<!--@dependencies({ shield: 'flat-square' })-->
## <a name="dependencies">Dependencies</a> [![dependency status](https://img.shields.io/david/zkochan/magic-hook/master.svg?style=flat-square)](https://david-dm.org/zkochan/magic-hook/master)

- [flatten](https://github.com/jesusabdullah/node-flatten): Flatten arbitrarily nested arrays into a non-nested list of non-array items

<!--/@-->

<!--@devDependencies({ shield: 'flat-square' })-->
## <a name="dev-dependencies">Dev Dependencies</a> [![devDependency status](https://img.shields.io/david/dev/zkochan/magic-hook/master.svg?style=flat-square)](https://david-dm.org/zkochan/magic-hook/master#info=devDependencies)

- [babel-cli](https://github.com/babel/babel/blob/master/packages): Babel command line.
- [babel-plugin-transform-es2015-arrow-functions](https://github.com/babel/babel/blob/master/packages): Compile ES2015 arrow functions to ES5
- [babel-plugin-transform-es2015-block-scoping](https://github.com/babel/babel/blob/master/packages): Compile ES2015 block scoping (const and let) to ES5
- [babel-register](https://github.com/babel/babel/blob/master/packages): babel require hook
- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [istanbul](https://github.com/gotwarlost/istanbul): Yet another JS code coverage tool that computes statement, line, function and branch coverage with module loader hooks to transparently add coverage when running tests. Supports all JS coverage use cases including unit tests, server side functional tests
- [jscs](https://github.com/jscs-dev/node-jscs): JavaScript Code Style
- [jshint](https://github.com/jshint/jshint): Static analysis tool for JavaScript
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [mos](https://github.com/mosjs/mos): A pluggable module that injects content into your markdown files via hidden JavaScript snippets
- [sinon](https://github.com/cjohansen/Sinon.JS): JavaScript test spies, stubs and mocks.
- [sinon-chai](https://github.com/domenic/sinon-chai): Extends Chai with assertions for the Sinon.JS mocking framework.

<!--/@-->
