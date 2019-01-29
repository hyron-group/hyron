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
                reqMiddleware: backware,
                thisArgs,
                args: [req, res, result],
                onComplete(data) {
                    handleResult(data, res, isDevMode);
                },
                onFailed(err) {
                    handleResult(err, res, isDevMode);
                },
                isFontware: false
            }
        )
    }

    function runsFontwares(req, res, thisArgs) {
        PluginsManager.runMiddleware(
            eventName, {
                reqMiddleware: fontware,
                thisArgs,
                args: [req, res],
                onComplete(args) {
                    var result = mainExecute.apply(thisArgs, args);
                    runBackwares(req, res, result, thisArgs);
                },
                onFailed(err) {
                    runBackwares(req, res, err, thisArgs);
                },
                isFontware: true
            })
    }

    return function httpEvent(req, res) {
        var sandbox = instance;
        Object.assign(sandbox, generalThisArgs);
        runsFontwares(req, res, sandbox);
    }
}

module.exports = httpEventWrapper;