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
    /**
     * Get a instance of server app.
     *
     * @static
     * @param {number} [port=3000] port number of server app listen in
     * @param {string} [host="localhost"] host name of server app listen in
     * @param {string} [prefix=""] name of app instance. It used when you have multi app instance, make listener hold on : http://host:port/[prefix]
     * @returns {ModuleManager}
     */
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

    /**@deprecated This method automatic execute first time you require('hyron'). You don't need to call it again */
    enableMiddlewareByConfigFile() {
        var fontWareList = defaultConfig.fontware;
        if (fontWareList != null)
            Object.keys(fontWareList).forEach(name => {
                var handle = require(fontWareList[name]);
                addMiddleware(name, handle, true, true);
            });
        var backWareList = defaultConfig.backware;
        if (backWareList != null)
            Object.keys(backWareList).forEach(name => {
                var handle = require(backWareList[name]);
                addMiddleware(name, handle, true, false);
            });
    }

    /**
     *
     * @param {object} config setup app or it plugins with config
     * @param {boolean} [config.isDevMode=true] if true, app will collect bug, log for development. Else, app will optimized for performance
     * @param {boolean} [config.enableRESTFul=true] if true, app will support for REST-API. Enable REST method in requestConfig() method
     * @param {string} [config.poweredBy=hyron] set poweredBy header for this app
     * @param {boolean} [config.hotReload=false]: if true, server will listen every change and reset if nesecc of source code
     * 
     */
    setting(config) {
        Object.assign(this.config, config);
    }

    /**
     * return config value of name
     *
     * @static
     * @param {*} name name of app setting field or a installed plugin
     * @returns {*} config value
     */
    static getConfig(name) {
        return defaultConfig[name];
    }

    /**
     * return set of instance created
     *
     * @static
     * @returns {Object.<string,ModuleManager>} instances created by getInstance()
     */
    static getInstanceManager() {
        return instanceContainer;
    }

    
    enableModule(moduleList) {
        var url = "/" + this.prefix;
        if(this.prefix!="") url+='/';
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
