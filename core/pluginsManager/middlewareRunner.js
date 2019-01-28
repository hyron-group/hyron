const AsyncFunction = (async () => {}).constructor;

function runMiddleware(func, middlewareParams) {

    var {
        args,
        thisArgs,
        onComplete,
        onFailed
    } = middlewareParams;

    var result = args[2];

    if (func == null)
        onComplete(args[2]);
    if (result instanceof Promise || result instanceof AsyncFunction) {
        result
            .then(data => {
                args[2] = data;
                result = func.apply(thisArgs, args);
                onComplete(result);
            })
            .catch(err => {
                onFailed(err);
            })
    } else {
        result = func.apply(thisArgs, args);
        onComplete(result);
    }

}

function runNextMiddleware(handlersIndex, handlerHolder, middlewareParams, i = 0) {
    var indexInStorage = handlersIndex[i];
    if (!args[1].finished) {
        if (indexInStorage != null) {
            var execute = handlerHolder[indexInStorage];
            middlewareParams.onComplete = function skip(result) {
                args[2] = result;
                runNextMiddleware(handlersIndex, handlerHolder, middlewareParams, i + 1);
            }
            runMiddleware(execute, middlewareParams);
        } else {
            middlewareParams.onComplete(args[2]);
        }
    }
}

module.exports = runNextMiddleware;