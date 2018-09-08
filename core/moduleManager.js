const http = require("http");
const RouterFactory = require("./routerFactory");
const { generalSecretKey } = require("../lib/token");
const { addMiddleware } = require("./middleware");
const configLoaded = require("../lib/configReader");

var defaultConfig = {
    prefix: "",
    inDevMode: true,
    secret: generalSecretKey()
};

module.exports = class {
    constructor(port = 3000, host = "localhost", prefix = "") {
        this.port = port;
        this.host = host;
        this.prefix = prefix;
        this.loadConfigFile();
    }

    loadConfigFile() {
        var config = configLoaded();
        Object.assign(defaultConfig, config);
        var fontwareList = config.fontware;
        Object.keys(fontwareList).forEach(key => {
            fontwareList[key] = {
                global: true,
                name: key,
                handle: require(fontwareList[key])
            };
        });
        this.enableFontware(config.fontware);

        var backwareList = config.backware;
        Object.keys(backwareList).forEach(key => {
            backwareList[key] = {
                global: true,
                name: key,
                handle: require(backwareList[key])
            };
        });
        this.enableBackware(config.backware);
        this.routerFactory = new RouterFactory(config);
    }

    setting(
        config = {
            viewEngine: null,
            homeDir: "./",
            allowCache: true,
            enableRestful: false,
            poweredBy: "hyron",
            hotReload: false,
            timeout: 60000
        }
    ) {
        Object.assign(this.config, config);
    }

    static getConfig(name) {
        return defaultConfig[name];
    }

    enableModule(moduleList) {
        var url = this.prefix;
        if (url != "") url = "/" + url;
        url += "/";
        Object.keys(moduleList).forEach(moduleName => {
            this.routerFactory.registerRouter(
                url,
                moduleName,
                moduleList[moduleName]
            );
        });
    }

    enableFontware(fontwareList) {
        Object.keys(fontwareList).forEach(name => {
            this.addMiddleware(name, fontwareList[name], true);
        });
    }

    enableBackware(backwareList) {
        Object.keys(backwareList).forEach(name => {
            this.addMiddleware(name, backwareList[name], false);
        });
    }

    addMiddleware(name, meta, inFont) {
        var handler = meta;
        var isGlobal = false;
        if (typeof handler == "object") {
            if (handler.global == true) isGlobal = true;
            handler = handler.handle;
        }
        if (typeof handler != "function") {
            throw new Error(
                `Fontware ${name} haven't declare handle properties`
            );
        }

        addMiddleware(name, handler, isGlobal, inFont);
    }

    startServer() {
        var app = http.createServer((req, res) => {
            this.routerFactory.triggerRouter(req, res);
        });
        app.listen(this.port, this.host, () => {
            console.log(
                `\nServer started at : http://${this.host}:${this.port}`
            );
        });
    }
};
