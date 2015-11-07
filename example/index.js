'use strict';

var magicHook = require('../');

function Logger() {
  magicHook(this, ['log']);
}

Logger.prototype.log = function(msg) {
  console.log(msg);
};

var logger = new Logger();

logger.pre('log', function(next, msg) {
  console.log('Hello world');
  next(msg);
});

logger.log('la-la');
