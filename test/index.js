/**require('./benchmark/raw-node');
// require('./benchmark/express');
require('./benchmark/hyron')
*/

var assert = require('assert')
var hyron = require('../')

describe('hyron', function(){
    it('should register an instance without address', function(){
        var app = hyron.getInstance()
        assert.strictEqual(typeof app, 'object')
    })

    it('should register an instance with address', function(){
        var app = hyron.getInstance(3000, 'localhost')
        assert.strictEqual(typeof app, 'object')
    })
})