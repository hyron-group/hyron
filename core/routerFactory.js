const getUriPath = require("../lib/queryParser").getUriPath;
const { runFontWare, runBackWare } = require("./middleware");
const http = require("http");
const handleResult = require("./responseHandler");

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

    constructor(config) {
        this.listener = new Map();
        this.config = config;
    }

    

    registerRouter(url, moduleName, moduleClass) {
        var path = url + moduleName;
        console.log("\nregister " + path);
        this.initHandler(path, moduleName, moduleClass);
    }

    getListener(method, url) {
        var key = method + url;
        if (!RouterFactory.isSupported(method)) return null;
        return this.listener[key];
    }

    triggerRouter(req, res) {
        var uriPath = getUriPath(req.url);
        var execute = this.listener.get(req.method + uriPath);
        if (execute == null) {
            execute = this.listener.get("ALL" + uriPath); // support for all method
            if (execute == null) {
                var err = new Error(
                    `${404}:Can't find router at path ${req.method + uriPath}`
                );
                handleResult(err, res, this.config.isDevMode);
                return;
            }
        }
        execute(req, res);
    }

    static isSupported(method) {
        return ["GET", "POST", "HEAD", "DELETE", "PUT"].includes(method);
    }

    initHandler(url, moduleName, moduleClass) {
        var requestConfig = moduleClass.requestConfig();
        var instance = new moduleClass();
        if (requestConfig == null)
            throw new Error(
                `Module ${moduleName} do not contain requestConfig() method to config router`
            );
        Object.keys(requestConfig).forEach(methodName => {
            console.log("lookup : " + methodName);
            var config = requestConfig[methodName];
            var methodType = config; // Inline mode
            var fontWareReq, backWareReq;
            if (typeof config == "object") {
                methodType = config.method;
                fontWareReq = config.fontware;
                backWareReq = config.backware;
            }

            methodType = methodType.toUpperCase();
            if (!RouterFactory.isSupported(methodType))
                throw new Error(
                    `Method ${methodType} in ${moduleName}/${methodName} do not support yet`
                );

            var mainExecute = instance[methodName];

            var eventName = methodType + url + "/" + methodName;
            // Executer will call each request
            var isDevMode = this.config.isDevMode;

            if (methodType != null) console.log("-> method : " + methodType);
            if (fontWareReq != null)
                console.log("-> fontware : " + fontWareReq);
            if (backWareReq != null)
                console.log("-> backware : " + backWareReq);

            // store listener
            this.listener.set(eventName, (req, res) => {
                var thisArgs = {
                    $executer: mainExecute,
                    $eventName: eventName
                };
                runFontWare(
                    eventName,
                    fontWareReq,
                    thisArgs,
                    [req, res],
                    args => {
                        var result = mainExecute.apply(thisArgs, args);
                        runBackWare(
                            eventName,
                            backWareReq,
                            thisArgs,
                            result,
                            result => {
                                handleResult(result, res, isDevMode);
                            },
                            err => {
                                handleResult(err, res, isDevMode);
                            }
                        );
                    },
                    err => {
                        handleResult(err, res, isDevMode);
                    }
                );
            });
        });
    }
};
