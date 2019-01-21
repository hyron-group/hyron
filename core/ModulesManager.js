const http = require("http");
const ServicesManager = require("./ServicesManager");
const PluginsManager = require('./PluginsManager');
const AddonsManager = require('./AddonsManager');
const generalSecretKey = require("../lib/generalKey");
const appConfigReader = require('../lib/configReader');
const homeDir = require('../lib/homeDir');

const {
    getBaseURI
} = require('../lib/completeUrl');
const path = require('path');

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
            ...appConfigReader.getConfig(serverConfig.host + ":" + serverConfig.port)
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

        serverConfig.baseURI = getBaseURI(serverConfig);

        console.log(`\n\n--- ${serverConfig.baseURI} ---\n`);


        Object.assign(newInstance, {
            ...serverConfig,
            config: instanceConfig,
        });

        newInstance.initServer(http.createServer());
        newInstance.services = new ServicesManager(instanceConfig);
        newInstance.addons = new AddonsManager(newInstance);
        newInstance.plugins = new PluginsManager(newInstance);

        loadModulesFromConfig.call(newInstance);

        instanceContainer[serverConfig.baseURI] = newInstance;
        return newInstance;
    }

    /**
     * @description Setup app or plugins with config
     * @param {object} config
     * @param {boolean} [config.isDevMode=true] if is true, app will collect bug, log for development. Else, app will be optimized for performance
     * @param {boolean} [config.style] format event name to target format. include : camel, snake, lisp, lower
     * @param {string} [config.poweredBy=hyron] set poweredBy header for this app
     */
    setting(config) {
        if (typeof config != "object") return;
        appConfigReader.setConfig(config);
    }

    /**
     * @description Return config of app or it plugins
     *
     * @static
     * @param {string} name name of app setting field or a installed plugin
     * @returns {string|object} config value
     */
    static getConfig(name) {
        return appConfigReader.getConfig(name);
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
        for (var addonsName in addonsList) {
            var addonsHandle = addonsList[addonsName];
            if (typeof addonsHandle == 'string') {
                addonsHandle = loadModuleByPath(addonsHandle);
            }

            var addonsConfig = appConfigReader.getConfig(addonsName)

            this
                .addons
                .registerAddons(addonsName, addonsHandle, addonsConfig);
        }
    }

    /**
     * @description Register plugins
     * @param {{name:string,meta}} pluginsList
     */
    enablePlugins(pluginsList) {
        if (pluginsList == null) return;
        if (typeof pluginsList != "object") {
            throw new TypeError('enablePlugins(..) args at index 0 must be Object');
        }

        Object.keys(pluginsList).forEach(pluginName => {
            var pluginsMeta = pluginsList[pluginName];
            if (typeof pluginsMeta == "string") {
                pluginsMeta = loadModuleByPath(pluginsMeta);
            }

            if (typeof pluginsMeta != "object") {
                throw new TypeError(`can't parse plugins '${pluginName}' metadata on type '${typeof pluginsMeta}'`);
            }

            var {
                fontware,
                backware
            } = pluginsMeta;
            var pluginConfig = appConfigReader.getConfig(pluginName);

            this.plugins.addMiddleware(pluginName, true, fontware, pluginConfig);
            this.plugins.addMiddleware(pluginName, false, backware, pluginConfig);
        });
    }


    /**
     * @description Register router with function packages
     * @param {{moduleName:string,AbstractRouters}} serviceList a package of main handle contain business logic
     */
    enableServices(serviceList) {
        if (serviceList == null) return;
        if (serviceList.constructor.name != "Object") {
            throw new TypeError('enableServices(..) args at index 0 must be Object');
        }

        Object.keys(serviceList).forEach(serviceName => {
            // routePackage is path
            var routePackage = serviceList[serviceName];
            if (typeof routePackage == "string") {
                routePackage = loadModuleByPath(routePackage);
            }

            var serviceConfig = appConfigReader.getConfig(serviceName);

            if (routePackage.requestConfig == null) {
                // is unofficial service
                try {
                    routePackage(this.app, serviceConfig);
                } catch (err) {
                    console.error(
                        `Hyron do not support for service define like '${serviceName}' yet`
                    );
                }
            } else {
                // is as normal hyron service
                this.services.registerRoutesGroup(
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
            this.services.triggerRouter(req, res);
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

function loadModuleByPath(modulePath) {
    var output;
    try {
        // for local modules
        var modulePath = path.join(homeDir, modulePath);
        output = require(modulePath);
        appConfigReader.readConfig(modulePath);
    } catch (err) {
        if (output == null)
            // for installed modules
            output = require(modulePath);
        var installedPath = "node_modules/" + modulePath;
        appConfigReader.readConfig(installedPath);
    }

    return output;
}

function loadModulesFromConfig() {
    this.enableAddons(appConfigReader.getConfig("addons"));
    this.enablePlugins(appConfigReader.getConfig("plugins"));
}


module.exports = ModuleManager;