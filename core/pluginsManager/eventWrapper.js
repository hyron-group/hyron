const parseTypeFilter = require("../../lib/typeFilter");
const AsyncFunction = (async () => {}).constructor;

function eventWrapper(index, handlerHolder, pluginsMeta, config) {
    var {
        handle,
        onCreate,
        checkout,
        typeFilter,
        global
    } = pluginsMeta;

    var matchType = parseTypeFilter(typeFilter);

    function completeCheckout() {
        handlerHolder[index] = finalFunction;
    }

    if (handle == null) {
        function finalFunction(req, res, prev) {
            return prev;
        }
    } else if (matchType != null) {
        function finalFunction(req, res, prev) {
            if (!matchType(prev)) return prev;
            return handle.call(this, req, res, prev, config);
        }
    } else {
        function finalFunction(req, res, prev) {
            return handle.call(this, req, res, prev, config);
        }
    }

    function onIdleResult(isChange, thisArgs, req, res, prev) {
        if (isChange) {
            return initFunction.call(thisArgs, req, res, prev);
        } else {
            return handle.call(this, req, res, prev, config);
        }
    }

    function idleFunction(req, res, prev) {
        var isChange = checkout.call(this, completeCheckout, config);
        if (isChange instanceof Promise ||
            isChange instanceof AsyncFunction) {
            return isChange.then((isChangeAsync) => {
                return onIdleResult(isChangeAsync, this, req, res, prev);
            })
        } else
            return onIdleResult(isChange, this, req, res, prev);
    }

    if (matchType != null) {
        function idleFunction(req, res, prev) {
            if (!matchType(prev)) return prev;
            idleFunction.call(this, req, res, prev);
        }
    }


    if (checkout == null) {
        function onInitResult(thisArgs, req, res, prev) {
            var result = finalFunction.call(thisArgs, req, res, prev);
            completeCheckout();
            return result;
        }

    } else {
        function onInitResult(thisArgs, req, res, prev) {
            var result = finalFunction.call(thisArgs, req, res, prev);
            handlerHolder[index] = idleFunction;
            return result;
        }
    }

    function initFunction(req, res, prev) {
        var initResult = onCreate.call(this, config);
        if (initResult instanceof AsyncFunction) {
            return initResult.then(() => {
                return onInitResult(this, req, res, prev);
            })
        } else
            return onInitResult(this, req, res, prev);
    }

    if (onCreate != null) {
        return initFunction
    } else {
        return finalFunction;
    }
}

module.exports = eventWrapper;