const spdy = require('spdy');
const fs = require('fs');


module.exports = function (options) {
    var protocol = this.config.protocol;
    if (protocol == "http2" || protocol == "https") {
        console.log("enable spdy")
        var key = this.config.key;
        var cert = this.config.cert;

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
        
        this.setServer(this.host, this.port, null);
        this.initServer(spdy.createServer(tcpCfg));
    }
}