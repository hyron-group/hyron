const spdy = require('spdy');
const fs = require('fs');
const {
    getBaseURI
} = require('../../lib/completeUrl');


module.exports = function (options) {
    var protocols = this.config.protocols;
    if (protocols == "http2" || protocols == "https") {
        var key = this.config.key;
        var cert = this.config.cert;

        var http2Options = {
            key: null,
            cert: null,
            spdy: {
                protocols: ['h2', 'spdy/3.1'],
                plain: false,
            },
            ...options
        }

        if (key != null)
            http2Options.key = fs.readFileSync(key);
        if (cert != null)
            http2Options.cert = fs.readFileSync(cert);

        this.config.protocols = "https";
        
        this.setServer(this.host, this.port, null);
        this.initServer(spdy.createServer(http2Options));
    }
}