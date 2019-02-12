const {
    getUriPath
} = require("../../lib/queryParser");
const handleResult = require("./responseHandler");
const path = require('../../lib/path');
const HTTPMessage = require("../../lib/HttpMessage");
const prepareConfigModel = require('./configParser');
const {
    prepareEventName
} = require('../../lib/completeUrl');
const httpEventWrapper = require('./eventWrapper');
const dynamicUrl = require('../../lib/dynamicURL');
const configReader = require('../configReader');
const chalk = require('chalk');


/**
 * This class used to register event for http connection
 */
class RouterFactory {

    constructor(serverCfg) {
        Object.assign(this, serverCfg);
        this.listener = new Map();
        this.isDevMode = configReader.getConfig("environment") != "production";
    }

    getListener(eventName) {
        return this.listener.get(eventName);
    }

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
            handleResult(err, res, this.isDevMode);

        }
    }

    getEvent(method, path, req) {
        var eventName, execute;
        if (
            (eventName = method + path) &&
            (execute = this.listener.get(eventName)) ||

            (eventName = method + dynamicUrl.getEventName(path)) &&
            (execute = this.listener.get(eventName)) ||

            (eventName = "ALL" + path) &&
            (execute = this.listener.get(eventName)) ||

            (path == "/") &&
            (eventName = method) &&
            (execute = this.listener.get(eventName))
        ) {
            return execute;
        }
    };

    registerRoutesGroup(moduleName, handlePackage, config) {
        console.info(chalk.blue.bold(`\nLockup Service : ${moduleName}`))
        var requestConfig = handlePackage.requestConfig();

        var instance = new handlePackage();
        instance.$config = config;
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
                );
            var mainHandle = configModel.handle || instance[methodName];

            configModel.method.forEach(entryMethodType => {
                var tempModel = configModel;
                var url = prepareEventName(
                    configReader.getConfig("style"),
                    configModel.path,
                    this.prefix,
                    moduleName,
                    methodName,
                );

                if (configModel.params != null || url.includes('/:')) {
                    var params = configModel.params || "";
                    url = dynamicUrl
                        .registerUrl(url + params) +
                        params;
                    if (url == null)
                        new Error(`URL ${url}/${configModel.params} at ${methodName} is not valid`);
                }

                url = entryMethodType + '/' + url;
                path.build(configReader.getConfig("base_url"), url, mainHandle);
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

        // Executer will call each request

        console.info(chalk.cyanBright("➝  event : " + eventName));
        // store listener

        if (mainExecute == null) {
            throw new ReferenceError(`main-handle of '${eventName}' has not been set`);
        }

        this.listener.set(
            eventName,
            httpEventWrapper(
                this.isDevMode,
                eventName,
                instance,
                mainExecute,
                routeConfig)
        );
    }

};

module.exports = RouterFactory;