const crypto = require("crypto");

var handlerHolder = [];
var customFontWareIndex = {};
var customBackWareIndex = {};
var globalFontWareIndex = {};
var globalBackWareIndex = {};

var executesMidWareIndex = {};

module.exports = {
    addMiddleware,
    runFontWare,
    runBackWare
};

function addMiddleware(name, handle, isGlobal, inFont) {
    var index = indexOfHandle(name);
    if (index == -1) {
        handlerHolder.push(handle);
        index = handlerHolder.length - 1;
    }
    if (isGlobal) {
        if (inFont) globalFontWareIndex[index] = name;
        else globalBackWareIndex[index] = name;
    } else {
        if (inFont) customFontWareIndex[name] = index;
        else customBackWareIndex[name] = index;
    }
    console.log(`Registered ${inFont?"fontware":"backware"} ${name} ${isGlobal?"as global":""}`)
}

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

    var i = -1;

    function runFunc(func) {
        var result;
        result = func.apply(thisArgs, args);

        if (result instanceof Promise) {
            result
                .then(data => {
                    args[2] = data;
                    runNextMiddleware();
                })
                .catch(err => {
                    onFailed(err);
                });
        } else {
            args[2] = result;
            runNextMiddleware();
        }
    }

    function runNextMiddleware() {
        var indexInStorage = handlersIndex[++i];
        if (!args[1].finished) {
            if (indexInStorage != null) {
                var execute = handlerHolder[indexInStorage];
                runFunc(execute);
            } else {
                onComplete(args[2]);
            }
        }
    }
    try {
        runNextMiddleware();
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

    for (var i in reqMidWare) {
        var middleware = reqMidWare[i];
        if (typeof middleware == "string") {
            // prepare disable global middleware by name
            if (middleware.charAt(0) == "!") {
                if (middleware.substr(1) == "*") disableAll = true;
                else disableList.push(middleware.substr(1));
            }
            // prepare enable middleware by name
            else enableList.push(middleware);
            // support embed middle handle in config
        } else if (typeof middleware == "function") {
            var newMiddlewareName = crypto
                .createHash("md5")
                .digest(middleware)
                .toString("hex");
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
    for (var i in disableList) {
        var disableMidWareIndex = disableList[i];
        indexList.splice(indexList.indexOf(disableMidWareIndex));
    }

    // enable some of middleware by config
    if (inFont) {
        for (var i in enableList) {
            var enableMidWareName = enableList[i];
            indexList.push(customFontWareIndex[enableMidWareName]);
        }
    } else {
        for (var i in enableList) {
            var enableMidWareName = enableList[i];
            indexList.push(customBackWareIndex[enableMidWareName]);
        }

        indexList = indexList.reverse();
    }

    indexList = indexList.map(Number);
    executesMidWareIndex[eventName] = indexList;

    return indexList;
}
