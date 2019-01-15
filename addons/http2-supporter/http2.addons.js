module.exports = function (options) {
    if (this.config.protocols == "http2") {
        const http2 = require('http2');
        const fs = require('fs');

        var key = this.config.key;
        var cert = this.config.cert;
        if (key != null && cert != null) {
            key = fs.readFileSync(key);
            cert = fs.readFileSync(cert);
            var http2Options = {
                key,
                cert,
                ...options
            }
            this.app = http2.createSecureServer(http2Options);
            this.config.baseURI = `https://${host}`;
        } else this.app = http2.createServer();
    }
}