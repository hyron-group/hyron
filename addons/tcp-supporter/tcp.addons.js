const spdy = require("spdy");
const fs = require("fs");
const {getBaseURL} = require("../../lib/completeUrl")
const ModuleManager = require("../../core/ModulesManager");
const chalk = require("chalk");

function handle (options) {
    var protocol = this.protocol;
    if (protocol == "http2" || protocol == "https") {
        console.log(chalk.gray("enable spdy"))
        var key = ModuleManager.getConfig("key");
        var cert = ModuleManager.getConfig("cert");

        var tcpCfg = {
            key: null,
            cert: null,
            spdy: {
                protocol: ["h2", "spdy/3.1"],
                plain: false,
            },
            ...options
        }

        if (key != null)
            tcpCfg.key = fs.readFileSync(key);
        if (cert != null)
            tcpCfg.cert = fs.readFileSync(cert);

        this.protocol = "https";
        this.baseURL = getBaseURL(this);
        
        ModuleManager.setServer(this.host, this.port, null);
        this.initServer(spdy.createServer(tcpCfg));
    }
}

module.exports = handle;