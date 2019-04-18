const crc = require("crc");
const startRunMiddleware = require("./middlewareRunner");
const eventWrapper = require("./eventWrapper");
const parseRequireMiddleware = require("./prepareRequireMiddleware");
const chalk = require("chalk");

var handlerHolder = [];
var customfrontwareIndex = {};
var customBackWareIndex = {};
var globalfrontwareIndex = {};
var globalBackWareIndex = {};

var frontwareHandleIndex = {};
var backwareHandleIndex = {};

(function registerSyncFunc() {
    var syncFunc = function (req, res, prev) {
        return prev;
    };
    handlerHolder[0] = syncFunc;
})();

function indexOfHandle(name) {
    var keyIndex;

    var frontwareKeys = Object.keys(globalfrontwareIndex);
    for (let fwi = 0; fwi < frontwareKeys.length; fwi++) {
        keyIndex = frontwareKeys[fwi];
        let globalFwName = globalfrontwareIndex[keyIndex];
        if (globalFwName == name) return keyIndex;
    }

    if ((keyIndex = customfrontwareIndex[name]) != null) {
        return keyIndex;
    }

    if ((keyIndex = customBackWareIndex[name]) != null) {
        return keyIndex;
    }

    var backWareKeys = Object.keys(globalBackWareIndex);
    for (let bwi = 0; bwi < backWareKeys.length; bwi++) {
        keyIndex = backWareKeys[bwi];
        let globalBwName = globalBackWareIndex[keyIndex];
        if (globalBwName == name) return keyIndex;
    }

    return -1;
}


function addMiddleware(pluginsName, pluginsMeta, config, isfrontware) {
    if (isfrontware == null) {
        var {
            frontware,
            backware
        } = pluginsMeta;

        addMiddleware(pluginsName, frontware, config, true);
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
            if (isfrontware) globalfrontwareIndex[index] = pluginsName;
            else globalBackWareIndex[index] = pluginsName;
        } else {
            if (isfrontware) customfrontwareIndex[pluginsName] = index;
            else customBackWareIndex[pluginsName] = index;
        }
        console.info(chalk.gray(
            `➝  Registered ${isfrontware ? "frontware" : "backware"} '${pluginsName}' ${
                        isGlobal ? "as global" : ""
                    }`
        ));
    }
}


function getUniqueRepresentName(isfrontware, handle) {
    return isfrontware ? "fw-" : "bw-" +
        crc
        .crc24(handle.toString())
        .toString(16);
}

function addAnonymousMiddleware(handle, isfrontware) {

    var representName = getUniqueRepresentName(isfrontware, handle);

    var meta = {
        handle,
        global: false
    };

    addMiddleware(representName, meta, null, isfrontware);

    return representName;
}

function prepareHandlerIndex(eventName, reqMidWare, isfrontware) {
    var handlersIndex;

    if (isfrontware) {
        handlersIndex = frontwareHandleIndex[eventName];
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
    } = parseRequireMiddleware(reqMidWare, isfrontware);


    // add all global middleware
    if (!disableAll) {
        if (isfrontware) indexList = Object.keys(globalfrontwareIndex);
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
        if (isfrontware) {
            middlewareIndex = customfrontwareIndex[enableMidWareName];
        } else {
            middlewareIndex = customBackWareIndex[enableMidWareName];
        }
        if (middlewareIndex != null)
            indexList.push(middlewareIndex);
        else console.warn(chalk.yellow(`[warning] Can't find ${isfrontware?"font":"back"}ware by name '${enableMidWareName}'`));
    }

    indexList = indexList.map(Number);

    if (isfrontware) {
        indexList.push(0); // sync handler
        frontwareHandleIndex[eventName] = indexList;
    } else {
        indexList = indexList.reverse();
        backwareHandleIndex[eventName] = indexList;
    }

    return indexList;
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
        isfrontware
    } = middlewareArgs;
    var handlersIndex = prepareHandlerIndex(eventName, reqMiddleware, isfrontware);
    startRunMiddleware(handlersIndex, handlerHolder, thisArgs, args, onComplete, onFailed);
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