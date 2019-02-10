const AsyncFunction = (async () => {}).constructor;

function handingResult(result, res, isDevMode = false) {
    if (res.finished) return;

    if (typeof result == "string" ||
        result instanceof Buffer ||
        result == null) {
        res.end(result);
    } else if (result instanceof Promise ||
        result instanceof AsyncFunction) {
        result
            .then((val) => {
                handingResult(val, res, isDevMode);
            })
            .catch((err) => {
                handingError(err, res, isDevMode);
            });
    } else if (result instanceof Error) {
        handingError(result, res, isDevMode);
    } else if (result.constructor.name == "Object") {
        handleObject(res, data);
    } else res.end(result.toString());
}

function handleObject(res, data) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
}

function handingError(error, res, isDevMode) {
    var message = error.message;
    var code = error.code;
    if (isNaN(code)) code = 403; // Forbidden
    res.statusCode = code;
    if (isDevMode) {
        res.setHeader("Content-Type", "text/html");
        res.write(`<h3>${message}</h3>`);
        var stack = error.stack;
        res.write(stack.substr(stack.indexOf('at') || 0));
    } else res.write(message);
    res.end();
}

module.exports = handingResult;