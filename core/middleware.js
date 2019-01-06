const crc = require("crc");
const parseTypeFilter = require("../lib/typeFilter");
const logger = require('../lib/logger')
const AsyncFunction = (async () => {}).constructor;

var handlerHolder = [];
var customFontWareIndex = {};
var customBackWareIndex = {};
var globalFontWareIndex = {};
var globalBackWareIndex = {};

var executesMidWareIndex = {};

module.exports = {
    addMiddleware,
    runFontWare,
    runBackWare,
    getMiddleware
};

(function registerSyncFunc() {
    var syncFunc = function (req, res, prev) {
        return prev;
    };
    handlerHolder.push(syncFunc);
})();

function getMiddleware(name) {
    return handlerHolder[indexOfHandle(name)];
}

function addMiddleware(name, isFont, meta, config) {
    var isGlobal = meta.global || false;
    var handle = meta.handle;
    var onCreate = meta.onCreate;
    var checkout = meta.checkout;
    var typeFilter = meta.typeFilter;

    var index = indexOfHandle(name);
    if (index == -1) {
        index = handlerHolder.length;
        handle = eventWrapper(index, config, handle, onCreate, checkout, typeFilter);
        handlerHolder.push(handle);
    } else {
        handlerHolder[index] = eventWrapper(index, config, handle, onCreate, checkout, typeFilter);
    }

    if (isGlobal) {
        if (isFont) globalFontWareIndex[index] = name;
        else globalBackWareIndex[index] = name;
    } else {
        if (isFont) customFontWareIndex[name] = index;
        else customBackWareIndex[name] = index;
    }
    logger.info(
        `\x1b[36m-> Registered ${isFont ? "fontware" : "backware"} ${name} ${
            isGlobal ? "as global" : ""
        }\x1b[0m`
    );
}

/**
 * @description Used to define structure for middleware function
 * @returns formated middleware function
 */
function eventWrapper(index, config, handle, onCreate, checkout, typeFilter) {

    var matchType = parseTypeFilter(typeFilter);

    function done() {
        handlerHolder[index] = finalFunction;
    }

    var finalFunction;

    if (handle == null) {
        finalFunction = function (req, res, prev) {
            return prev;
        }
    } else
        finalFunction =
        function (req, res, prev) {
            return handle.call(this, req, res, prev, config);
        }

    if (matchType != null) {
        finalFunction =
            function (req, res, prev) {
                if (!matchType(prev)) return prev;
                return handle.call(this, req, res, prev, config);
            }
    }

    if (checkout == null) checkout = function () {
        done();
        return false;
    }

    function idleFunction(req, res, prev) {
        var isChange = checkout.call(this, done);
        if (isChange) onCreate.call(this, config);
        return finalFunction.call(this, req, res, prev);
    };
    if (onCreate != null) {
        return function initFunction(req, res, prev) {
            onCreate.call(this, config);
            var result = finalFunction.call(this, req, res, prev);
            if (checkout != null)
                handlerHolder[index] = idleFunction;
            else
                handlerHolder[index] = finalFunction;

            return result;
        }
    }
    return idleFunction;
}

/**
 * @description Return cached index of a middleware by name
 * @param {string} name
 * @returns index of this middleware in scope
 */
function indexOfHandle(name) {
    var keyIndex;

    var fontWareKeys = Object.keys(globalFontWareIndex);
    for (var i = 0; i < fontWareKeys.length; i++) {
        keyIndex = fontWareKeys[i];
        var val = globalFontWareIndex[keyIndex];
        if (val == name) return keyIndex;
    }

    if ((keyIndex = customFontWareIndex[name]) != null) {
        return keyIndex;
    }

    if ((keyIndex = customBackWareIndex[name]) != null) {
        return keyIndex;
    }

    var backWareKeys = Object.keys(globalBackWareIndex);
    for (var i = 0; i < backWareKeys.length; i++) {
        keyIndex = backWareKeys[i];
        var val = globalBackWareIndex[keyIndex];
        if (val == name) return keyIndex;
    }

    return -1;
}


function runFunc(func, thisArgs, args, onComplete, onFailed) {

    var result = args[2];

    if (func == null)
        onComplete(args[2]);
    if (result instanceof Promise || result instanceof AsyncFunction) {
        result.then(data => {
            args[2] = data;
            result = func.apply(thisArgs, args);
            onComplete(result);
        })
    } else {
        result = func.apply(thisArgs, args);
        onComplete(result);
    }
}

