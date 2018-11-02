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

    getPath(handle) {
        var eventList = this.listener.keys();
        var curEvent;
        do {
            curEvent = eventList.next();
            var executer = this.listener[curEvent];
            if (handle == executer) {
                var path = curEvent.value;
                path = path.substr(path.indexOf('/'))
                return path;
            }
        } while (!curEvent.done);
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
            var methodType,
                requestFontware,
                requestBackware,
                enableREST,
                listener,
                uriPath;

            (function prepareFromConfig() {
                var config = requestConfig[methodName];
                if (typeof config == "object" && !(config instanceof Array)) {
                    methodType = config.method;
                    requestFontware = config.fontware;
                    requestBackware = config.backware;
                    enableREST = config.enableREST;
                    listener = config.listener;
                    uriPath = config.uriPath;
                } else methodType = config;
            })();

            function registerRouterByMethod(methodType) {
                methodType = methodType.toUpperCase();

                if (!RouterFactory.isSupported(methodType))
                    throw new Error(
                        `Method ${methodType} in ${moduleName}/${methodName} do not support yet`
                    );

                var mainExecute = instance[methodName];

                var eventName;

                (function prepareEventName() {
                    if (uriPath == null) {
                        eventName = getEventName(
                            methodType,
                            url,
                            moduleName,
                            methodName
                        );
                    } else {
                        eventName = getEventName(methodType, uriPath);
                    }
                })();

                var isDevMode = this.config.isDevMode;
                // Executer will call each request

                if (this.config.enableRESTFul | enableREST) {
                    eventName = "REST-" + eventName;
                    this.restRouter.push(eventName);
                }

                console.log("-> event : " + eventName);
                // store listener
                function httpEvent(req, res) {
                    var thisArgs = {
                        $executer: mainExecute,
                        $eventName: eventName
                    };

                    function callBackWare(result) {
                        runBackWare(
                            eventName,
                            requestBackware,
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
                        requestFontware,
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
                }
                this.listener.set(eventName, httpEvent);
            }
            registerRouterByMethod = registerRouterByMethod.bind(this);

            (function registerRouter() {
                if (typeof methodType == "string") {
                    registerRouterByMethod(methodType);
                } else if (methodType instanceof Array) {
                    methodType.forEach(entryMethodType => {
                        registerRouterByMethod(entryMethodType);
                    });
                } else {
                    console.log(methodType);
                    throw new TypeError(
                        `Method ${methodType} in ${moduleName}/${methodName} isn't string or array`
                    );
                }
            })();
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
