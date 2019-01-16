const spdy = require('spdy');
const fs = require('fs');
const {
    getBaseURI
} = require('../../lib/completeUrl')


module.exports = function (options) {
    var protocols = this.config.protocols;
    if (protocols == "http2" || protocols == "https") {
        console.log('enable spdy');

        var key = this.config.key;
        var cert = this.config.cert;
        var events = this.app._events;

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
        this.app = spdy.createServer(http2Options);

        Object.assign(this.app._events, events);

        var {
            protocols,
            host,
            port,
            prefix
        } = this.config;
        this.config.baseURI = getBaseURI(protocols, host, port, prefix);

    }
}