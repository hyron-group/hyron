const crc = require("crc");
const parseTypeFilter = require("../lib/typeFilter");
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
    console.log(
        `-> Registered ${isFont ? "fontware" : "backware"} ${name} ${
            isGlobal ? "as global" : ""
        }`
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
            return handle.apply(this, [req, res, prev, config]);
        }

    if (matchType != null) {
        finalFunction =
            function (req, res, prev) {
                if (!matchType(prev)) return prev;
                return handle.apply(this, [req, res, prev, config]);
            }
    }

    if (checkout == null) checkout = function () {
        done();
        return false;
    }

    function idleFunction(req, res, prev) {
        var isChange = checkout.apply(this, done);
        if (isChange) onCreate.apply(this, config);
        return finalFunction.apply(this, [req, res, prev]);
    };
    if (onCreate != null) {
        return function initFunction(req, res, prev) {
            onCreate.apply(this, config);
            var result = finalFunction.apply(this, [req, res, prev]);
            // console.log(result)
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
    var result;
    if (func == null)
        onComplete(args[2]);
    else {
        result = func.apply(thisArgs, args);
    }

    if (result instanceof Promise || result instanceof AsyncFunction) {
        result
            .then(onComplete)
            .catch(onFailed);
    } else {
        onComplete(result)
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

    // console.log(reqMidWare);
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
            addMiddleware(newMiddlewareName, middleware, false, inFont);
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
            else console.warn(`[warning] Can't find fontware by name '${enableMidWareName}'`)
        }
    } else {
        for (var indexOfCurMiddleware in enableList) {
            var enableMidWareName = enableList[indexOfCurMiddleware];
            var backwareIndex = customBackWareIndex[enableMidWareName];
            if (backwareIndex != null)
                indexList.push(backwareIndex);
            else console.warn(`[warning] Can't find backware by name '${enableMidWareName}'`)
        }

        indexList = indexList.reverse();
    }

    indexList = indexList.map(Number);
    executesMidWareIndex[eventName] = indexList;

    return indexList;
}