function runNextMiddleware(handlersIndex, args, thisArgs, onComplete, onFailed, i) {
    var indexInStorage = handlersIndex[i];
    if (!args[1].finished) {
        if (indexInStorage != null) {
            var execute = handlerHolder[indexInStorage];
            runFunc(execute, thisArgs, args, (result) => {
                args[2] = result;
                runNextMiddleware(handlersIndex, args, thisArgs, onComplete, onFailed, i + 1);
            }, onFailed);
        } else {
            onComplete(args[2]);
        }
    }
}

function runMiddleware(
    eventName,
    reqMidWare,
    thisArgs,
    args,
    onComplete,
    onFailed,
    position
) {
    var handlersIndex = prepareHandler(eventName, reqMidWare, position);
    try {
        runNextMiddleware(handlersIndex, args, thisArgs, onComplete, onFailed, 0);
    } catch (err) {
        onFailed(err);
    }
}

function runFontWare(
    eventName,
    reqMidWare,
    thisArgs,
    args,
    onComplete,
    onFailed
) {
    runMiddleware(
        eventName,
        reqMidWare,
        thisArgs,
        args,
        onComplete,
        onFailed,
        "font"
    );
}

function runBackWare(
    eventName,
    reqMidWare,
    thisArgs,
    args,
    onComplete,
    onFailed
) {
    runMiddleware(
        eventName,
        reqMidWare,
        thisArgs,
        args,
        onComplete,
        onFailed,
        "back"
    );
}

function prepareHandler(eventName, reqMidWare, position) {
    eventName += position;
    var handlersIndex = executesMidWareIndex[eventName];
    if (handlersIndex != null) {
        return handlersIndex;
    }

    var indexList = [];
    var disableList = [];
    var enableList = [];
    var disableAll = false;

    var inFont = position == "font";

    for (var indexOfCurMiddleware in reqMidWare) {
        var middleware = reqMidWare[indexOfCurMiddleware];
        if (typeof middleware == "string") {
            // prepare disable global middleware by name
            if (middleware.charAt(0) == "!") {
                var midwareName = middleware.substr(1);
                var indexOfEnableMiddleware = reqMidWare.indexOf(midwareName);
                if (midwareName == "*") disableAll = true;
                else if (indexOfEnableMiddleware < indexOfCurMiddleware) {
                    disableList.push(midwareName);
                }
            }
            // prepare enable middleware by name
            else enableList.push(middleware);
            // support embed middle handle in config
        } else if (typeof middleware == "function") {
            var newMiddlewareName = crc
                .crc32(middleware.toString())
                .toString(32);

            var newMiddlewareName = crc
                .crc32(middleware.toString())
                .toString(32);
            var meta = {
                handle: middleware,
                global: false
            };

            addMiddleware(newMiddlewareName, middleware, meta, inFont);

            enableList.push(newMiddlewareName);
        }
    }

    // add all global middleware
    if (!disableAll) {
        if (inFont) indexList = Object.keys(globalFontWareIndex);
        else indexList = Object.keys(globalBackWareIndex);
    }

    // disable global some of middleware by config
    for (var indexOfCurMiddleware in disableList) {
        var disableMidWareIndex = disableList[indexOfCurMiddleware];
        indexList.splice(indexList.indexOf(disableMidWareIndex));
    }

    // enable some of middleware by config
    if (inFont) {
        for (var indexOfCurMiddleware in enableList) {
            var enableMidWareName = enableList[indexOfCurMiddleware];
            var fontwareIndex = customFontWareIndex[enableMidWareName];
            if (fontwareIndex != null)
                indexList.push(fontwareIndex);
            else logger.warn(`[warning] Can't find fontware by name '${enableMidWareName}'`)
        }
        indexList.push(0);
    } else {
        for (var indexOfCurMiddleware in enableList) {
            var enableMidWareName = enableList[indexOfCurMiddleware];
            var backwareIndex = customBackWareIndex[enableMidWareName];
            if (backwareIndex != null)
                indexList.push(backwareIndex);
            else logger.warn(`[warning] Can't find backware by name '${enableMidWareName}'`)
        }

        indexList = indexList.reverse();
    }

    indexList = indexList.map(Number);
    executesMidWareIndex[eventName] = indexList;

    return indexList;
}