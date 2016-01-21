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

We can add `pre hooks` to extend our methods.

```js
const logger = require('logger')
const magicHook = require('magic-hook')

magicHook(logger, ['log'])

logger.pre('log', function(next, msg) {
  next('hooked message: ' + msg)
});

logger.pre('log', function(next, msg) {
  console.log(msg)
  next(msg)
});

/* will log "hooked message: Hello world!" to the console and log it with logger */
logger.log('Hello world!')
```

You can hook all methods of an object by simply not specifying the list of methods to hook:

```js
const magicHook = require('magic-hook')

magicHook(Math);

Math.pre('max', function(next, a, b) {
  console.log('max method called')
  next(a, b)
});

/* will log to a message to console and assign the max number to maxNumber */
let maxNumber = Math.max(32, 100)
```


## Removing pres

You can remove a particular `pre` associated with a hook:

```js
logger.pre('log', someFn)
logger.removePre('log', someFn)
```

And you can also remove all pres associated with a hook:

```js
logger.removePre('log') /* Removes all declared pres on the hook 'log' */
```


## License

The MIT License (MIT)
