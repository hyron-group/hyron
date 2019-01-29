const AsyncFunction = (async () => {}).constructor;

function runFunction(
    func,
    thisArgs,
    args,
    onComplete,
    onFailed) {

    var result = args[2];

    if (func == null)
        return onComplete(args[2]);

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
        try {
            result = func.apply(thisArgs, args);
            onComplete(result);
        } catch (err) {
            onFailed(err);
        }
    }

}

function runNextMiddleware(
    handlersIndex,
    handlerHolder,
    thisArgs,
    args,
    onComplete,
    onFailed,
    i = 0) {
    var indexInStorage = handlersIndex[i];
    if (!args[1].finished) {
        if (indexInStorage != null) {
            var execute = handlerHolder[indexInStorage];
            runFunction(execute, thisArgs, args, (result) => {
                args[2] = result;
                runNextMiddleware(
                    handlersIndex, 
                    handlerHolder, 
                    thisArgs, 
                    args, 
                    onComplete, 
                    onFailed, 
                    i + 1);
            }, onFailed);
        } else {
            onComplete(args[2]);
        }
    }
}

module.exports = runNextMiddleware;