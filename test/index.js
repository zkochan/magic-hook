'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var expect = chai.expect;
var magicHook = require('../');

describe('magic-hook', function() {
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
});
