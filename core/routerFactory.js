const http = require("http");
const {
    getUriPath
} = require("../lib/queryParser");
const handleResult = require("./responseHandler");
const path = require('../type/path');
const HTTPMessage = require("../type/HttpMessage");
const prepareConfigModel = require('./configParser');
const completeUrl = require('../lib/completeUrl');
const httpEventWrapper = require('./eventWapper');
const dynamicUrl = require('../lib/dynamicURL');


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

        var event = this.getEvent(method, uriPath, req);

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

    getEvent(method, path, req) {
        var eventName, execute;

        if (
            (eventName = method + path) &&
            (execute = this.listener.get(eventName)) ||

            (eventName = method + dynamicUrl.getEventName(path)) &&
            (execute = this.listener.get(eventName)) &&
            (req.isREST = true) ||

            (eventName = "ALL" + path) &&
            (execute = this.listener.get(eventName)) ||

            (path == "/") &&
            (eventName = method) &&
            (execute = this.listener.get(eventName))
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
        console.log(`\nLockup service : ${moduleName}`)
        var requestConfig = handlePackage.requestConfig();

        var instance = new handlePackage();
        if (requestConfig == null)
            throw new Error(
                `Module ${moduleName} do not contain requestConfig() method`
            );
        var generalConfig = requestConfig.$all;
        delete requestConfig.$all;

        Object.keys(requestConfig).forEach(methodName => {
            var routeConfig = requestConfig[methodName];
            var methodPath = `${moduleName}/${methodName}`;

            var configModel =
                prepareConfigModel(
                    methodPath,
                    routeConfig,
                    generalConfig,
                    this.config
                );
            var mainHandle = configModel.handle || instance[methodName];

            configModel.method.forEach(entryMethodType => {
                var tempModel = configModel;
                var url = completeUrl(
                    prefix,
                    moduleName,
                    methodName,
                    configModel.path,
                    this.config
                );

                if (configModel.params != null) {
                    url = dynamicUrl.registerUrl(url + configModel.params);
                    if (url == null)
                        new Error(`URL ${url}/${configModel.params} at ${methodName} is not valid`);
                }

                url = entryMethodType + '/' + url;
                path.build(this.config.baseURI, url, mainHandle);
                tempModel.method = entryMethodType;
                this.registerRouterByMethod(
                    url,
                    instance,
                    mainHandle,
                    tempModel
                );
            });
        });
    }


    registerRouterByMethod(eventName, instance, mainExecute, routeConfig) {

        var isDevMode = this.config.isDevMode;
        // Executer will call each request

        console.info("-> event : " + eventName);
        // store listener

        if (mainExecute == null) {
            throw new ReferenceError(`main-handle of '${eventName}' has not been set`);
        }

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

};

module.exports = RouterFactory;