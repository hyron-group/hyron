const spdy = require('spdy');
const fs = require('fs');
const {getBaseURI} = require('../../lib/completeUrl')


function handle (options) {
    var protocol = this.protocol;
    if (protocol == "http2" || protocol == "https") {
        console.log("enable spdy")
        var key = this.key;
        var cert = this.cert;

        var tcpCfg = {
            key: null,
            cert: null,
            spdy: {
                protocol: ['h2', 'spdy/3.1'],
                plain: false,
            },
            ...options
        }

        if (key != null)
            tcpCfg.key = fs.readFileSync(key);
        if (cert != null)
            tcpCfg.cert = fs.readFileSync(cert);

        this.protocol = "https";
        this.baseURI = getBaseURI(this);
        
        this.setServer(this.host, this.port, null);
        this.initServer(spdy.createServer(tcpCfg));
    }
}

module.exports = handle;