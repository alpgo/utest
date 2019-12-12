const { Method } = require('../');

var assert = require('assert');

describe('method', function () {
    describe('static#getMethodType', function () {
        it('should return type of get', function () {
            const type = Method.getMethodType('fn-get');
            assert.equal(type, 'get');
        });
    });
});