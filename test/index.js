'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var expect = chai.expect;
var magicHook = require('../');
var noop = function() {};

describe('magic-hook', function() {
  it('should throw exception when no parameters passed', function() {
    expect(function() {
      magicHook();
    }).to.throw(Error);
  });

  it('should throw exception when first parameter not an object', function() {
    expect(function() {
      magicHook('not a function');
    }).to.throw(Error);
  });

  it('should throw exception when second parameter not an Array', function() {
    expect(function() {
      magicHook({}, 'not an Array');
    }).to.throw(Error);
  });

  it('should throw exception when called twice on the same object', function() {
    var a = {
      foo: noop
    };
    magicHook(a, ['hook']);
    expect(function() {
      magicHook(a, ['hook']);
    }).to.throw(Error);
  });

  it('should throw exception when object has pre method', function() {
    var a = {
      pre: noop,
      foo: noop
    };
    expect(function() {
      magicHook(a, ['hook']);
    }).to.throw(Error);
  });

  it('should call function when no hooks', function(done) {
    var a = {
      foo: function(value) {
        expect(value).to.eq(1);
        done();
      }
    };
    magicHook(a, ['foo']);
    a.foo(1);
  });

  it('should modify args when 1 hook', function(done) {
    var a = {
      foo: function(value) {
        expect(value).to.eq(2);
        done();
      }
    };
    magicHook(a, ['foo']);
    a.pre('foo', function(next, value) {
      next(value + 1);
    });
    a.foo(1);
  });

  it('should call hooks in correct order', function(done) {
    var pre1 = sinon.spy(function(next, a, b) {
      next(a + 1, b);
    });
    var pre2 = sinon.spy(function(next, a, b) {
      next(a, b + 1);
    });
    var a = {
      foo: function(a, b) {
        expect(a).to.eq(2);
        expect(b).to.eq(2);
        expect(pre1).to.have.been.calledBefore(pre2);
        done();
      }
    };
    magicHook(a, ['foo']);
    a.pre('foo', pre1);
    a.pre('foo', pre2);
    a.foo(1, 1);
  });

  it('should hook several methods', function() {
    var hook1 = sinon.spy();
    var hook2 = sinon.spy();
    var a = {
      foo: hook1,
      bar: hook2
    };
    magicHook(a, ['foo', 'bar']);
    a.pre('foo', function(next, value) {
      next(value + 1);
    });
    a.pre('bar', function(next, value) {
      next(value + 2);
    });
    a.foo(1);
    a.bar(2);

    expect(hook1).to.have.been.calledWithExactly(2);
    expect(hook2).to.have.been.calledWithExactly(4);
  });

  it('should hook all methods when not specified which', function() {
    var hook1 = sinon.spy();
    var hook2 = sinon.spy();
    var a = {
      foo: hook1,
      bar: hook2
    };
    magicHook(a);
    a.pre('foo', function(next, value) {
      next(value + 1);
    });
    a.pre('bar', function(next, value) {
      next(value + 2);
    });
    a.foo(1);
    a.bar(2);

    expect(hook1).to.have.been.calledWithExactly(2);
    expect(hook2).to.have.been.calledWithExactly(4);
  });
});

describe('pre', function() {
  it('should throw exception when no parameters passed', function() {
    var a = {
      foo: noop
    };
    magicHook(a, ['foo']);
    expect(function() {
      a.pre();
    }).to.throw(Error);
  });

  it('should throw exception when name is not string', function() {
    var a = {
      foo: noop
    };
    magicHook(a, ['foo']);
    expect(function() {
      a.pre(1);
    }).to.throw(Error);
  });

  it('should throw exception when passed pre is not a function', function() {
    var a = {
      foo: noop
    };
    magicHook(a, ['foo']);
    expect(function() {
      a.pre('foo', 1);
    }).to.throw(Error);
  });

  it('should throw exception when there\'s' +
    ' no hook with the passed name', function() {
    var a = {
      foo: noop
    };
    magicHook(a, ['foo']);
    expect(function() {
      a.pre('notExistingHook', noop);
    }).to.throw(Error);
  });
});

describe('removePre', function() {
  it('should be able to remove a particular pre', function(done) {
    var pre1 = sinon.spy(function(next, value) {
      next(value);
    });
    var pre2 = sinon.spy(function(next, value) {
      next(value + 100);
    });
    var a = {
      foo: function(value) {
        expect(value).to.eq(1);
        expect(pre1).to.have.been.calledOnce;
        expect(pre2).to.not.have.been.called;
        done();
      }
    };
    magicHook(a, ['foo']);
    a.pre('foo', pre1);
    a.pre('foo', pre2);
    a.removePre('foo', pre2);
    a.foo(1);
  });

  it('should be able to remove all pres associated with a hook', function(done) {
    var pre1 = sinon.spy(function(next, value) {
      next(value);
    });
    var pre2 = sinon.spy(function(next, value) {
      next(value + 100);
    });
    var a = {
      foo: function(value) {
        expect(value).to.eq(1);
        expect(pre1).to.not.have.been.called;
        expect(pre2).to.not.have.been.called;
        done();
      }
    };
    magicHook(a, ['foo']);
    a.pre('foo', pre1);
    a.pre('foo', pre2);
    a.removePre('foo');
    a.foo(1);
  });
});
