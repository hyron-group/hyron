const PluginsManager = require("../PluginsManager");
const handleResult = require("./responseHandler");

function httpEventWrapper(
    isDevMode,
    eventName,
    instance,
    mainExecute,
    routeConfig
) {
    var {
        fontware,
        backware
    } = routeConfig;

    var generalThisArgs = {
        $executer: mainExecute,
        $eventName: eventName,
        $requestConfig: routeConfig
    };


    function runBackwares(req, res, result, thisArgs) {
        PluginsManager.runMiddleware(
            eventName, {
                backware,
                thisArgs,
                args: [req, res, result]
            },
            data => {
                handleResult(data, res, isDevMode);
            },
            err => {
                handleResult(err, res, isDevMode);
            }, false
        )
    }

    function runsFontwares(req, res, thisArgs) {
        PluginsManager.runMiddleware(
                eventName, {
                    fontware,
                    thisArgs,
                    args: [req, res]
                },
                args => {
                    var result = mainExecute.apply(thisArgs, args);
                    runBackwares(req, res, result, thisArgs);
                },
                err => {
                    runBackwares(req, res, err, thisArgs);
                }),
            true
    }

    return function httpEvent(req, res) {
        var sandbox = instance;
        Object.assign(sandbox, generalThisArgs);
        runsFontwares(req, res, sandbox);
    }
}

module.exports = httpEventWrapper;