const crc = require("crc");
const parseTypeFilter = require("../lib/typeFilter");
const AsyncFunction = (async () => {}).constructor;

var handlerHolder = [];
var customFontWareIndex = {};
var customBackWareIndex = {};
var globalFontWareIndex = {};
var globalBackWareIndex = {};

var fontwareHandleIndex = {};
var backwareHandleIndex = {};

(function registerSyncFunc() {
    var syncFunc = function (req, res, prev) {
        return prev;
    };
    handlerHolder[0] = syncFunc;
})();


class PluginsManager {

    addMiddleware(name, isFontware, meta, config) {
        if (meta == null) return;
        var isGlobal = meta.global || false;

        var index = indexOfHandle(name);
        if (index == -1) {
            index = handlerHolder.length;
            var handle = eventWrapper(index, config, meta);
            handlerHolder.push(handle);
        } else {
            handlerHolder[index] = eventWrapper(index, config, meta);
        }

        if (isGlobal) {
            if (isFontware) globalFontWareIndex[index] = name;
            else globalBackWareIndex[index] = name;
        } else {
            if (isFontware) customFontWareIndex[name] = index;
            else customBackWareIndex[name] = index;
        }
        console.info(
            `-> Registered ${isFontware ? "fontware" : "backware"} '${name}' ${
                    isGlobal ? "as global" : ""
                }`
        );
    }

    runMiddleware(
        eventName,
        middlewareArgs,
        onComplete,
        onFailed,
        isFontware
    ) {
        var {
            reqMidWare,
            thisArgs,
            args
        } = middlewareArgs;

        var handlersIndex = prepareHandlerIndex(eventName, reqMidWare, isFontware);
        try {
            runNextMiddleware(handlersIndex, args, thisArgs, onComplete, onFailed);
        } catch (err) {
            onFailed(err);
        }
    }
};



function eventWrapper(index, config, pluginsContent) {
    var {
        handle,
        onCreate,
        checkout,
        typeFilter
    } = pluginsContent;

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

function runNextMiddleware(handlersIndex, args, thisArgs, onComplete, onFailed, i = 0) {
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

function registerAnonymousHandler(handle, isFontware) {

    var representName =
        isFontware ? "fw-" : "bw-" +
        crc
        .crc24(handle.toString())
        .toString(16);

    var meta = {
        handle: handle,
        global: false
    };

    addMiddleware(representName, handle, meta, isFontware);

    enableList.push(representName);
}

function parseRequireMiddleware(reqMidWare, isFontware) {

    var disableList = [];
    var enableList = [];
    var disableAll = false;


    for (var i = 0; i < reqMidWare.length; i++) {
        var middlewareMeta = reqMidWare[i];
        if (typeof middlewareMeta == "string") {
            // prepare disable global middleware by name
            if (middlewareMeta >= "!" && middlewareMeta < '"') {
                var middlewareName = middlewareMeta.substr(1);
                var enableMiddlewareIndex = reqMidWare.indexOf(middlewareName);
                if (middlewareName == "*") {
                    disableAll = true;
                    break;
                } else if (enableMiddlewareIndex < i) {
                    disableList.push(middlewareName);
                }
            }
            // prepare enable middleware by name
            else enableList.push(middlewareMeta);
            // support embed middle handle in config
        } else if (typeof middlewareMeta == "function") {
            registerAnonymousHandler(middlewareMeta, isFontware);
        } else throw new TypeError(`middleware at ${i} should be a string name or function handle`)
    }

    return {
        disableList,
        enableList,
        disableAll
    }
}

function prepareHandlerIndex(eventName, reqMidWare, isFontware) {
    var handlersIndex;

    if (isFontware) {
        handlersIndex = fontwareHandleIndex[eventName];
    } else {
        handlerHolder = backwareHandleIndex[eventName];
    }
    if (handlersIndex != null) {
        return handlersIndex;
    }

    var indexList = [];

    var {
        disableList,
        enableList,
        disableAll
    } = parseRequireMiddleware(reqMidWare, isFontware);


    // add all global middleware
    if (!disableAll) {
        if (isFontware) indexList = Object.keys(globalFontWareIndex);
        else indexList = Object.keys(globalBackWareIndex);
    }

    // disable global middleware by config
    for (var i = 0; i < disableList.length; i++) {
        var disableMidWareIndex = disableList[i];
        indexList.splice(indexList.indexOf(disableMidWareIndex));
    }

    // enable middleware by config
    for (var index in enableList) {
        var enableMidWareName = enableList[index];
        var middlewareIndex;
        if (isFontware) {
            middlewareIndex = customFontWareIndex[enableMidWareName];
        } else {
            middlewareIndex = customBackWareIndex[enableMidWareName];
        }
        if (middlewareIndex != null)
            indexList.push(middlewareIndex);
        else console.warn(`[warning] Can't find ${isFontware?"font":"back"}ware by name '${enableMidWareName}'`)
    }

    indexList = indexList.map(Number);

    if (isFontware) {
        indexList.push(0); // sync handler
        fontwareHandleIndex[eventName] = indexList;
    } else {
        indexList = indexList.reverse();
        backwareHandleIndex[eventName] = indexList;
    }

    return indexList;
}

module.exports = PluginsManager;