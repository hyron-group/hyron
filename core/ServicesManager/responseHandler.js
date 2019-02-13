const AsyncFunction = (async () => {}).constructor;

function handleObject(res, data) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
}

function handingError(error, res, isDevMode) {
    var message = error.message;
    var code = error.code;
    if (isNaN(code)) {
        code = 403; // Forbidden
    }
    res.statusCode = code;
    if (isDevMode) {
        res.setHeader("Content-Type", "text/html");
        res.write(`<style>*{font-family:calibri;}</style>`)
        res.write(`<h3>${message}</h3>`);
        var stack = getBeautyErrorReport(error.stack);
        res.write(`<p>${stack.substr(stack.indexOf("at") || 0)}</p>`);
    } else {
        res.write(message);
    }
    res.end();
}

function getBeautyErrorReport(stack) {
    stack = stack.replace(/\n/g, "<br>");
    var pathReg = /[(](([\w\d\s:\\\/+-.]+):([\d]+):([\d]+))[)]/g;
    stack = stack.replace(pathReg, `(<a href="file:///$2#line=$3,$4" type="text/plain">$1</a>)`);
    return stack;
}


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
        handleObject(res, result);
    } else {
        res.end(result.toString());
    }
}

module.exports = handingResult;