const http2 = require('http2');

module.exports = function () {
    console.log('http addons');
    if(this.protocols=="http2"){
        this.app = http2.createServer();
    }
}