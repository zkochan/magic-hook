'use strict'
const magicHook = require('../')

magicHook(Math)

Math.pre('max', function(next, a, b) {
  console.log('max method called')
  next(a, b)
})

let maxNumber = Math.max(32, 100)
