const http = require("http");
const ServicesManager = require("./ServicesManager");
const PluginsManager = require('./PluginsManager');
const AddonsManager = require('./AddonsManager');
const generalSecretKey = require("../lib/generalKey");
const configReader = require('./configReader');
const loadModuleByPath = require('../lib/moduleLoader');
const chalk = require('chalk');

const URI_REG = /^([\w\d]+):\/\/([\w\d.-]+)(:([\d]+))?(\/([\w\d\/.-]+)?)?/;

const {
    getBaseURL
} = require('../lib/completeUrl');

var instanceContainer = {};
var serverContainer = {};

/**
 * This class is used to setup & run a hyron server app
 */
class ModuleManager {

    constructor(serverConfig) {

        var instanceUrl = getBaseURL(serverConfig);
        console.log(`\n\n——————————— ${instanceUrl} ———————————`);
        var instanceName = serverConfig.host + ":" + serverConfig.port;
        var instanceConfig = {
            secret: generalSecretKey(),
            instanceName,
            ...configReader.getConfig(instanceName)
        };

        Object.assign(this, serverConfig, instanceConfig);

        prepareBaseUrl(this);

        this.initServer(http.createServer());
        this.addons = new AddonsManager(this);
        this.plugins = PluginsManager;
        this.services = new ServicesManager(serverConfig);

        AddonsManager.runGlobalAddons(this);
    }

    static build(path) {
        const appLoader = require('./appLoader');
        appLoader(path);
    }

    static getInstance(...args) {
        var serverConfig = {
            protocol: "http",
            host: "localhost",
            port: 3000,
            prefix: "",
        }

        if (args.length == 1) {
            var arg0 = args[0];
            if (typeof arg0 == "object") {
                Object.assign(serverConfig, arg0);
            } else if (typeof arg0 == "number") {
                serverConfig.port = arg0;
            } else if (typeof arg0 == "string") {

                var match = URI_REG.exec(arg0);
                if (match == null) {
                    throw new TypeError("Cannot parse url from getInstance(..) argument at index 0")
                }
                serverConfig = {
                    protocol: match[1],
                    host: match[2],
                    port: match[4],
                    prefix: match[6]
                }
            } else throw new TypeError(`getInstance(..) argument at index 0 should be a port number, string base url or object instance config`);
        } else if (args.length > 1) {
            serverConfig = {
                port: args[0] || serverConfig.port,
                host: args[1] || serverConfig.host,
                prefix: args[2] || serverConfig.prefix,
                protocol: args[3] || serverConfig.protocol,
            }
        }
        var newInstance = new ModuleManager(serverConfig);
        instanceContainer[newInstance.base_url] = newInstance;
        return newInstance;
    }

    setting(config) {
        if (typeof config != "object") return;
        configReader.setConfig(config);
    }

    static getConfig(path, defaultValue) {
        try {
            var data = configReader.getConfig(path);
            if (data === undefined) data = defaultValue;

            return data;
        } catch (err) {
            return defaultValue;
        }
    }

    enableAddons(addonsList) {
        if (addonsList == null) return;
        if (addonsList.constructor.name != "Object") {
            throw new TypeError('enableAddons(..) args at index 0 must be Object');
        }
        for (var addonsName in addonsList) {
            var addonsHandler = addonsList[addonsName];
            if (typeof addonsHandler == 'string') {
                addonsHandler = loadModuleByPath(addonsHandler, addonsName);
            }

            var addonsConfig = configReader.getConfig(addonsName)
            this
                .addons
                .registerAddons(addonsName, addonsHandler, addonsConfig);
        }
    }

    static enableGlobalAddons(addonsList) {
        if (addonsList == null) return;
        if (addonsList.constructor.name != "Object") {
            throw new TypeError('enableAddons(..) args at index 0 must be Object');
        }
        for (var addonsName in addonsList) {
            var addonsHandler = addonsList[addonsName];
            if (typeof addonsHandler == 'string') {
                addonsHandler = loadModuleByPath(addonsHandler, addonsName);
            }

            var addonsConfig = configReader.getConfig(addonsName)
            AddonsManager.registerGlobalAddons(addonsHandler, addonsConfig);
        }
    }

    enablePlugins(pluginsList) {
        if (pluginsList == null) return;
        if (typeof pluginsList != "object") {
            throw new TypeError('enablePlugins(..) args at index 0 must be Object');
        }

        Object.keys(pluginsList).forEach(pluginName => {
            var pluginsMeta = pluginsList[pluginName];
            if (typeof pluginsMeta == "string") {
                pluginsMeta = loadModuleByPath(pluginsMeta, pluginName);
            }

            if (typeof pluginsMeta != "object") {
                throw new TypeError(`can't parse plugins '${pluginName}' metadata on type '${typeof pluginsMeta}'`);
            }

            var pluginConfig = configReader.getConfig(pluginName);

            this.plugins.addMiddleware(pluginName, pluginsMeta, pluginConfig);
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
                routePackage = loadModuleByPath(routePackage, serviceName);
            }

            var serviceConfig = configReader.getConfig(serviceName);

            if (routePackage.requestConfig == null) {
                // is unofficial service
                try {
                    routePackage(this.app, serviceConfig);
                } catch (err) {
                    console.error(chalk.red(
                        `Hyron do not support for service define like '${serviceName}' yet`
                    ));
                }
            } else {
                // is as normal hyron service
                this.services.registerRoutesGroup(
                    serviceName,
                    routePackage,
                    serviceConfig
                );
            }
        });
    }

    static getInstanceContainer() {
        return instanceContainer;
    }

    initServer(defaultServer) {
        var server = serverContainer[this.instanceName];
        if (server != null) {
            this.app = server;
            return;
        };
        setupDefaultListener(this, defaultServer);

        configReader.setConfig({
            base_url: this.base_url
        })

        serverContainer[this.instanceName] = defaultServer;
        this.app = defaultServer;
    }

    static setServer(host, port, server) {
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
        console.log(chalk.green(`\n✔  Server started at : ${instance.base_url}`));
    });

}

function prepareBaseUrl(instance) {
    instance.base_url = getBaseURL({
        protocol: instance.protocol,
        host: instance.host,
        port: instance.port
    });
}


module.exports = ModuleManager;