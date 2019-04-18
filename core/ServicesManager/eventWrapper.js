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
        frontware,
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
                isfrontware: false
            }
        );
    }

    function runsfrontwares(req, res, thisArgs) {
        PluginsManager.runMiddleware(
            eventName, {
                reqMiddleware: frontware,
                thisArgs,
                args: [req, res],
                onComplete(args) {
                    var result = mainExecute.apply(thisArgs, args);
                    runBackwares(req, res, result, thisArgs);
                },
                onFailed(err) {
                    runBackwares(req, res, err, thisArgs);
                },
                isfrontware: true
            });
    }

    return function httpEvent(req, res) {
        var sandbox = instance;
        Object.assign(sandbox, generalThisArgs);
        runsfrontwares(req, res, sandbox);
    };
}

module.exports = httpEventWrapper;