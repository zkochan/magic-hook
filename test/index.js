'use strict'
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
const expect = chai.expect
const magicHook = require('..')

function noop() {}

describe('magic-hook', function() {
  it('should throw exception when no parameters passed', function() {
    expect(magicHook).to.throw(Error)
  })

  it('should throw exception when parameter not an object', function() {
    expect(() => magicHook('not a function')).to.throw(Error)
  })

  it('should throw exception when called twice on the same function', function() {
    let hooked = magicHook(noop)
    expect(() => magicHook(hooked)).to.throw(Error)
  })

  it('should call function when no hooks', function(done) {
    let hooked = magicHook(function(value) {
      expect(value).to.eq(1)
      done()
    })
    hooked(1)
  })

  it('should modify args when 1 hook', function(done) {
    let hooked = magicHook(function(value) {
      expect(value).to.eq(2)
      done()
    })
    hooked.pre((next, value) => next(value + 1))
    hooked(1)
  })

  it('should return function result when 1 hook', function() {
    let spy = sinon.spy(value => 2)
    let hooked = magicHook(spy)
    hooked.pre((next, value) => next(value))
    expect(hooked(1)).to.eq(2)
    expect(spy).to.have.been.calledWithExactly(1)
  })

  it('should call hooks in correct order', function(done) {
    let pre1 = sinon.spy((next, a, b) => next(a + 1, b))
    let pre2 = sinon.spy((next, a, b) => next(a, b + 1))

    let hooked = magicHook((a, b) => {
      expect(a).to.eq(2)
      expect(b).to.eq(2)
      expect(pre1).to.have.been.calledBefore(pre2)
      done()
    })

    hooked.pre(pre1)
    hooked.pre(pre2)
    hooked(1, 1)
  })

  it('should call hooks in correct order when they are passed as arguments', function(done) {
    let pre1 = sinon.spy((next, a, b) => next(a + 1, b))
    let pre2 = sinon.spy((next, a, b) => next(a, b + 1))

    let hooked = magicHook((a, b) => {
      expect(a).to.eq(2)
      expect(b).to.eq(2)
      expect(pre1).to.have.been.calledBefore(pre2)
      done()
    })

    hooked.pre(pre1, pre2)
    hooked(1, 1)
  })

  it('should call hooks in correct order when they are passed in an array', function(done) {
    let pre1 = sinon.spy((next, a, b) => next(a + 1, b))
    let pre2 = sinon.spy((next, a, b) => next(a, b + 1))

    let hooked = magicHook((a, b) => {
      expect(a).to.eq(2)
      expect(b).to.eq(2)
      expect(pre1).to.have.been.calledBefore(pre2)
      done()
    })

    hooked.pre([pre1, pre2])
    hooked(1, 1)
  })

  it('should pass context', function(done) {
    let obj = {
      foo: magicHook(function() {
        expect(this).to.eq(obj)
        done()
      }),
    }

    obj.foo()
  })
})

describe('pre', function() {
  it('should throw exception when no parameters passed', function() {
    let hooked = magicHook(noop)
    expect(() => hooked.pre()).to.throw(Error)
  })

  it('should throw exception when passed pre is not a function', function() {
    let hooked = magicHook(noop)
    expect(() => hooked.pre(1)).to.throw(Error)
  })
})

describe('removePre', function() {
  it('should be able to remove a particular pre', function(done) {
    let pre1 = sinon.spy((next, value) => next(value))
    let pre2 = sinon.spy((next, value) => next(value + 100))

    let hooked = magicHook(function(value) {
      expect(value).to.eq(1)
      expect(pre1).to.have.been.calledOnce
      expect(pre2).to.not.have.been.called
      done()
    })

    hooked.pre(pre1)
    hooked.pre(pre2)
    hooked.removePre(pre2)
    hooked(1)
  })

  it('should be able to remove all pres associated with a hook', function(done) {
    let pre1 = sinon.spy((next, value) => next(value))
    let pre2 = sinon.spy((next, value) => next(value + 100))

    let hooked = magicHook(function(value) {
      expect(value).to.eq(1)
      expect(pre1).to.not.have.been.called
      expect(pre2).to.not.have.been.called
      done()
    })

    hooked.pre(pre1)
    hooked.pre(pre2)
    hooked.removePre()
    hooked(1)
  })
})
