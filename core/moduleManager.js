const http = require("http");
const RouterFactory = require("./routerFactory");
const Middleware = require('./middleware');
const generalSecretKey = require("../lib/generalKey");
const configReader = require('../lib/configReader');
const homeDir = require('../lib/homeDir');
const {
    getBaseURI
} = require('../lib/completeUrl');
const path = require('path');

var defaultConfig = configReader();
var instanceContainer = {};
var serverContainer = {};

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
     * - getInstance(port:number, host:string, prefix:string, protocol:string)
     * @returns {ModuleManager}
     */
    static getInstance(...args) {
        var newInstance = new ModuleManager();

        var serverConfig = {
            protocol: "http",
            host: "localhost",
            port: 3000,
            prefix: "",
        }

        var instanceConfig = {
            isDevMode: true,
            secret: generalSecretKey(),
            ...configReader.getConfig(serverConfig + ":" + host);
        };



        if (args.length == 1) {
            var arg0 = args[0];
            if (typeof arg0 == "object") {
                Object.assign(serverConfig, arg0);
            } else if (typeof arg0 == "number") {
                serverConfig.port = arg0;
            } else if (typeof arg0 == "string") {
                var reg = /^([\w\d]+):\/\/([\w\d.-]+)(:([\d]+))?(\/([\w\d\/.-]+)?)?/g;

                var match = reg.exec(arg0);
                if (match == null)
                    throw new TypeError("Cannot parse uri from getInstance(..) argument at index 0")
                serverConfig = {
                    protocol: match[1],
                    host: match[2],
                    port: match[4],
                    prefix: match[6]
                }
            } else if (arg0 == null) {
                return ModuleManager.getInstance(0);
            } else throw new TypeError(`getInstance(..) argument at index 0 should be a port number, string base uri or object instance config`);
        } else if (args.length > 1) {
            return ModuleManager.getInstance({
                port: args[0] || instanceConfig.port,
                host: args[1] || instanceConfig.host,
                prefix: args[2] || instanceConfig.prefix,
                protocol: args[3] || instanceConfig.protocol,
            })
        }

        var baseURI = getBaseURI(serverConfig);

        console.log(`\n\n--- ${baseURI} ---\n`);


        Object.assign(newInstance, {
            ...serverConfig,
            addons: {},
            plugins: {},
            service: {},
            config: instanceConfig,
        });
        loadAddonsFromConfig.call(newInstance);
        loadPluginsFromConfig.call(newInstance);

        newInstance.initServer(http.createServer());
        newInstance.routerFactory = new RouterFactory(instanceConfig);


        instanceContainer[baseURI] = newInstance;
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
        if (config.protocol != null)
            this.protocol = config.protocol;

        Object.assign(this.config, config);
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
        return configReader.readConfig(name);
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
                addonsHandle = loadModuleByPath(addonsName, addonsHandle);
            }
            
            addonsHandle.call(this, configReader.readConfig(addonsName));
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

        Object.keys(pluginsList).forEach(pluginName => {
            var pluginConfig = configReader.readConfig(pluginName);
            var pluginsMeta = pluginsList[pluginName];
            if (typeof pluginsMeta == 'string') {
                pluginsMeta = loadModuleByPath(pluginName, pluginsMeta);
            }
            var fontwareMeta = pluginsMeta.fontware;
            var backwareMeta = pluginsMeta.backware;
            if (fontwareMeta != null)
                registerMiddleware(pluginName, true, fontwareMeta, pluginConfig);
            if (backwareMeta != null)
                registerMiddleware(pluginName, false, backwareMeta, pluginConfig);
        });
    }


    /**
     * @description Register router with function packages
     * @param {{moduleName:string,AbstractRouters}} serviceList a package of main handle contain business logic
     */
    enableServices(serviceList) {
        if (serviceList == null) return;
        this.services = serviceList;
        if (serviceList.constructor.name != "Object") {
            throw new TypeError('enableServices(..) args at index 0 must be Object');
        }

        Object.assign(this.services, serviceList);

        Object.keys(serviceList).forEach(serviceName => {
            // routePackage is path
            var routePackage = serviceList[serviceName];
            if (typeof routePackage == "string") {
                routePackage = loadModuleByPath(serviceName, routePackage);
            }
            if (routePackage.requestConfig == null) {
                // is unofficial service
                try {
                    var serviceConfig = configReader.readConfig(serviceName);
                    var unofficialServiceConfig = {
                        ...this.config,
                        ...serviceConfig
                    };
                    routePackage(this.app, unofficialServiceConfig);
                } catch (err) {
                    console.error(
                        `Hyron do not support for service define like '${serviceName}' yet`
                    );
                }
            } else {
                // is as normal hyron service
                this.routerFactory.registerRoutesGroup(
                    this.prefix,
                    serviceName,
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

    initServer(defaultServer) {
        var key = this.host + ":" + this.port;
        var server = serverContainer[key];
        if (server != null) {
            this.app = server;
            return;
        };
        setupDefaultListener(this, defaultServer);
        serverContainer[key] = defaultServer;
        this.app = defaultServer;
    }

    setServer(host, port, server) {
        var key = host + ":" + port;
        return serverContainer[key] = server;
    }

    /**
     * @description start server
     * @param {function} callback a function will be call when server started
     */
    startServer(callback) {
        var host = this.host;
        var port = this.port;

        if (this.app.running) return this.app;

        this.app.on("request", (req, res) => {
            this.routerFactory.triggerRouter(req, res);
        });

        if (callback != null)
            this.app.listen(port, host, callback);
        else this.app.listen(port, host);
        this.app.running = true;
        return this.app;
    }

}

function setupDefaultListener(instance, server) {
    instance.app = server.on("listening", () => {
        if (instance.port == 0) {
            var randomPort = server.address().port;
            instance.port = randomPort;
        }

        var baseURI = getBaseURI({
            protocol: instance.protocol,
            host: instance.host,
            port: instance.port
        });

        console.log(`\nServer started at : ${baseURI}`);
    });

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

function loadModuleByPath(name, modulePath) {
    var output;
    try {
        // for client service
        output = require(path.join(homeDir, modulePath));
    } catch (err) {
        if (output == null)
            // for installed service
            output = require(modulePath);
    }

    configReader.readConfig(name, modulePath);
    return output;
}



module.exports = ModuleManager;