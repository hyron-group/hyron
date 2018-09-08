var handlerStorage = [];
var customMidWareIndex = {};
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
        handlerStorage.push(handle);
        index = handlerStorage.length-1;
    }
    if (isGlobal) {
        if (inFont) globalFontWareIndex[index] = name;
        else globalBackWareIndex[index] = name;
    } else customMidWareIndex[name] = index;
}

function indexOfHandle(name) {

    var keyIndex;

    var fontWareKeys = Object.keys(globalFontWareIndex);
    for(var i=0; i<fontWareKeys.length; i++){
        keyIndex = fontWareKeys[i];
        var val = globalFontWareIndex[keyIndex];
        if(val == name) return keyIndex;
    }

    if((keyIndex=customMidWareIndex[name])!=null){
        return keyIndex;
    }

    var backWareKeys = Object.keys(globalBackWareIndex);
    for(var i=0; i<backWareKeys.length; i++){
        keyIndex = backWareKeys[i];
        var val = globalBackWareIndex[keyIndex];
        if(val == name) return keyIndex;
    }

    return -1;
}

function runFontWare(eventName, reqMidWare, thisArgs, args, onComplete, onFailed) {
    var handlersIndex = prepareHandler(reqMidWare, eventName, true);

    var i=-1;

    function runFunc(func) {
        var result = func.apply(thisArgs, args);
        if (result instanceof Promise) {
            result
                .then(data => {
                    args[2] = data;
                    runNextMiddleware();
                })
                .catch(err => {
                    onFailed(err)
                });
        } else {
            args[2] = result;
            runNextMiddleware();
        }
    }

    function runNextMiddleware() {
        var indexInStorage = handlersIndex[++i];
        if(indexInStorage!=null){
            var execute = handlerStorage[indexInStorage];
            runFunc(execute);
        } else {
            onComplete(args[2]);
        };
    }

    runNextMiddleware();
}

async function runBackWare(
    eventName,
    reqMidWare,
    thisArgs,
    result,
    onComplete,
    onFailed
) {
    var handlersIndex = prepareHandler(reqMidWare, eventName, false);

    var i=-1;

    function runFunc(func) {
        var result = func.apply(thisArgs, result);
        if (result instanceof Promise) {
            result
                .then(data => {
                    result = data;
                    runNextMiddleware();
                })
                .catch(err => {
                    onFailed(err)
                });
        } else {
            runNextMiddleware();
        }
    }

    function runNextMiddleware() {
        var indexInStorage = handlersIndex[++i];
        if(indexInStorage!=null){
            var execute = handlerStorage[indexInStorage];
            runFunc(execute);
        } else {
            onComplete(result);
        };
    }

    runNextMiddleware();
}

function prepareHandler(reqMidWare, eventName, inFont) {
    eventName = reqMidWare + (inFont?"font":"back");
    var handlersIndex = executesMidWareIndex[eventName];
    if (handlersIndex != null) return handlersIndex;

    var indexList = [];
    var disableList = [];
    var enableList = [];

    for (var i in reqMidWare) {
        var midWareName = reqMidWare[i];
        if (midWareName.charAt(0) == "!")
            disableList.push(midWareName.substr(1));
        else enableList.push(midWareName);
    }

    if (inFont) indexList = Object.keys(globalFontWareIndex);
    else indexList = Object.keys(globalBackWareIndex);

    for (var i in disableList) {
        var disableMidWareIndex = disableList[i];
        indexList.splice(indexList.indexOf(disableMidWareIndex));
    }

    for (var i in enableList) {
        var enableMidWareName = enableList[i];
        indexList.push(customMidWareIndex[enableMidWareName]);
    }

    return indexList;
}
