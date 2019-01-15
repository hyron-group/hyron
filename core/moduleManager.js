const http = require("http");
const RouterFactory = require("./routerFactory");
const Middleware = require('./middleware');
const generalSecretKey = require("../lib/generalKey");
const loadConfigFromFile = require('../lib/configReader');
const homeDir = require('../lib/homeDir');
const {
    getBaseURI
} = require('../lib/completeUrl');
const path = require('path');
var defaultConfig = loadConfigFromFile();

var instanceContainer = {};

/**
 * This class is used to setup & run a hyron server app
 */
class ModuleManager {

    static build(path) {
        const appLoader = require('./appLoader');
        appLoader(path);
    }


    /**
     * @description Get an instance of server app. It can be used to listen to client request at special host and post
     * 
     * ### Overload :
     * - getInstance(port:number)
     * - getInstance(baseURI:string)
     * - getInstance(cfg:object)
     * - getInstance(port:number, host:string, prefix:string, protocols:string)
     * @returns {ModuleManager}
     */
    static getInstance(...args) {
        var newInstance = new ModuleManager();
        var instanceConfig = {
            protocols: "http",
            host: "localhost",
            port: 3000,
            prefix: "",
            baseURI: "http://localhost:3000",
            isDevMode: true,
            secret: generalSecretKey(),
            ...defaultConfig[this.baseURI]
        };

        if (args.length == 1) {
            var arg0 = args[0];
            if (typeof arg0 == "object") {
                Object.assign(instanceConfig, arg0);
                instanceConfig.baseURI = getBaseURI(
                    instanceConfig.protocols,
                    instanceConfig.host,
                    instanceConfig.port,
                    instanceConfig.prefix);
            } else if (typeof arg0 == "number") {
                instanceConfig.port = arg0;
                instanceConfig.baseURI = getBaseURI(
                    instanceConfig.protocols,
                    instanceConfig.host,
                    arg0,
                    instanceConfig.prefix);

            } else if (typeof arg0 == "string") {
                var reg = /^(([\w\d]+):\/\/([\w\d.-]+)(:([\d]+))?(\/([\w\d\/.-]+)?)?)/g;

                var match = reg.exec(arg0);
                if (match == null) throw new TypeError("Cannot parse uri from getInstance(..) argument at index 0")
                instanceConfig = {
                    baseURI: match[1],
                    protocols: match[2],
                    host: match[3],
                    port: match[5],
                    prefix: match[7]
                }
            } else throw new TypeError(`getInstance(..) argument at index 0 should be a port number, string base uri or object instance config`);
        } else if (args.length > 1) {
            return ModuleManager.getInstance({
                port: args[0] || instanceConfig.port,
                host: args[1] || instanceConfig.host,
                prefix: args[2] || instanceConfig.prefix,
                protocols: args[3] || instanceConfig.protocols,
            })
        }

        Object.assign(newInstance, {
            addons: {},
            plugins: {},
            service: {},
            config: instanceConfig,
            routerFactory: new RouterFactory(instanceConfig),
            app: http.createServer(),
        });
        loadAddonsFromConfig.call(newInstance);
        loadPluginsFromConfig.call(newInstance);
        setupDefaultListener.call(newInstance);

        instanceContainer[instanceConfig.baseURI] = newInstance;
        return newInstance;
    }

