'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
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

  it('should throw exception when the passed function is already hooked',
    function() {
      const hooked = hook(noop)
      expect(() => hook(hooked))
        .to.throw(Error, 'The passed function is already hooked')
    }
  )

  it('should call function when no hooks', function() {
    const func = sinon.spy()
    const hooked = hook(func)
    hooked(1)

    expect(func).to.have.been.calledWithExactly(1)
  })

  it('should preserve context', function() {
    const func = sinon.spy()
    const context = {
      hooked: hook(func),
    }

    context.hooked()

    expect(func).to.have.been.calledOn(context)
  })

  describe('pre', function() {
    it('should throw exception when no parameters passed', function() {
      const hooked = hook(noop)
      expect(() => hooked.pre()).to.throw(Error, 'No pre hooks passed')
    })

    it('should throw exception when passed pre is not a function', function() {
      const hooked = hook(noop)
      expect(() => hooked.pre('not a function'))
        .to.throw(Error, 'Pre hook should be a function')
    })

    it('should modify args passed to hooked function', function() {
      const func = sinon.spy()
      const hooked = hook(func)
      hooked.pre((next, a, b) => next(b, a))
      hooked(1, 2)

      expect(func).to.have.been.calledWithExactly(2, 1)
    })

    it('should not swallow the hooked function\'s result', function() {
      const func = sinon.spy(value => 2)
      const hooked = hook(func)
      hooked.pre((next, value) => next(value))

      expect(hooked(1)).to.eq(2)
      expect(func).to.have.been.calledWithExactly(1)
    })

    it('should call pre hooks on every execution of the hooked function',
      function() {
        const func = sinon.spy(value => value)
        const hooked = hook(func)
        hooked.pre((next, value) => next(value + 1))

        expect(hooked(1)).to.eq(2)
        expect(hooked(3)).to.eq(4)
      }
    )

    it('should call hooks in correct order', function() {
      const pre1 = sinon.spy((next, a, b) => next(a + 1, b))
      const pre2 = sinon.spy((next, a, b) => next(a, b + 1))

      const func = sinon.spy()
      const hooked = hook(func)

      hooked.pre(pre1)
      hooked.pre(pre2)
      hooked(1, 1)

      expect(func).to.have.been.calledWithExactly(2, 2)
      expect(pre1).to.have.been.calledBefore(pre2)
    })

    it('should throw exception if calling next second time', function() {
      const pre = sinon.spy((next, a, b) => {
        expect(next.called).to.be.false
        next(a + 1, b)
        expect(next.called).to.be.true
        next(a + 1, b)
      })

      const func = sinon.spy()
      const hooked = hook(func)

      hooked.pre(pre)

      expect(() => hooked(1, 1)).to.throw(Error,
        'next was called second time in a pre hook')

      expect(func).to.have.been.calledOnce
      expect(pre).to.have.been.calledOnce
    })

    it('should call hooks in correct order when they are passed as arguments',
      function() {
        const pre1 = sinon.spy((next, a, b) => next(a + 1, b))
        const pre2 = sinon.spy((next, a, b) => next(a, b + 1))

        const func = sinon.spy()
        const hooked = hook(func)

        hooked.pre(pre1, pre2)
        hooked(1, 1)

        expect(func).to.have.been.calledWithExactly(2, 2)
        expect(pre1).to.have.been.calledBefore(pre2)
      }
    )

    it('should call hooks in correct order when they are passed in an array',
      function() {
        const pre1 = sinon.spy((next, a, b) => next(a + 1, b))
        const pre2 = sinon.spy((next, a, b) => next(a, b + 1))

        const func = sinon.spy()
        const hooked = hook(func)

        hooked.pre([pre1, pre2])
        hooked(1, 1)

        expect(func).to.have.been.calledWithExactly(2, 2)
        expect(pre1).to.have.been.calledBefore(pre2)
      }
    )

    it('should not override the hooked function\'s context', function() {
      const func = sinon.spy()
      const context = {
        hooked: hook(func),
      }

      context.hooked.pre(next => next())
      context.hooked()

      expect(func).to.have.been.calledOn(context)
    })

    it('should abort the target function execution', function() {
      const func = sinon.spy()
      const hooked = hook(func)
      hooked.pre(next => 2)

      expect(hooked()).to.eq(2)
      expect(func).to.have.not.been.called
    })

    describe('applySame', function() {
      it('should throw exception if arguments passed', function(done) {
        const hooked = hook(noop)
        hooked.pre(next => {
          expect(() => next.applySame('some arg'))
            .to.throw(Error, 'Arguments are not allowed')
          done()
        })
        hooked()
      })

      it('should pass the same arguments to the next function', function() {
        const func = sinon.spy(value => value + 1)
        const hooked = hook(func)
        hooked.pre(next => next.applySame())

        expect(hooked(2)).to.eq(3)
        expect(func).to.have.been.calledWithExactly(2)
      })
    })
  })

  describe('removePre', function() {
    it('should be able to remove a particular pre hook', function() {
      const pre1 = sinon.spy((next, value) => next(value))
      const pre2 = sinon.spy((next, value) => next(value + 100))

      const func = sinon.spy()
      const hooked = hook(func)

      hooked.pre(pre1)
      hooked.pre(pre2)
      hooked.removePre(pre2)
      hooked(1)

      expect(pre1).to.have.been.calledOnce
      expect(pre2).to.not.have.been.called
      expect(func).to.have.been.calledWithExactly(1)
    })

    it('should be able to remove all pre hooks associated with a hook',
      function() {
        const pre1 = sinon.spy((next, value) => next(value))
        const pre2 = sinon.spy((next, value) => next(value + 100))

        const func = sinon.spy()
        const hooked = hook(func)

        hooked.pre(pre1)
        hooked.pre(pre2)
        hooked.removePre()
        hooked(1)

        expect(pre1).to.not.have.been.called
        expect(pre2).to.not.have.been.called
        expect(func).to.have.been.calledWithExactly(1)
      }
    )
  })
})
