'use strict'
const hook = require('..')

function log(msg) {
  console.log(msg)
}
let hookedLog = hook(log)

let msgNo = 0
function counterHook(next, msg) {
  next('message #' + (++msgNo) + ': ' + msg)
}
hookedLog.pre(counterHook)

for (let i = 3; i--;) hookedLog('Hello world!')
//> message #1: Hello world!
//> message #2: Hello world!
//> message #3: Hello world!

hookedLog.removePre(counterHook)

hookedLog('Hello world!')
//> Hello world!

// To remove all pres associated with a hook
// just call removePre with no arguments:
hookedLog.removePre()

hookedLog.pre(next => console.log('The original function was overwritten'))

hookedLog("Doesn't matter what goes here")
//> The original function was overwritten