    /**
     *@description Setup app or plugins with config
     * @param {object} config
     * @param {boolean} [config.isDevMode=true] if is true, app will collect bug, log for development. Else, app will be optimized for performance
     * @param {boolean} [config.style] format event name to target format. include : camel, snake, lisp, lower
     * @param {string} [config.poweredBy=hyron] set poweredBy header for this app
     */
    setting(config) {
        if (typeof config != "object") return;

        Object.assign(this.config, config);

        if (config.protocols || config.host || config.port || config.prefix) {
            this.config.baseURI = getBaseURI(
                this.config.protocols,
                this.config.host,
                this.config.port,
                this.config.prefix);
        }

        this.enableAddons(this.addons);
        this.enableServices(this.services);
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
     * @description Turn on addons for that instance
     * @param {Array.<function>} addonsList list of addons
     * @memberof ModuleManager
     */
    enableAddons(addonsList) {
        if (addonsList == null) return;
        if (addonsList.constructor.name != "Object") {
            throw new TypeError('enableAddons(..) args at index 0 must be Object');
        }

        Object.assign(this.addons, addonsList);

        for (var addonsName in addonsList) {
            var addonsHandle = addonsList[addonsName];

            if (typeof addonsHandle == 'string') {
                addonsHandle = loadPackageByPath(addonsHandle);
            }
            addonsHandle.call(this, defaultConfig[addonsName]);
        }
    }

    /**
     * @description Register plugins
     * @param {{name:string,meta}} pluginsList
     */
    enablePlugins(pluginsList) {
        if (pluginsList == null) return;
        if (pluginsList.constructor.name != "Object") {
            throw new TypeError('enablePlugins(..) args at index 0 must be Object');
        }

        Object.assign(this.plugins, pluginsList);

        Object.keys(pluginsList).forEach(name => {
            var pluginConfig = defaultConfig[name];
            var pluginsMeta = pluginsList[name];
            if (typeof pluginsMeta == 'string') {
                pluginsMeta = loadPackageByPath(pluginsMeta);
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
        this.services = moduleList;
        if (moduleList.constructor.name != "Object") {
            throw new TypeError('enableServices(..) args at index 0 must be Object');
        }

        Object.assign(this.services, moduleList);

        Object.keys(moduleList).forEach(moduleName => {
            // routePackage is path
            var routePackage = moduleList[moduleName];
            if (typeof routePackage == "string") {
                routePackage = loadPackageByPath(routePackage);
            }
            if (routePackage.requestConfig == null) {
                // is unofficial service
                try {
                    var serviceConfig = defaultConfig[moduleName];
                    var unofficialServiceConfig = {
                        ...this.config,
                        ...serviceConfig
                    };
                    routePackage(this.app, unofficialServiceConfig);
                } catch (err) {
                    console.error(
                        `Hyron do not support for service define like '${moduleName}' yet`
                    );
                }
            } else {
                // is as normal hyron service
                this.routerFactory.registerRoutesGroup(
                    this.config.prefix,
                    moduleName,
                    routePackage
                );
            }
        });
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
        var {
            host,
            port,
        } = this.config;
        this.app.on("request", (req, res) => {
            this.routerFactory.triggerRouter(req, res);
        });

        if (callback != null)
            this.app.listen(port, host, callback);
        else this.app.listen(port, host);
        return this.app;
    }


}

function setupDefaultListener() {

    this.app.on("listening", () => {
        var {
            protocols,
            host,
            port,
            prefix
        } = this.config;

        if (port == 0) {
            var randomPort = this.app.address().port;
            this.config.port = randomPort;
            this.config.baseURI = getBaseURI(protocols, host, randomPort, prefix);
        }
    });

    this.app.on("listening", () => {
        console.log(
            `\nServer started at : ${this.config.baseURI}`
        );
    })
}


function registerMiddleware(name, isFontware, meta, config) {
    if (typeof meta == "object") {
        Middleware.addMiddleware(name, isFontware, meta, config);
    } else if (typeof meta == "string") {
        try {
            meta = require(meta);
            return registerMiddleware(name, isFontware, meta, config);
        } catch (err) {
            console.warn(`Can't load plugins '${name}' because ${err.message}`)
        }
    } else throw new TypeError(`metadata of plugins '${name}' must be object or string`)

}

function loadAddonsFromConfig() {
    this.enableAddons(defaultConfig.addons);
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
        // for client service
        output = require(path.join(homeDir, packLocation));
    } catch (err) {
        if (output == null)
            // for installed service
            output = require(packLocation);
    }

    return output;
}



module.exports = ModuleManager;