const getUriPath = require("../lib/queryParser").getUriPath;
const { runFontWare, runBackWare } = require("./middleware");
const http = require("http");
const handleResult = require("./responseHandler");
const HTTPMessage = require("../type/HttpMessage");
const StatusCode = require("../type/StatusCode");

module.exports = class RouterFactory {
    /**
     *
     * @param {http.Server} app
     *
     * @typedef {object} RouterConfig
     * @prop {boolean} isDevMode
     * @prop {number} timeout
     *
     * @param {RouterConfig} config
     *
     */

    constructor(config = {}) {
        this.listener = new Map();
        this.config = config;
        this.restRouter = [];
    }

    registerRouter(url, moduleName, moduleClass) {
        console.log("\nModule : " + moduleName);
        this.initHandler(url, moduleName, moduleClass);
    }

    getListener(method, url) {
        var key = method + url;
        if (!RouterFactory.isSupported(method)) return null;
        return this.listener.get(key);
    }

    triggerRouter(req, res) {
        var uriPath = getUriPath(req.url);
        var eventName = req.method + uriPath;
        var execute = this.listener.get(eventName);
        if (execute == null) {
            var restName =
                "REST-" + eventName.substr(0, eventName.lastIndexOf("/"));
            if (this.restRouter.includes(restName)) {
                eventName = restName; // support for REST API
                req.isREST = true;
            } else {
                eventName = "ALL" + uriPath; // support for all method
            }

            execute = this.listener.get(eventName);
            if (execute == null) {
                var err = new HTTPMessage(
                    StatusCode.NOT_FOUND,
                    `Can't find router at ${uriPath}`
                );
                handleResult(err, res, this.config.isDevMode);
                return;
            }
        }
        execute(req, res);
    }

    static isSupported(method) {
        return [
            "GET",
            "POST",
            "HEAD",
            "DELETE",
            "PUT",
            "PATCH",
            "ALL"
        ].includes(method);
    }

    initHandler(url, moduleName, moduleClass) {
        var requestConfig = moduleClass.requestConfig();
        var instance = new moduleClass();
        if (requestConfig == null)
            throw new Error(
                `Module ${moduleName} do not contain requestConfig() method to config router`
            );
        Object.keys(requestConfig).forEach(methodName => {
            var config = requestConfig[methodName];
            var methodType = config; // Inline mode
            var fontWareReq, backWareReq, enableREST;

            if (typeof config == "object") {
                methodType = config.method;
                fontWareReq = config.fontware;
                backWareReq = config.backware;
                enableREST = config.enableREST;
            }

            methodType = methodType.toUpperCase();
            if (!RouterFactory.isSupported(methodType))
                throw new Error(
                    `Method ${methodType} in ${moduleName}/${methodName} do not support yet`
                );

            var mainExecute = instance[methodName];

            var eventName = getEventName(
                methodType,
                url,
                moduleName,
                methodName
            );

            // Executer will call each request
            var isDevMode = this.config.isDevMode;

            if (this.config.enableRESTFul & enableREST) {
                eventName = "REST-" + eventName;
                this.restRouter.push(eventName);
            }

            console.log("-> event : " + eventName);
            // store listener
            this.listener.set(eventName, (req, res) => {
                var thisArgs = {
                    $executer: mainExecute,
                    $eventName: eventName
                };

                function callBackWare(result) {
                    runBackWare(
                        eventName,
                        backWareReq,
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
                    fontWareReq,
                    thisArgs,
                    [req, res],
                    args => {
                        var result = mainExecute.apply(thisArgs, args);
                        callBackWare(result);
                    },
                    err => {
                        callBackWare(err);
                    }
                );
            });
        });
    }
};

function getEventName(method, baseurl, moduleName, methodName) {
    var uri = method + "/";
    if (baseurl != "") uri += baseurl + "/";
    if (moduleName != "") uri += moduleName + "/";
    if (methodName != "") uri += methodName;
    return uri;
}
