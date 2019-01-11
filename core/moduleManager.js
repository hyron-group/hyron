const http = require("http");
const RouterFactory = require("./routerFactory");
const Middleware = require('./middleware');
const generalSecretKey = require("../lib/generalKey");
const loadConfigFromFile = require('../lib/configReader');
const path = require('path');

var projectDir = __dirname.substr(0, __dirname.indexOf("node_modules"));
if (projectDir == "") {
    projectDir = path.join(__dirname, "../");
};
var defaultConfig = loadConfigFromFile();

var instanceContainer = {};

/**
 * This class is used to setup & run a hyron server app
 */
class ModuleManager {
    /**
     * @description Get an instance of server app. It can be used to listen to client request at special host and post
     * @static
     * @param {number} [port=3000] port number of server app listen in
     * @param {string} [host=localhost] address of server app listen in
     * @param {string} prefix of app instance. It is used when you have multi app instance, make listener hold on : http://host:port/[prefix]
     * @returns {ModuleManager}
     */
    static getInstance(port = 3000, host = "localhost", prefix = "") {
        var newInstance = new ModuleManager();
        newInstance.port = port;
        newInstance.host = host;
        newInstance.prefix = prefix;
        newInstance.baseURI = defaultConfig.base_uri || "http://" + host + ":" + port;
        console.log();
        newInstance.config = {
            isDevMode: true,
            baseURI: newInstance.baseURI,
            secret: generalSecretKey(),
            poweredBy: "hyron",
            timeout: 10000,
        };
        loadPluginsFromConfig.call(newInstance);
        newInstance.routerFactory = new RouterFactory(newInstance.config);
        newInstance.app = http.createServer();

        instanceContainer[newInstance.baseURI] = newInstance;
        return instanceContainer[newInstance.baseURI];
    }

    /**
     * @description Turn on addons for that instance
     * @param {Array.<function>} addonsList list of addons
     * @memberof ModuleManager
     */
    enableAddons(addonsList) {
        for (var i = 0; i < addonsList.length; i++) {
            var addonsHandle = addonsList[i];

            if (typeof addonsHandle == 'string') {
                addonsHandle = loadPackageByPath(addonsHandle);
                if (addonsHandle == null)
                    throw new ReferenceError(`Can't load addons at index '${i}'`);

            }
            addonsHandle.call(this);
        }
    }

    /**
     * @description Register plugins
     * @param {{name:string,meta}} pluginsList
     */
    enablePlugins(pluginsList) {
        if (pluginsList == null) return;
        if (pluginsList.constructor.name != "Object") {
            throw new TypeError('enablePlugins args at index 0 must be Object');
        }

        Object.keys(pluginsList).forEach(name => {
            var pluginConfig = defaultConfig[name];
            var pluginsMeta = pluginsList[name];
            if (typeof pluginsMeta == 'string') {
                pluginsMeta = loadPackageByPath(pluginsMeta);
                // console.log(pluginsMeta);
                if (pluginsMeta == null)
                    throw new ReferenceError(`Can't load plugins '${name}'`);
            }
            var fontwareMeta = pluginsMeta.fontware;
            var backwareMeta = pluginsMeta.backware;
            if (fontwareMeta != null)
                registerMiddleware(name, true, fontwareMeta, pluginConfig);
            if (backwareMeta != null)
                registerMiddleware(name, false, backwareMeta, pluginConfig);
        });
    }


    /**
     * @description Register router with function packages
     * @param {{moduleName:string,AbstractRouters}} moduleList a package of main handle contain business logic
     */
    enableServices(moduleList) {
        if (moduleList == null) return;
        if (moduleList.constructor.name == "object") {
            throw new TypeError('enableServices args at index 0 must be Object');
        }

        Object.keys(moduleList).forEach(moduleName => {
            // routePackage is path
            var routePackage = moduleList[moduleName];
            if (typeof routePackage == "string") {
                routePackage = loadPackageByPath(routePackage);
                if (routePackage == null)
                    throw new ReferenceError(`Can't load service '${moduleName}'`);
            }
            if (routePackage.requestConfig == null) {
                // not is a hyron service
                try {
                    var config = this.config;
                    var serviceConfig = defaultConfig[moduleName];
                    if (serviceConfig != null) Object.assign(config, serviceConfig);
                    routePackage(this.app, config);
                } catch (err) {
                    console.log(err);
                    logger.error(
                        `Hyron do not support for service define like '${moduleName}' yet`
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
     *@description Setup app or plugins with config
     * @param {object} config
     * @param {boolean} [config.isDevMode=true] if true, app will collect bug, log for development. Else, app will be optimized for performance
     * @param {boolean} [config.style] format event name to target format. include : camel, snake, lisp, lower
     * @param {string} [config.poweredBy=hyron] set poweredBy header for this app
     */
    setting(config) {
        if (typeof config == "object") Object.assign(this.config, config);
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
     * @description start server
     * @param {function} callback a function will be call when server started
     */
    startServer(callback) {
        this.app.on("request", (req, res) => {
            this.routerFactory.triggerRouter(req, res);
        });

        if (typeof callback != "function") {
            callback = () => {
                logger.success(
                    `\nServer started at : http://${this.host}:${this.port}`
                );
            };
        }

        this.app.listen(this.port, this.host, callback);
        return this.app;
    }


}


function registerMiddleware(name, isFontware, meta, config) {
    if (typeof meta == "object") {
        Middleware.addMiddleware(name, isFontware, meta, config);
    } else if (typeof meta == "string") {
        try {
            meta = require(meta);
            return registerMiddleware(name, isFontware, meta, config);
        } catch (err) {
            logger.warn(`Can't load plugins '${name}' because ${err.message}`)
        }
    } else throw new TypeError(`metadata of plugins '${name}' must be object or string`)

}

function loadPluginsFromConfig() {
    var fontware = defaultConfig.fontware;
    var backware = defaultConfig.backware;
    var plugins = defaultConfig.plugins;

    this.enablePlugins(plugins);

    if (fontware != null)
        Object.keys(fontware).forEach(name => {
            var metaPath = fontware[name];
            var fontwareMeta = require(metaPath);
            registerMiddleware(name, true, fontwareMeta, defaultConfig[name]);
        })

    if (backware != null)
        Object.keys(backware).forEach(name => {
            var metaPath = backware[name];
            var backwareMeta = require(metaPath);
            registerMiddleware(name, false, backwareMeta, defaultConfig[name]);
        })
}

function loadPackageByPath(packLocation) {
    var output;
    try {
        output = require(path.join(projectDir, packLocation));
    } catch (err) {}
    if (output == null)
        try {
            // for installed service
            output = require(packLocation);
        } catch (err) {}
    return output;
}



module.exports = ModuleManager;