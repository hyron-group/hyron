const crc = require("crc");
const startRunMiddleware = require("./middlewareRunner");
const eventWrapper = require("./eventWrapper");
const parseRequireMiddleware = require("./prepareRequireMiddleware");
const chalk = require("chalk");

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

function addMiddleware(pluginsName, pluginsMeta, config, isFontware) {
    if (isFontware == null) {
        var {
            fontware,
            backware
        } = pluginsMeta;

        addMiddleware(pluginsName, fontware, config, true);
        addMiddleware(pluginsName, backware, config, false);
    } else {
        if (pluginsMeta == null) return;
        var isGlobal = pluginsMeta.global || false;

        var index = indexOfHandle(pluginsName);
        if (index == -1) {
            index = handlerHolder.length;
            var handle = eventWrapper(index, handlerHolder, pluginsMeta, config);
            handlerHolder.push(handle);
        } else {
            handlerHolder[index] = eventWrapper(index, handlerHolder, pluginsMeta, config);
        }

        if (isGlobal) {
            if (isFontware) globalFontWareIndex[index] = pluginsName;
            else globalBackWareIndex[index] = pluginsName;
        } else {
            if (isFontware) customFontWareIndex[pluginsName] = index;
            else customBackWareIndex[pluginsName] = index;
        }
        console.info(chalk.gray(
            `➝  Registered ${isFontware ? "fontware" : "backware"} "${pluginsName}" ${
                        isGlobal ? "as global" : ""
                    }`
        ));
    }
}

function runMiddleware(
    eventName,
    middlewareArgs
) {
    var {
        reqMiddleware,
        thisArgs,
        args,
        onComplete,
        onFailed,
        isFontware
    } = middlewareArgs;
    var handlersIndex = prepareHandlerIndex(eventName, reqMiddleware, isFontware);
    startRunMiddleware(handlersIndex, handlerHolder, thisArgs, args, onComplete, onFailed);
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

function getUniqueRepresentName(isFontware, handle) {
    return isFontware ? "fw-" : "bw-" +
        crc
        .crc24(handle.toString())
        .toString(16);
}

function addAnonymousMiddleware(handle, isFontware) {

    var representName = getUniqueRepresentName(isFontware, handle);

    var meta = {
        handle,
        global: false
    };

    addMiddleware(representName, meta, null, isFontware);

    return representName;
}

function prepareHandlerIndex(eventName, reqMidWare, isFontware) {
    var handlersIndex;

    if (isFontware) {
        handlersIndex = fontwareHandleIndex[eventName];
    } else {
        handlersIndex = backwareHandleIndex[eventName];
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
        else console.warn(chalk.yellow(`[warning] Can"t find ${isFontware?"font":"back"}ware by name "${enableMidWareName}"`))
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

function getMiddleware(name) {
    return handlerHolder[indexOfHandle(name)];
}

module.exports = {
    addMiddleware,
    addAnonymousMiddleware,
    runMiddleware,
    getMiddleware
};