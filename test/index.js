var assert = require('assert')
var hyron = require('../')
var logger = require('../lib/logger')
var sinon = require('sinon')
var proxyquire = require('proxyquire')

proxyquire = proxyquire.noCallThru().noPreserveCache()

describe('hyron', function(){
    beforeEach(function(){
        this.stubInfo = sinon.stub(logger, 'info')
        this.stubError = sinon.stub(logger, 'error')
        this.stubWarn = sinon.stub(logger, 'warn')
    })
    afterEach(function(){
        this.stubInfo.restore()
        this.stubError.restore()
        this.stubWarn.restore()
    })
    it('should register an instance without address', function(){
        var app = hyron.getInstance()
        assert.strictEqual(typeof app, 'object')
    })

    it('should register an instance with address', function(){
        var app = hyron.getInstance(3000, 'localhost')
        assert.strictEqual(typeof app, 'object')
    })
})