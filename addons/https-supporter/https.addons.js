module.exports = function (options) {
    if (this.config.protocols != "https") return;

    console.log("supported for https")
    const https = require('https');
    const fs = require('fs');

    var key = this.config.key;
    var cert = this.config.cert;
    var httpsOptions;
    if (key != null && cert != null) {
        key = fs.readFileSync(key);
        cert = fs.readFileSync(cert);
        httpsOptions = {
            key,
            cert,
            ...options
        }

    }
    var events = this.app._events;
    this.app = https.createServer(httpsOptions, (req, res)=>{
        this.routerFactory.triggerRouter(req, res);
    });
    Object.assign(this.app._events, events);
    this.startServer = startServer;
}

function startServer(cb) {
    this.app.listen();
}

require('ini')