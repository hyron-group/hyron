const http = require("http");
const RouterFactory = require("./routerFactory");
const generalSecretKey = require("../lib/generalKey");
const { addMiddleware } = require("./middleware");
const loadConfigFromFile = require("../lib/configReader");

var defaultConfig = {
    ...loadConfigFromFile()
};

var instanceContainer = {};

module.exports = class ModuleManager {
    /**
     * @description Get a instance of server app.
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
            timeout: 60000,
            ...defaultConfig[newInstance.baseURI]
        };
        newInstance.routerFactory = new RouterFactory(newInstance.config);
        newInstance.app = http.createServer();

        instanceContainer[newInstance.baseURI] = newInstance;
        return instanceContainer[newInstance.baseURI];
    }

    /**
     * @description add addons
     * @param {{eventName:string,handle:function}[]} addonsList
     */
    addons(addonsList) {
        if (addonsList != null) {
            addonsList.forEach(item => {
                Object.keys(item).forEach(eventName => {
                    var handler = item[eventName];
                    if (eventName == "config") {
                        handler(this.config);
                    } else if (eventName == "runtime") {
                        handler();
                    } else this.app.on(eventName, handler);
                });
            });
        }
    }

    /**@deprecated This method automatic execute first time you require('hyron'). You don't need to call it again */
    enableMiddlewareByConfigFile() {
        var fontWareList = defaultConfig.fontware;
        if (fontWareList != null)
            Object.keys(fontWareList).forEach(name => {
                try {
                    var handle = require(fontWareList[name]);
                    var pluginConfig =  ModuleManager.getConfig(name);
                    addMiddleware(name, handle, true, true, pluginConfig);
                } catch (err) {
                    console.error(
                        `[warning] can't setup fontware : '${name}' because ${
                            err.message
                        }`
                    );
                }
            });
        var backWareList = defaultConfig.backware;
        if (backWareList != null)
            Object.keys(backWareList).forEach(name => {
                try {
                    var handle = require(backWareList[name]);
                    var pluginConfig =  ModuleManager.getConfig(name);
                    addMiddleware(name, handle, true, false, pluginConfig);
                } catch (err) {
                    console.error(
                        `[warning] can't setup backware : '${name}' because ${
                            err.message
                        }`
                    );
                }
            });
    }

    /**
     *@description Setup app or it plugins with config
     * @param {object} config
     * @param {boolean} [config.isDevMode=true] if true, app will collect bug, log for development. Else, app will optimized for performance
     * @param {boolean} [config.enableRESTFul=true] if true, app will support for REST-API. Enable REST method in requestConfig() method
     * @param {string} [config.poweredBy=hyron] set poweredBy header for this app
     */
    setting(config) {
        Object.assign(this.config, config);
    }

    /**
     * @description Return config value of name
     *
     * @static
     * @param {*} name name of app setting field or a installed plugin
     * @returns {*} config value
     */
    static getConfig(name) {
        return defaultConfig[name];
    }

    /**
     * @description Return set of instance created
     *
     * @static
     * @returns {{baseURI:string,instance:ModuleManager}} instances created by getInstance()
     */
    static getInstanceManager() {
        return instanceContainer;
    }

    /**
     * @description Register router by function packages
     * @param {{moduleName:string,hyronClass:function}} moduleList
     */
    enableModule(moduleList) {
        var url = this.prefix;
        Object.keys(moduleList).forEach(moduleName => {
            this.routerFactory.registerRouter(
                url,
                moduleName,
                moduleList[moduleName]
            );
        });
    }

    /**
     * @description Register functions run before a router. Any predefined function will run first
     * @param {{name:string,handle:function|{method:string,handle:function,global:boolean}}} fontWareList
     */
    enableFontWare(fontWareList) {
        Object.keys(fontWareList).forEach(name => {
            this.addMiddleware(name, fontWareList[name], true);
        });
    }

    /**
     * @description Register functions run after a router. Any predefined function will run last
     * @param {{name:string,handle:function|{method:string,handle:function,global:boolean}}} backWareList
     */
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
        var pluginConfig =  ModuleManager.getConfig(name);

        addMiddleware(name, handler, isGlobal, inFont, pluginConfig);
    }

    /**
     * @description start server
     * @param {function} callback
     */
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
