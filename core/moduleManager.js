const http = require("http");
const RouterFactory = require("./routerFactory");
const generalSecretKey = require("../lib/generalKey");
const { addMiddleware, getMiddleware } = require("./middleware");
const loadConfigFromFile = require("../lib/configReader");
const AbstractRouters = require("../type/AbstractRouters");
const path = require("../type/path");

var defaultConfig = {
    ...loadConfigFromFile()
};

var instanceContainer = {};

/**
 * This class used to setup & run a hyron server app
 */
module.exports = class ModuleManager {
    /**
     * @description Get a instance of server app. It can used to listen client request at sepecial host and post
     * @static
     * @param {number} [port=3000] number of server app listen in
     * @param {string} [host=localhost] name of server app listen in
     * @param {string} name of app instance. It used when you have multi app instance, make listener hold on : http://host:port/[prefix]
     * @returns {ModuleManager}
     */
    static getInstance(port=3000, host='localhost', prefix = "") {
        var newInstance = new ModuleManager();
        newInstance.port = port;
        newInstance.host = host;
        newInstance.prefix = prefix;
        newInstance.baseURI = host + ":" + port;
        newInstance.enableMiddlewareByConfigFile();
        newInstance.config = {
            isDevMode: true,
            enableRESTFul: false,
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

    /**@deprecated This method automatic execute first time you require('hyron'). You don't need to call it again */
    enableMiddlewareByConfigFile() {
        var fontWareList = defaultConfig.fontware;
        if (fontWareList != null)
            Object.keys(fontWareList).forEach(name => {
                try {
                    var handle = require(fontWareList[name]);
                    var pluginConfig = ModuleManager.getConfig(name);
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
                    var pluginConfig = ModuleManager.getConfig(name);
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
     * @param {boolean} [config.enableRESTFul=false] if true, app will support for REST-API. Enable REST method in requestConfig() method
     * @param {string} [config.poweredBy=hyron] set poweredBy header for this app
     */
    setting(config) {
        if (typeof config == "object") Object.assign(this.config, config);
    }

    /**
     * @description Return config of app or it plugins
     *
     * @static
     * @param {string} name name of app setting field or a installed plugin
     * @returns {string|object} config value
     */
    static getConfig(name) {
        return defaultConfig[name];
    }

    /**
     * @description Return set of instance created. It can be used by 3rth addons
     *
     * @static
     * @returns {{baseURI:string,instance:ModuleManager}} instances created by getInstance()
     */
    static getInstanceManager() {
        return instanceContainer;
    }

    /**
     * @description Register router by function packages
     * @param {{moduleName:string,AbstractRouters}} moduleList a package of main handle contain business logic
     */
    enableService(moduleList) {
        if (typeof moduleList == "object")
            Object.keys(moduleList).forEach(moduleName => {
                var routePackage = moduleList[moduleName];
                if (typeof routePackage == "string")
                    routePackage = require('../../'+routePackage);
                if (routePackage.requestConfig == null) {
                    // not is a hyron service
                    try {
                        routePackage(this.baseURI, moduleName);
                    } catch (err) {
                        console.error(
                            `hyron do not support for service define like '${moduleName}' yet`
                        );
                    }
                } else {
                    // is as normal hyron service
                    this.routerFactory.registerRoutesGroup(
                        this.prefix,
                        moduleName,
                        routePackage
                    );
                }
                path.build(
                    routePackage,
                    "http://" + this.baseURI,
                    this.prefix,
                    moduleName
                );
            });
    }

    /**
     * @typedef {object} CustomHandle
     * @prop {function} handle a function to handle with data
     * @prop {boolean} global true if this handle is a global function, and can be run by most of routers
     */

    /**
     * @typedef {function|CustomHandle} MidwareMeta
     */

    /**
     * @description Register functions run before a router. Any predefined function will run first
     * @param {{name:string,MidwareMeta}} fontWareList
     */
    enableFontWare(fontWareList) {
        if (typeof fontWareList == "object")
            Object.keys(fontWareList).forEach(name => {
                var config = fontWareList[name];
                this.addMiddleware(name, config, true);
            });
    }

    /**
     * @description retrieve a fontware by name
     * @param {string} name
     * @returns function handle
     */
    getFontWare(name){
        return getMiddleware(name)
    }

     /**
     * @description retrieve a backware by name
     * @param {string} name
     * @returns function handle
     */
    getBackWare(name){
        return getMiddleware(name);
    }

    /**
     * @description Register functions run after a router. Any predefined function will run last
     * @param {{name:string,MidwareMeta}} backWareList
     */
    enableBackWare(backWareList) {
        if (typeof backWareList == "object")
            Object.keys(backWareList).forEach(name => {
                this.addMiddleware(name, backWareList[name], false);
            });
    }

    /**
     * @description Register a single middleware as fontware or backware
     * @param {String} name name of this middleware
     * @param {MidwareMeta} meta contain config of this middware
     * @param {boolean} inFont true if it is a fontware or false if it is a backware
     */
    addMiddleware(name, meta, inFont) {
        var handler = meta;
        var isGlobal = false;
        if (typeof handler == "string") {
            handler = require(handler);
        }
        if (typeof handler == "object") {
            if (handler.global == true) isGlobal = true;
            handler = handler.handle;
            if (typeof handler == "string") {
                handler = require(handler);
            }
        } else if (typeof handler != "function") {
            throw new Error(
                `${
                    inFont ? "Fontware" : "Backware"
                }} ${name} haven't declare handle properties`
            );
        }
        var pluginConfig = ModuleManager.getConfig(name);

        addMiddleware(name, handler, isGlobal, inFont, pluginConfig);
    }

    /**
     * @description start server
     * @param {function} callback a function will be call when server started
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
        return this.app;
    }
};
