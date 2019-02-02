const http = require("http");
const ServicesManager = require("./ServicesManager");
const PluginsManager = require('./PluginsManager');
const AddonsManager = require('./AddonsManager');
const generalSecretKey = require("../lib/generalKey");
const appConfigReader = require('../lib/configReader');
const loadModuleByPath = require('../lib/moduleLoader');

const {
    getBaseURL
} = require('../lib/completeUrl');

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

    static getInstance(...args) {
        var newInstance = new ModuleManager();

        var serverConfig = {
            protocol: "http",
            host: "localhost",
            port: 3000,
            prefix: "",
        }

        var instanceConfig = {
            environment: "dev",
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
                    throw new TypeError("Cannot parse url from getInstance(..) argument at index 0")
                serverConfig = {
                    protocol: match[1],
                    host: match[2],
                    port: match[4],
                    prefix: match[6]
                }
            } else if (arg0 == null) {
                return ModuleManager.getInstance(0);
            } else throw new TypeError(`getInstance(..) argument at index 0 should be a port number, string base url or object instance config`);
        } else if (args.length > 1) {
            return ModuleManager.getInstance({
                port: args[0] || instanceConfig.port,
                host: args[1] || instanceConfig.host,
                prefix: args[2] || instanceConfig.prefix,
                protocol: args[3] || instanceConfig.protocol,
            })
        }

        serverConfig.baseURL = getBaseURL(serverConfig);

        console.log(`\n\n--- ${serverConfig.baseURL} ---\n`);


        var summaryConfig = {
            ...serverConfig,
            ...instanceConfig
        };
        Object.assign(newInstance, summaryConfig);

        newInstance.initServer(http.createServer());
        newInstance.addons = new AddonsManager(newInstance);
        newInstance.plugins = PluginsManager;
        newInstance.services = new ServicesManager(summaryConfig);

        AddonsManager.runGlobalAddons(newInstance);

        instanceContainer[serverConfig.baseURL] = newInstance;
        return newInstance;
    }

    setting(config) {
        if (typeof config != "object") return;
        appConfigReader.setConfig(config);
    }

    static getConfig(path, defaultValue) {
        try {
            var data = appConfigReader.getConfig(path);
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

            var addonsConfig = appConfigReader.getConfig(addonsName)
            this
                .addons
                .registerAddons(addonsName, addonsHandler, addonsConfig);
        }
    }

    static enableGlobalAddons(addonsList){
        if (addonsList == null) return;
        if (addonsList.constructor.name != "Object") {
            throw new TypeError('enableAddons(..) args at index 0 must be Object');
        }
        for (var addonsName in addonsList) {
            var addonsHandler = addonsList[addonsName];
            if (typeof addonsHandler == 'string') {
                addonsHandler = loadModuleByPath(addonsHandler, addonsName);
            }

            var addonsConfig = appConfigReader.getConfig(addonsName)
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

            var pluginConfig = appConfigReader.getConfig(pluginName);

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

        var baseURL = getBaseURL({
            protocol: instance.protocol,
            host: instance.host,
            port: instance.port
        });

        console.log(`\nServer started at : ${baseURL}`);
    });

}

function loadGlobalAddons(){
    var addonsList = ModuleManager.getConfig("addons");
    if(addonsList!=null) {
        for(var name in addonsList){
            var modulePath = addonsList[name];
            var config = ModuleManager.getConfig(name);
            handler = loadModuleByPath(modulePath, name);
            AddonsManager.registerGlobalAddons(name, handler, config);
        }
    }
}

function loadGlobalPlugins(){
    var pluginsList = ModuleManager.getConfig("plugins");
    if(pluginsList!=null) {
        for(var name in pluginsList){
            var modulePath = pluginsList[name];
            var config = ModuleManager.getConfig(name);
            pluginsMeta = loadModuleByPath(modulePath, name);
            PluginsManager.addMiddleware(name, pluginsMeta, config)
        }
    }
}

(function loadModulesFromConfig() {
    loadGlobalAddons();
})();


module.exports = ModuleManager;