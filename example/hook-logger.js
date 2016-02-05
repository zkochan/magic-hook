'use strict'
const hook = require('..')

function Logger() {}

Logger.prototype.log = hook(function(msg) {
  console.log(msg)
})

let logger = new Logger()

function createMsgCounter() {
  let msgCount = 0
  return function(next, msg) {
    msgCount++
    next('Message #' + msgCount + ':' + msg)
  }
}
logger.log.pre(createMsgCounter())

logger.log('la-la')
logger.log('Hello world!')
