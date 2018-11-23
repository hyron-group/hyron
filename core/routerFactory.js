const getUriPath = require("../lib/queryParser").getUriPath;
const { runFontWare, runBackWare } = require("./middleware");
const http = require("http");
const handleResult = require("./responseHandler");
const HTTPMessage = require("../type/HttpMessage");

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
        this.restRouter = [];
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
        var eventName = buildRouteName(false, req.method, uriPath);
        var execute = this.listener.get(eventName);
        if (execute == null) {
            var restName = buildRouteName(true, req.method, uriPath);
            if (this.restRouter.includes(restName)) {
                eventName = restName; // support for REST API
                req.isREST = true;
            } else {
                eventName = buildRouteName(false, "ALL", uriPath); // support for all method
            }

            execute = this.listener.get(eventName);

            if (execute == null) {
                var err = new HTTPMessage(
                    404, // not found
                    `Can't find router at ${uriPath}`
                );
                handleResult(err, res, this.config.isDevMode);
                return;
            }
        }

        execute(req, res);
    }

    /**
     * @description check if hyron supported for this method
     * @static
     * @param {string} method uppercase method name
     * @returns true if supported other is false
     * @memberof RouterFactory
     */
    static isSupported(method) {
        return [
            "GET",
            "POST",
            "HEAD",
            "DELETE",
            "PUT",
            "PATCH",
            "ALL",
            "PRIVATE"
        ].includes(method);
    }

    /**
     * @description register for a package of handle function as routers
     * @param {*} prefix parent path of current service. Used as host/[prefix]
     * @param {*} moduleName parent path of current functions. Used as host/[prefix]/[module]  
     * @param {*} handlePackage class package contain main handle function and it config
     * @memberof RouterFactory
     */
    registerRoutesGroup(prefix, moduleName, handlePackage) {
        console.log('\n\nLockup service : '+moduleName)
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
            var mainHandle = instance[methodName];

            configModel.method.forEach(entryMethodType => {
                var tempModel = configModel;
                var eventName = prepareEventName(
                    configModel.enableREST,
                    entryMethodType,
                    prefix,
                    moduleName,
                    methodName,
                    configModel.path
                );
                tempModel.method = entryMethodType;
                registerRouterByMethod.apply(this, [methodPath, eventName, mainHandle, tempModel]);
            });
        });
    }
};

/**
 * @description Used to register a signle router by method
 * @param {string} methodPath
 * @param {string} eventName
 * @param {function} mainExecute
 * @param {object} routeConfig
 */
function registerRouterByMethod(methodPath, eventName, mainExecute, routeConfig) {
    if (!RouterFactory.isSupported(routeConfig.method))
        throw new Error(
            `Method '${routeConfig.method}' in ${methodPath} do not support yet`
        );

    var isDevMode = this.config.isDevMode;
    // Executer will call each request

    if (routeConfig.enableREST) this.restRouter.push(eventName);

    console.log("-> event : " + eventName);
    // store listener

    this.listener.set(
        eventName,
        httpEventWrapper(isDevMode, eventName, mainExecute, routeConfig.fontware, routeConfig.backware)
    );
}

/**
 * @description used to wrap & return http event
 * @param {boolean} isDevMode
 * @param {string} eventName
 * @param {function} mainExecute
 * @param {[string]} fontware
 * @param {[string]} backware
 * @returns
 */
function httpEventWrapper(
    isDevMode,
    eventName,
    mainExecute,
    fontware,
    backware
) {
    return function httpEvent(req, res) {
        var thisArgs = {
            $executer: mainExecute,
            $eventName: eventName
        };

        function callToRunBackWare(result) {
            runBackWare(
                eventName,
                backware,
                thisArgs,
                [req, res, result],
                data => {
                    handleResult(data, res, isDevMode);
                },
                err => {
                    handleResult(err, res, isDevMode);
                }
            );
        }
        runFontWare(
            eventName,
            fontware,
            thisArgs,
            [req, res],
            args => {
                var result = mainExecute.apply(thisArgs, args);
                callToRunBackWare(result);
            },
            err => {
                callToRunBackWare(err);
            }
        );
    }
}

/**
 * @description used to creates a standardized config
 * @param {string} methodPath
 * @param {object} routeConfig
 * @param {object} generalConfig
 * @param {object} appConfig
 */
function prepareConfigModel(methodPath, routeConfig, generalConfig, appConfig) {
    if (typeof routeConfig == "boolean" | typeof routeConfig == "function") {
        console.error(
            `[warning] Don't support for config type at ${methodPath}`
        );
    }

    var method = [],
        fontware = [],
        backware = [],
        enableREST,
        path;

    function prepareMethod(type) {
        if (typeof type == "string") method.push(type.toUpperCase());
        else if (type instanceof Array) {
            type.forEach(curType => {
                method.push(curType.toUpperCase());
            });
        } else if (typeof type == "object") prepareMethod(type.method);
        else
            throw new TypeError(
                `Method ${method} in ${methodPath} isn't string or array`
            );
    }

    function inheritanceFromGeneralConfig() {
        if (generalConfig == null) return;
        if (method == null) {
            if (generalConfig.method == null) method = "GET";
            else method = generalConfig.method;
        }

        if (enableREST == null) enableREST = generalConfig.enableREST;

        if (generalConfig.fontware != null)
            fontware = fontware.concat(generalConfig.fontware);
        if (generalConfig.backware != null)
            backware = backware.concat(generalConfig.backware);
    }

    function iheritanceFromAppConfig(){
        if (enableREST == null) enableREST = appConfig.enableRESTFul;
    }

    function loadFromRouteConfig() {
        prepareMethod(routeConfig);
        if (typeof routeConfig != "object") return;
        enableREST = routeConfig.enableREST;
        fontware = fontware.concat(routeConfig.fontware);
        backware = backware.concat(routeConfig.backware);
        path = routeConfig.path;
    }

    loadFromRouteConfig();
    inheritanceFromGeneralConfig();
    iheritanceFromAppConfig();

    return {
        method,
        enableREST,
        fontware,
        backware,
        path
    };
}

function prepareEventName(
    isREST,
    methodType,
    prefix,
    moduleName,
    methodName,
    customPath
) {
    if (customPath == null) {
        return buildRouteName(
            isREST,
            methodType+'/',
            prefix,
            moduleName,
            methodName
        );
    } else {
        return buildRouteName(isREST, methodType+'/', customPath);
    }
}

function buildRouteName(isREST, methodType, ...childRoute) {
    var uri = "";
    if (isREST) uri = "REST-";
    uri += methodType;
    childRoute.forEach(routeName => {
        if (routeName != null & routeName!= '') uri += routeName + "/";
    });
    uri = uri.substr(0, uri.length-1);
    return uri;
}

module.exports = RouterFactory;