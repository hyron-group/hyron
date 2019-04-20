const http = require("http");
const ServicesManager = require("./ServicesManager");
const PluginsManager = require("./PluginsManager");
const AddonsManager = require("./AddonsManager");
const generalSecretKey = require("../lib/generalKey");
const configReader = require("./configReader");
const loadModuleByPath = require("../lib/moduleLoader");
const chalk = require("chalk");
const {
    getBaseURL
} = require("../lib/completeUrl");

var instanceContainer = {};
var serverContainer = {};


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


/**
 * This class is used to setup & run a hyron server app
 */
class ModuleManager {

    constructor(serverConfig) {

        var instanceUrl = getBaseURL(serverConfig);
        console.log(`\n\n——————————— ${instanceUrl} ———————————`);
        var instanceName = serverConfig.host + ":" + serverConfig.port;
        var instanceConfig = {
            instanceName,
            ...configReader.getConfig(instanceName)
        };

        this.setting({
            secret: generalSecretKey(),
            style: "lisp",
            environment: "dev",
        });

        Object.assign(this, serverConfig, instanceConfig);

        prepareBaseUrl(this);

        this.initServer(http.createServer());
        this.addons = new AddonsManager(this);
        this.plugins = PluginsManager;
        this.services = new ServicesManager(serverConfig);

        AddonsManager.runGlobalAddons(this);
    }

    static build(path) {
        const appLoader = require("./appLoader");
        appLoader(path);
    }

    static getInstance(...args) {
        var serverConfig = {
            protocol: "http",
            host: "localhost",
            port: 3000,
            prefix: "",
        };

        if (args.length == 1) {
            var arg0 = args[0];
            if (typeof arg0 == "object") {
                Object.assign(serverConfig, arg0);
            } else if (typeof arg0 == "number") {
                serverConfig.port = arg0;
            } else if (typeof arg0 == "string") {
                const URI_REG = /^([\w\d]+):\/\/([\w\d.-]+)(:([\d]+))?(\/([\w\d\/.-]+)?)?/;

                var match = URI_REG.exec(arg0);
                if (match == null) {
                    throw new TypeError("Cannot parse url from getInstance(..) argument at index 0");
                }
                serverConfig = {
                    protocol: match[1],
                    host: match[2],
                    port: match[4],
                    prefix: match[6]
                };
            } else throw new TypeError(`getInstance(..) argument at index 0 should be a port number, string base url or object instance config`);
        } else if (args.length > 1) {
            serverConfig = {
                port: args[0] || serverConfig.port,
                host: args[1] || serverConfig.host,
                prefix: args[2] || serverConfig.prefix,
                protocol: args[3] || serverConfig.protocol,
            };
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
            throw new TypeError("enableAddons(..) args at index 0 must be Object");
        }
        for (var addonsName in addonsList) {
            var addonsHandler = addonsList[addonsName];
            if (typeof addonsHandler == "string") {
                addonsHandler = loadModuleByPath(addonsHandler, addonsName);
            }

            var addonsConfig = configReader.getConfig(addonsName);
            try {
                this
                    .addons
                    .registerAddons(addonsName, addonsHandler, addonsConfig);
            } catch (err) {
                console.error(chalk.red(
                    `[error] Has problem when register addons '${addonsName}'\n${err.toString()}`
                ));
            }
        }
    }

    static enableGlobalAddons(addonsList) {
        if (addonsList == null) return;
        if (addonsList.constructor.name != "Object") {
            throw new TypeError("enableAddons(..) args at index 0 must be Object");
        }
        for (var addonsName in addonsList) {
            var addonsHandler = addonsList[addonsName];
            if (typeof addonsHandler == "string") {
                addonsHandler = loadModuleByPath(addonsHandler, addonsName);
            }

            var addonsConfig = configReader.getConfig(addonsName);
            try {
                AddonsManager.registerGlobalAddons(addonsName, addonsHandler, addonsConfig);
            } catch (err) {
                console.error(chalk.red(
                    `[error] Has problem when register global addons '${addonsName}'\n${err.toString()}`
                ));
            }
        }
    }

    enablePlugins(pluginsList) {
        if (pluginsList == null) return;
        if (typeof pluginsList != "object") {
            throw new TypeError("enablePlugins(..) args at index 0 must be Object");
        }

        for (var pluginName in pluginsList) {
            var pluginsMeta = pluginsList[pluginName];
            if (typeof pluginsMeta == "string") {
                pluginsMeta = loadModuleByPath(pluginsMeta, pluginName);
            }

            if (typeof pluginsMeta != "object") {
                throw new TypeError(`cannot parse plugins '${pluginName}' metadata on type '${typeof pluginsMeta}'`);
            }

            var pluginConfig = configReader.getConfig(pluginName);
            try {
                this.plugins.addMiddleware(pluginName, pluginsMeta, pluginConfig);
            } catch (err) {
                console.error(chalk.red(
                    `[error] Has problem when register plugins '${pluginName}'\n${err.toString()}`
                ));
            }
        }
    }

    enableServices(serviceList) {
        if (serviceList == null) return;
        if (serviceList.constructor.name != "Object") {
            throw new TypeError("enableServices(..) args at index 0 must be Object");
        }

        for (var serviceName in serviceList) {

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
                        `[error] Hyron do not support for service define like '${serviceName}' yet\n${err.toString()}`
                    ));
                }
            } else {
                // is as normal hyron service
                try {
                    this.services.registerRoutesGroup(
                        serviceName,
                        routePackage,
                        serviceConfig
                    );
                } catch (err) {
                    console.error(chalk.red(
                        `[error] Has problem when register '${serviceName}'\n${err.toString()}`
                    ));
                }
            }
        }
    }

    static getInstanceContainer() {
        return instanceContainer;
    }

    initServer(defaultServer) {
        var server = serverContainer[this.instanceName];
        if (server != null) {
            this.app = server;
            return;
        }
        setupDefaultListener(this, defaultServer);

        defaultServer.on("request", (req, res) => {
            this.services.triggerRouter(req, res);
        });

        configReader.setConfig({
            base_url: this.base_url
        });

        serverContainer[this.instanceName] = defaultServer;
        this.app = defaultServer;
    }

    static setServer(host, port, server) {
        var key = host + ":" + port;
        return serverContainer[key] = server;
    }

    startServer(callback) {
        var host = this.host;
        if (host == "localhost") {
            host = undefined;
        }
        var port = this.port;

        if (this.app.running) return this.app;

        if (callback != null)
            this.app.listen(port, host, callback);
        else this.app.listen(port, host);
        this.app.running = true;
        return this.app;
    }

}

module.exports = ModuleManager;