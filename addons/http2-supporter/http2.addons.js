const http2 = require('http2');

module.exports = function () {
    if(this.config.protocols=="http2"){
        console.log('enable http2 server')
        var secure = {
            key:this.config.key,
            cert:this.config.cert
        };
        this.app = http2.createServer(secure);
    }
}