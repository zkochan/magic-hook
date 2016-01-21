'use strict'
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
const expect = chai.expect
const magicHook = require('../')
function noop() {}

describe('magic-hook', function() {
  it('should throw exception when no parameters passed', function() {
    expect(magicHook).to.throw(Error)
  })

  it('should throw exception when first parameter not an object', function() {
    expect(() => magicHook('not a function')).to.throw(Error)
  })

  it('should throw exception when second parameter not an Array', function() {
    expect(() => magicHook({}, 'not an Array')).to.throw(Error)
  })

  it('should throw exception when called twice on the same object', function() {
    let a = {
      foo: noop,
    }
    magicHook(a, ['hook'])
    expect(() => magicHook(a, ['hook'])).to.throw(Error)
  })

  it('should throw exception when object has pre method', function() {
    let a = {
      pre: noop,
      foo: noop,
    }
    expect(() => magicHook(a, ['hook'])).to.throw(Error)
  })

  it('should call function when no hooks', function(done) {
    let a = {
      foo(value) {
        expect(value).to.eq(1)
        done()
      },
    }
    magicHook(a, ['foo'])
    a.foo(1)
  })

  it('should modify args when 1 hook', function(done) {
    let a = {
      foo(value) {
        expect(value).to.eq(2)
        done()
      },
    }
    magicHook(a, ['foo'])
    a.pre('foo', (next, value) => next(value + 1))
    a.foo(1)
  })

  it('should return function result whe 1 hook', function() {
    let spy = sinon.spy(value => 2)
    let a = {
      foo: spy,
    }
    magicHook(a, ['foo'])
    a.pre('foo', (next, value) => next(value))
    expect(a.foo(1)).to.eq(2)
    expect(spy).to.have.been.calledWithExactly(1)
  })

  it('should call hooks in correct order', function(done) {
    let pre1 = sinon.spy((next, a, b) => next(a + 1, b))
    let pre2 = sinon.spy((next, a, b) => next(a, b + 1))
    let a = {
      foo(a, b) {
        expect(a).to.eq(2)
        expect(b).to.eq(2)
        expect(pre1).to.have.been.calledBefore(pre2)
        done()
      },
    }
    magicHook(a, ['foo'])
    a.pre('foo', pre1)
    a.pre('foo', pre2)
    a.foo(1, 1)
  })

  it('should hook several methods', function() {
    let hook1 = sinon.spy()
    let hook2 = sinon.spy()
    let a = {
      foo: hook1,
      bar: hook2,
    }
    magicHook(a, ['foo', 'bar'])
    a.pre('foo', (next, value) => next(value + 1))
    a.pre('bar', (next, value) => next(value + 2))
    a.foo(1)
    a.bar(2)

    expect(hook1).to.have.been.calledWithExactly(2)
    expect(hook2).to.have.been.calledWithExactly(4)
  })

  it('should hook all methods when not specified which', function() {
    let hook1 = sinon.spy()
    let hook2 = sinon.spy()
    let a = {
      foo: hook1,
      bar: hook2,
    }
    magicHook(a)
    a.pre('foo', (next, value) => next(value + 1))
    a.pre('bar', (next, value) => next(value + 2))
    a.foo(1)
    a.bar(2)

    expect(hook1).to.have.been.calledWithExactly(2)
    expect(hook2).to.have.been.calledWithExactly(4)
  })
})

describe('pre', function() {
  it('should throw exception when no parameters passed', function() {
    let a = {
      foo: noop,
    }
    magicHook(a, ['foo'])
    expect(() => a.pre()).to.throw(Error)
  })

  it('should throw exception when name is not string', function() {
    let a = {
      foo: noop,
    }
    magicHook(a, ['foo'])
    expect(() => a.pre(1)).to.throw(Error)
  })

  it('should throw exception when passed pre is not a function', function() {
    let a = {
      foo: noop,
    }
    magicHook(a, ['foo'])
    expect(() => a.pre('foo', 1)).to.throw(Error)
  })

  it('should throw exception when there\'s' +
    ' no hook with the passed name', function() {
    let a = {
      foo: noop,
    }
    magicHook(a, ['foo'])
    expect(() => a.pre('notExistingHook', noop)).to.throw(Error)
  })
})

describe('removePre', function() {
  it('should be able to remove a particular pre', function(done) {
    let pre1 = sinon.spy((next, value) => next(value))
    let pre2 = sinon.spy((next, value) => next(value + 100))
    let a = {
      foo(value) {
        expect(value).to.eq(1)
        expect(pre1).to.have.been.calledOnce
        expect(pre2).to.not.have.been.called
        done()
      },
    }
    magicHook(a, ['foo'])
    a.pre('foo', pre1)
    a.pre('foo', pre2)
    a.removePre('foo', pre2)
    a.foo(1)
  })

  it('should be able to remove all pres associated with a hook', function(done) {
    let pre1 = sinon.spy((next, value) => next(value))
    let pre2 = sinon.spy((next, value) => next(value + 100))
    let a = {
      foo: function(value) {
        expect(value).to.eq(1)
        expect(pre1).to.not.have.been.called
        expect(pre2).to.not.have.been.called
        done()
      },
    }
    magicHook(a, ['foo'])
    a.pre('foo', pre1)
    a.pre('foo', pre2)
    a.removePre('foo')
    a.foo(1)
  })
})
