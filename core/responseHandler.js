const AsyncFunction = (async () => {}).constructor;
/**
 * @description This function used to handle basic result for response
 * @param {*} result result after handle success
 * @param {http.ServerResponse} res http response
 */
function handingResult(result, res, isDevMode = false) {
    if (typeof result == "string" || result instanceof Buffer || result == null) {
        res.end(result);
    } else if (result instanceof Promise || result instanceof AsyncFunction) {
        result
            .then(val => {
                res.end(handingResult(val, res))
            })
            .catch(err => {
                handingError(err, res, isDevMode);
            });
    } else if (result instanceof Error) {
        handingError(result, res, isDevMode);
    } else res.end(result.toString());
}

/**
 * @description Used to handle error
 * @param {Error} error http error message
 * @param {http.ServerResponse} res http response
 * @param {boolean} isDevMode true if enable develop mode for log error
 */
function handingError(error, res, isDevMode) {
    var message = error.message;
    var code = error.code;
    if (isNaN(code)) code = 403; // Forbidden
    res.statusCode = code;
    if (isDevMode) {
        res.setHeader("Content-Type", "text/html");
        res.write(`<h3>${message}</h3>`);
        res.write(error.stack);
    } else res.write(message);
    res.end();
}

module.exports = handingResult;