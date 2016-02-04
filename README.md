# magic-hook

Extends functions with pre hooks. Inspired by [hooks-js](https://github.com/bnoguchi/hooks-js).

[![Dependency Status](https://david-dm.org/zkochan/magic-hook/status.svg?style=flat)](https://david-dm.org/zkochan/magic-hook)
[![Build Status](https://travis-ci.org/zkochan/magic-hook.svg?branch=master)](https://travis-ci.org/zkochan/magic-hook)
[![npm version](https://badge.fury.io/js/magic-hook.svg)](http://badge.fury.io/js/magic-hook)
[![Coverage Status](https://coveralls.io/repos/github/zkochan/magic-hook/badge.svg?branch=master)](https://coveralls.io/github/zkochan/magic-hook?branch=master)


## Installation

```
$ npm install --save magic-hook
```


## Motivation

Suppose you have an object with a `save` method.

It would be nice to be able to declare code that runs before `save`.
For example, you might want to run validation code before every `save`.
Or you might want to create plugins that will modify the input parameters of
your `save` method.


## Why no post hook as well?

`post hooks` are the same as events, so no need to replicate the functionality of
a regular [event emitter](https://nodejs.org/api/events.html).


## Usage

You can add `pre hooks` to extend your methods.

```js
const magicHook = require('magic-hook')

let log = magicHook(function(msg) {
  console.log(msg)
})

let messageNumber = 0
function counterHook(next, msg) {
  messageNumber++
  next('message #' + messageNumber + ': ' + msg)
}
log.pre('log', counterHook);

// will output "message #1: Hello world!" to the console
log('Hello world!')

// hooks can be removed
log.removePre(counterHook)

// will output "Hello world!" to the console, because the counter hook was removed
log('Hello world!')

// To remove all pres associated with a hook just call removePre with no arguments:
log.removePre()
```


## License

The MIT License (MIT)
