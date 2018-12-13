const http = require("http");
const RouterFactory = require("./routerFactory");
const Middleware = require('./middleware');
const generalSecretKey = require("../lib/generalKey");
const loadConfigFromFile = require('../lib/configReader');

var defaultConfig = loadConfigFromFile();

var instanceContainer = {};

/**
 * This class used to setup & run a hyron server app
 */
class ModuleManager {
    /**
     * @description Get a instance of server app. It can used to listen client request at sepecial host and post
     * @static
     * @param {number} [port=3000] number of server app listen in
     * @param {string} [host=localhost] name of server app listen in
     * @param {string} name of app instance. It used when you have multi app instance, make listener hold on : http://host:port/[prefix]
     * @returns {ModuleManager}
     */
    static getInstance(port = 3000, host = "localhost", prefix = "") {
        var newInstance = new ModuleManager();
        newInstance.port = port;
        newInstance.host = host;
        newInstance.prefix = prefix;
        newInstance.baseURI = defaultConfig.base_uri || "http://" + host + ":" + port;
        newInstance.config = {
            isDevMode: true,
            enableRESTFul: false,
            baseURI: newInstance.baseURI,
            secret: generalSecretKey(),
            poweredBy: "hyron",
            timeout: 60000,
        };
        loadPluginsFromConfig();
        newInstance.routerFactory = new RouterFactory(newInstance.config);
        newInstance.app = http.createServer();

        instanceContainer[newInstance.baseURI] = newInstance;
        return instanceContainer[newInstance.baseURI];
    }

    /**
     *@description Setup app or it plugins with config
     * @param {object} config
     * @param {boolean} [config.isDevMode=true] if true, app will collect bug, log for development. Else, app will optimized for performance
     * @param {boolean} [config.style] format event name to target format. include : camel, snake, lisp, lower
     * @param {boolean} [config.enableRESTFul=false] if true, app will support for REST-API. Enable REST method in requestConfig() method
     * @param {string} [config.poweredBy=hyron] set poweredBy header for this app
     */
    setting(config) {
        if (typeof config == "object") Object.assign(this.config, config);
    }

    /**
     * @description Turn on addons for that instance
     * @param {Array.<function>} addonsList list of addons
     * @memberof ModuleManager
     */
    enableAddons(addonsList) {
        for (var i = 0; i < addonsList.length; i++) {
            var addonsHandle = addonsList[i];
            if (typeof addonsHandle != 'function')
                throw new TypeError(`addons at index ${i} must be a function`);
            addonsHandle.apply(this);

        }
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
    static getInstanceContainer() {
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
                    routePackage = require("../../" + routePackage);
                if (routePackage.requestConfig == null) {
                    // not is a hyron service
                    try {
                        routePackage(this.port, this.host, this.prefix, this.config);
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
            });
    }

    /**
     * @description Register plugins
     * @param {{name:string,meta}} pluginsList
     */
    enablePlugins(pluginsList) {
        if (pluginsList == null) return;
        if (typeof pluginsList == "object")
            Object.keys(pluginsList).forEach(name => {
                var pluginConfig = defaultConfig[name];
                var pluginsMeta = pluginsList[name];
                if (typeof pluginsMeta == 'string') {
                    pluginsMeta = require(pluginsMeta);
                }
                var fontwareMeta = pluginsMeta.fontware;
                var backwareMeta = pluginsMeta.backware;
                if (fontwareMeta != null)
                    registerMiddleware(name, true, fontwareMeta, pluginConfig);
                if (backwareMeta != null)
                    registerMiddleware(name, false, backwareMeta, pluginConfig);
            });
        else throw new TypeError('Type of plugins meta must be Object declare config of plugins')
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


function registerMiddleware(name, isFontware, meta, config) {
    if (typeof meta == "object") {
        Middleware.addMiddleware(name, isFontware, meta, config);
    } else if (typeof meta == "string") {
        meta = require(meta);
        return registerMiddleware(name, isFontware, meta, config);
    } else throw new TypeError(`metadata of plugins '${name}' must be object or string`)

}

function loadPluginsFromConfig() {
    var fontware = defaultConfig.fontware;
    var backware = defaultConfig.backware;

    console.log(fontware);
    if(fontware!=null)
    Object.keys(fontware).forEach(name=>{
        var metaPath = fontware[name];
        var fontwareMeta = require(metaPath);
        registerMiddleware(name, true, fontwareMeta, defaultConfig[name]);
    })

    if(backware!=null)
    Object.keys(backware).forEach(name=>{
        var metaPath = backware[name];
        var backwareMeta = require(metaPath);
        registerMiddleware(name, true, backwareMeta, `defaultConfig`[name]);
    })
}



module.exports = ModuleManager;