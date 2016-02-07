'use strict'
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
const expect = chai.expect
const hook = require('..')

function noop() {}

describe('magic-hook', function() {
  it('should throw exception when no parameters passed', function() {
    expect(hook).to.throw(Error, 'fn should be a function')
  })

  it('should throw exception when parameter not a function', function() {
    expect(() => hook('not a function'))
      .to.throw(Error, 'fn should be a function')
  })

  it('should throw exception when the passed function is already hooked', function() {
    let hooked = hook(noop)
    expect(() => hook(hooked))
      .to.throw(Error, 'The passed function is already hooked')
  })

  it('should call function when no hooks', function() {
    let func = sinon.spy()
    let hooked = hook(func)
    hooked(1)

    expect(func).to.have.been.calledWithExactly(1)
  })

  it('should preserve context', function() {
    let func = sinon.spy()
    let context = {
      hooked: hook(func),
    }

    context.hooked()

    expect(func).to.have.been.calledOn(context)
  })

  describe('pre', function() {
    it('should throw exception when no parameters passed', function() {
      let hooked = hook(noop)
      expect(() => hooked.pre()).to.throw(Error, 'No pre hooks passed')
    })

    it('should throw exception when passed pre is not a function', function() {
      let hooked = hook(noop)
      expect(() => hooked.pre('not a function'))
        .to.throw(Error, 'Pre hook should be a function')
    })

    it('should modify args passed to hooked function', function() {
      let func = sinon.spy()
      let hooked = hook(func)
      hooked.pre((next, a, b) => next(b, a))
      hooked(1, 2)

      expect(func).to.have.been.calledWithExactly(2, 1)
    })

    it('should not swallow the hooked function\'s result', function() {
      let func = sinon.spy(value => 2)
      let hooked = hook(func)
      hooked.pre((next, value) => next(value))

      expect(hooked(1)).to.eq(2)
      expect(func).to.have.been.calledWithExactly(1)
    })

    it('should call hooks in correct order', function() {
      let pre1 = sinon.spy((next, a, b) => next(a + 1, b))
      let pre2 = sinon.spy((next, a, b) => next(a, b + 1))

      let func = sinon.spy()
      let hooked = hook(func)

      hooked.pre(pre1)
      hooked.pre(pre2)
      hooked(1, 1)

      expect(func).to.have.been.calledWithExactly(2, 2)
      expect(pre1).to.have.been.calledBefore(pre2)
    })

    it('should call hooks in correct order when they are passed as arguments', function() {
      let pre1 = sinon.spy((next, a, b) => next(a + 1, b))
      let pre2 = sinon.spy((next, a, b) => next(a, b + 1))

      let func = sinon.spy()
      let hooked = hook(func)

      hooked.pre(pre1, pre2)
      hooked(1, 1)

      expect(func).to.have.been.calledWithExactly(2, 2)
      expect(pre1).to.have.been.calledBefore(pre2)
    })

    it('should call hooks in correct order when they are passed in an array', function() {
      let pre1 = sinon.spy((next, a, b) => next(a + 1, b))
      let pre2 = sinon.spy((next, a, b) => next(a, b + 1))

      let func = sinon.spy()
      let hooked = hook(func)

      hooked.pre([pre1, pre2])
      hooked(1, 1)

      expect(func).to.have.been.calledWithExactly(2, 2)
      expect(pre1).to.have.been.calledBefore(pre2)
    })

    it('should not override the hooked function\'s context', function() {
      let func = sinon.spy()
      let context = {
        hooked: hook(func),
      }

      context.hooked.pre(next => next.apply(null, []))
      context.hooked()

      expect(func).to.have.been.calledOn(context)
    })

    it('should abort the target function execution', function() {
      let func = sinon.spy()
      let hooked = hook(func)
      hooked.pre(next => 2)

      expect(hooked()).to.eq(2)
      expect(func).to.have.not.been.called
    })
  })

  describe('removePre', function() {
    it('should be able to remove a particular pre hook', function() {
      let pre1 = sinon.spy((next, value) => next(value))
      let pre2 = sinon.spy((next, value) => next(value + 100))

      let func = sinon.spy()
      let hooked = hook(func)

      hooked.pre(pre1)
      hooked.pre(pre2)
      hooked.removePre(pre2)
      hooked(1)

      expect(pre1).to.have.been.calledOnce
      expect(pre2).to.not.have.been.called
      expect(func).to.have.been.calledWithExactly(1)
    })

    it('should be able to remove all pre hooks associated with a hook', function() {
      let pre1 = sinon.spy((next, value) => next(value))
      let pre2 = sinon.spy((next, value) => next(value + 100))

      let func = sinon.spy()
      let hooked = hook(func)

      hooked.pre(pre1)
      hooked.pre(pre2)
      hooked.removePre()
      hooked(1)

      expect(pre1).to.not.have.been.called
      expect(pre2).to.not.have.been.called
      expect(func).to.have.been.calledWithExactly(1)
    })
  })
})
