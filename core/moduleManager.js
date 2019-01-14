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
            baseURI: "http://localhost:3000/",
            protocols: "http",
            host: "localhost",
            port: 3000,
            prefix: "",
        };

        if (args.length == 1) {
            var arg0 = args[0];
            if (typeof args[0] == "object") {
                // getInstance(cfg)
                instanceConfig = arg0;
            } else if (typeof arg0 == "number") {
                // getInstance(port)
                instanceConfig.port = arg0;
            } else if (typeof arg0 == "string") {
                // getInstance(baseURI)
                var reg = /^(([\w\d]+):\/\/([\w\d.-]+)(:([\d]+))?(\/([\w\d\/.-]+)?)?)/g;

                var match = reg.exec(arg0);

                instanceConfig = {
                    baseURI: match[1],
                    protocols: match[2],
                    host: match[3],
                    port: match[5],
                    prefix: match[7]
                }
            } else throw new TypeError(`getInstance(..) argument at index 1 should be a port number, string base uri or object instance config`);
        } else if (args.length > 1) {
            return getInstance({
                port: args[0],
                host: args[1],
                prefix: args[2],
                protocols: args[3]
            })
        }


        Object.assign(newInstance, {
            config: {
                isDevMode: true,
                baseURI: newInstance.baseURI,
                secret: generalSecretKey(),
            },
            ...instanceConfig,
            routerFactory: new RouterFactory(newInstance.config),
            app: http.createServer(),
        });
        loadPluginsFromConfig.call(newInstance);

        instanceContainer[newInstance.baseURI] = newInstance;
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
                    console.error(
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
                console.log(
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
            console.warn(`Can't load plugins '${name}' because ${err.message}`)
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