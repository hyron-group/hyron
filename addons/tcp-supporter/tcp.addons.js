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

        var tcpCfg = {
            key: null,
            cert: null,
            spdy: {
                protocols: ['h2', 'spdy/3.1'],
                plain: false,
            },
            ...options
        }

        if (key != null)
            tcpCfg.key = fs.readFileSync(key);
        if (cert != null)
            tcpCfg.cert = fs.readFileSync(cert);

        this.protocols = "https";
        
        this.setServer(this.host, this.port, null);
        this.initServer(spdy.createServer(tcpCfg));
    }
}