const writelog = require("writelog");

/**
 * @param {*} result
 * @param {http.ServerResponse} res
 */
function handingResult(result, res, isDevMode = false) {
    if (result instanceof Promise) {
        result.then(val => res.end(this.handingResult(val, res))).catch(err => {
            handingError(err, isDevMode);
        });
    } else if (result instanceof Error) {
        handingError(result, res, isDevMode);
    } else if (result == null) res.end();
    else if (typeof result == "object") {
        handingCustomResult(result, res);
    } else res.end(result);
}

function handingCustomResult(result, res) {
    if (result.$data != null) response = result.$data;
    res.end();
}

function handingError(result, res, isDevMode) {
    console.error(result);
    var message = result.message;
    var code = message.substr(0, 3);
    if (!Number.isNaN(code)) {
        message = message.substr(4, message.length);
    } else code = 403; // Forbidden
    res.statusCode = code;
    res.write(message);
    if (isDevMode) {
        // writelog('error', result.stack);
        res.write("\n" + result.stack);
    }
    res.end();
}

module.exports = handingResult;
