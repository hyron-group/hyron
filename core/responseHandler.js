/**
 * @param {*} result
 * @param {http.ServerResponse} res
 */
function handingResult(result, res, isDevMode = false) {
    if (result instanceof Promise) {
        result
        .then(val => res.end(this.handingResult(val, res)))
        .catch(err => {
            handingError(err, isDevMode);
        });
    } else if (result instanceof Error) {
        handingError(result, res, isDevMode);
    } else if (typeof result == "object") {
        handingCustomResult(result, res);
    } else res.end(result);
}

function handingCustomResult(result, res) {
    var data = result;
    if (result.$data != null) data = result.$data;
    if (result.$type != null) res.setHeader("Content-Type", result.$type);
    if (result.$status != null) res.statusCode = res.$code;
    if (result.$message != null) res.statusMessage = res.$message;
    if (result.$headers != null) {
        var header = result.$header;
        Object.keys(header).forEach(key => {
            res.setHeader(key, header[key]);
        });
    }
    if (result.$render !=null){

    }
    if (result.$redirect !=null){
        res.setHeader("Location", result.$redirect);
    }
    res.end(data);
}

function handingError(result, res, isDevMode) {
    var message = result.message;
    var code = message.substr(0, 3);
    if (!isNaN(code)) {
        message = message.substr(4, message.length);
    } else code = 403; // Forbidden
    res.statusCode = code;
    res.write(message);
    if (isDevMode) {
        // writelog('error', result.stack);
        res.write("\n\n" + result.stack);
    }
    res.end();
}

module.exports = handingResult;
