const http = require("http");
const RouterFactory = require("./routerFactory");
const { generalSecretKey } = require("../lib/token");
const { addMiddleware } = require("./middleware");
const loadConfigFromFile = require("../lib/configReader");

var defaultConfig = {
    ...loadConfigFromFile()
};

var instanceStorage = {};

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
            secret: generalSecretKey(),
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

        instanceStorage[newInstance.baseURI] = newInstance;

        return instanceStorage[newInstance.baseURI];
    }

    enableMiddlewareByConfigFile() {
        var fontwareList = defaultConfig.fontware;
        Object.keys(fontwareList).forEach(key => {
            fontwareList[key] = {
                global: true,
                name: key,
                handle: require(fontwareList[key])
            };
        });
        this.enableFontware(fontwareList);

        var backwareList = defaultConfig.backware;
        Object.keys(backwareList).forEach(key => {
            backwareList[key] = {
                global: true,
                name: key,
                handle: require(backwareList[key])
            };
        });
        this.enableBackware(backwareList);
    }

    setting(config = {}) {
        Object.assign(this.config, config);
    }

    static getConfig(name) {
        return defaultConfig[name];
    }

    static getInstanceManager() {
        return instanceStorage;
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
                `${
                    inFont ? "Fontware" : "Backware"
                }} ${name} haven't declare handle properties`
            );
        }

        addMiddleware(name, handler, isGlobal, inFont);
    }

    startServer() {
        this.app.on("request", (req, res) => {
            this.routerFactory.triggerRouter(req, res);
        });

        this.app.listen(this.port, this.host, () => {
            console.log(
                `\nServer started at : http://${this.host}:${this.port}`
            );
        });
    }
};
