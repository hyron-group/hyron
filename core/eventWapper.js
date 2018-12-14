const {
    runFontWare,
    runBackWare
} = require("./middleware");
const AsyncFunction = (async () => {}).constructor;
const handleResult = require("./responseHandler");


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
    instance,
    mainExecute,
    fontware,
    backware
) {
    var generalThisArgs = {
        $executer: mainExecute,
        $eventName: eventName,
    };

    function startBackWare(req, res, result, thisArgs) {
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

    function startFontWare(req, res, thisArgs) {
        runFontWare(
            eventName,
            fontware,
            thisArgs,
            [req, res],
            args => {
                var result = mainExecute.apply(thisArgs, args);
                startBackWare(req, res, result, thisArgs);
            },
            err => {
                startBackWare(req, res, err, thisArgs);
            }
        );
    }

    return function httpEvent(req, res) {
        var sandbox = instance;
        Object.assign(sandbox, generalThisArgs);
        startFontWare(req, res, sandbox);
    }
}

module.exports = httpEventWrapper;