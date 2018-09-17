const http = require("http");
const RouterFactory = require("./routerFactory");
const { generalSecretKey } = require("../lib/token");
const { addMiddleware } = require("./middleware");
const loadConfigFromFile = require("../lib/configReader");

var defaultConfig = {
    ...loadConfigFromFile()
};

var instanceContainer = {};

module.exports = class ModuleManager {
    static getInstance(port = 3000, host = "localhost", prefix = "") {
        var newInstance = new ModuleManager();
        newInstance.port = port;
        newInstance.host = host;
        newInstance.prefix = prefix;
        newInstance.baseURI = host + ":" + port;
        newInstance.enableMiddlewareByConfigFile();
        newInstance.config = {
            isDevMode: true,
            enableRESTFul: true,
            secret: generalSecretKey(),
            baseURI: newInstance.baseURI,
            viewEngine: null,
            homeDir: "./",
            allowCache: true,
            poweredBy: "hyron",
            hotReload: false,
            timeout: 60000,
            ...defaultConfig[newInstance.baseURI]
        };
        newInstance.routerFactory = new RouterFactory(newInstance.config);
        newInstance.app = http.createServer();

        instanceContainer[newInstance.baseURI] = newInstance;
        return instanceContainer[newInstance.baseURI];
    }

    enableMiddlewareByConfigFile() {
        var fontWareList = defaultConfig.fontware;
        Object.keys(fontWareList).forEach(name => {
            var handle = require(fontWareList[name]);
            addMiddleware(name, handle, true, true);
        });

        var backWareList = defaultConfig.backware;
        Object.keys(backWareList).forEach(name => {
            var handle = require(fontWareList[name]);
            addMiddleware(name, handle, true, false);
        });
    }

    setting(config = {}) {
        Object.assign(this.config, config);
    }

    static getConfig(name) {
        return defaultConfig[name];
    }

    static getInstanceManager() {
        return instanceContainer;
    }

    enableModule(moduleList) {
        var url = "/" + this.prefix;
        Object.keys(moduleList).forEach(moduleName => {
            this.routerFactory.registerRouter(
                url,
                moduleName,
                moduleList[moduleName]
            );
        });
    }

    enableFontWare(fontWareList) {
        Object.keys(fontWareList).forEach(name => {
            this.addMiddleware(name, fontWareList[name], true);
        });
    }

    enableBackWare(backWareList) {
        Object.keys(backWareList).forEach(name => {
            this.addMiddleware(name, backWareList[name], false);
        });
    }

    addMiddleware(name, meta, inFont) {
        var handler = meta;
        var isGlobal = false;
        if (typeof handler == "object") {
            if (handler.global == true) isGlobal = true;
            handler = handler.handle;
        } else if (typeof handler != "function") {
            throw new Error(
                `${
                    inFont ? "Fontware" : "Backware"
                }} ${name} haven't declare handle properties`
            );
        }

        addMiddleware(name, handler, isGlobal, inFont);
    }

    startServer(callback) {
        this.app.on("request", (req, res) => {
            this.routerFactory.triggerRouter(req, res);
        });

        if (typeof callback != "function") {
            callback = () => {
                console.log(
                    `\nServer started at : http://${this.host}:${this.port}`
                );
            };
        }

        this.app.listen(this.port, this.host, callback);
    }
};
