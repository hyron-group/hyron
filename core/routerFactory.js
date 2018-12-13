const http = require("http");
const {
    getUriPath
} = require("../lib/queryParser");
const handleResult = require("./responseHandler");
const path = require('../type/path');
const HTTPMessage = require("../type/HttpMessage");
const prepareConfigModel = require('./configParser');
const prepareEventName = require('../lib/eventNameCretor');
const httpEventWrapper = require('./eventWapper');
const {
    isSupported
} = require('./supportedMethod')


/**
 * This class used to register event for http connection
 */
class RouterFactory {
    /**
     *
     * @param {http.Server} app a http app instance
     *
     * @typedef {object} RouterConfig
     * @prop {boolean} isDevMode true if turn on develop mode to collect bug
     * @prop {number} timeout max expired time for each request
     *
     * @param {RouterConfig} config
     *
     */

    constructor(
        config = {
            isDevMode: true,
            timeout: 10000
        }
    ) {
        this.listener = new Map();
        this.config = config;
    }

    /**
     * @description Used to get handle function by eventName
     * @param {string} eventName name of listener
     * @returns main handle function for this eventName
     * @memberof RouterFactory
     */
    getListener(eventName) {
        return this.listener.get(eventName);
    }

    /**
     * @description execute listener when has new request
     * @param {*} req http request
     * @param {*} res http response
     * @returns
     * @memberof RouterFactory
     */
    triggerRouter(req, res) {
        var uriPath = getUriPath(req.url);
        var method = req.method;

        var event = this.getEvent(method, uriPath);

        if (event != null) {
            event(req, res);
        } else {

            var err = new HTTPMessage(
                404, // not found
                `Can't find router at ${uriPath}`
            );
            handleResult(err, res, this.config.isDevMode);

        }
    }

    getEvent(method, path) {
        var eventName, execute, index;

        if (
            (eventName = method + path) &&
            (execute = this.listener.get(eventName)) != null ||

            (eventName = "REST-" + eventName) &&
            (index = eventName.lastIndexOf('/')) &&
            (index = index == -1 ? eventName.length : index) &&
            (eventName = eventName.substr(0, index)) &&
            (execute = this.listener.get(eventName)) != null &&
            (req.isREST = true) ||

            (path == "/") &&
            (eventName = method) &&
            (execute = this.listener.get(eventName)) != null
        ) {
            return execute;
        }

    }

    /**
     * @description register for a package of handle function as routers
     * @param {*} prefix parent path of current service. Used as host/[prefix]
     * @param {*} moduleName parent path of current functions. Used as host/[prefix]/[module]  
     * @param {*} handlePackage class package contain main handle function and it config
     * @memberof RouterFactory
     */
    registerRoutesGroup(prefix, moduleName, handlePackage) {
        console.log('\n\nLockup service : ' + moduleName)
        var requestConfig = handlePackage.requestConfig();

        var instance = new handlePackage();
        if (requestConfig == null)
            throw new Error(
                `Module ${moduleName} do not contain requestConfig() method to config router`
            );
        var generalConfig = requestConfig.$all;
        delete requestConfig.$all;

        Object.keys(requestConfig).forEach(methodName => {
            var routeConfig = requestConfig[methodName];
            var methodPath = `${moduleName}/${methodName}`;

            var configModel = prepareConfigModel(
                methodPath,
                routeConfig,
                generalConfig,
                this.config
            );
            var mainHandle = instance[methodName] || configModel.handle;

            if(mainHandle==null) throw new Error(`Can't find main-handle for route ${methodName}`)

            configModel.method.forEach(entryMethodType => {
                var tempModel = configModel;
                var eventName = prepareEventName(
                    configModel.enableREST,
                    entryMethodType,
                    prefix,
                    moduleName,
                    methodName,
                    configModel.path,
                    this.config
                );
                path.build(this.config.baseURI, eventName, mainHandle);
                tempModel.method = entryMethodType;
                registerRouterByMethod.apply(this, [
                    methodPath,
                    eventName,
                    instance,
                    mainHandle,
                    tempModel
                ]);
            });
        });
    }
};

function registerRouterByMethod(methodPath, eventName, instance, mainExecute, routeConfig) {
    if (!isSupported(routeConfig.method))
        throw new Error(
            `Method '${routeConfig.method}' in ${methodPath} do not support yet`
        );

    var isDevMode = this.config.isDevMode;
    // Executer will call each request

    console.log("-> event : " + eventName);
    // store listener

    this.listener.set(
        eventName,
        httpEventWrapper(isDevMode,
            eventName,
            instance,
            mainExecute,
            routeConfig.fontware,
            routeConfig.backware)
    );
}

module.exports = RouterFactory;