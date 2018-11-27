const crc = require("crc");

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

/**
 * @description Used to register a middleware to scope
 * @param {string} name name of middleware
 * @param {function} handle function to handle
 * @param {boolean} isGlobal true if this middleware is global, and it can be run by mosts of router.
 * @param {boolean} inFont true if this middleware run in font of handle, else, it will run in back
 * @param {*} config for this middleware. it define by itself
 */
function addMiddleware(name, handle, isGlobal, inFont, config) {
    if (config != null) handle = wrapperConfig(config);
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
    console.log(
        `-> Registered ${inFont ? "fontware" : "backware"} ${name} ${
            isGlobal ? "as global" : ""
        }`
    );
}

/**
 * @description Used to define structure for middleware function
 * @returns formated middleware function
 */
function wrapperConfig(config) {
    return function(req, res, prev) {
        return handle(req, res, prev, config);
    };
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

/**
 * @description Run and cached a set of middleware by registered event
 * @param {string} eventName name of http event
 * @param {[string]} reqMidWare set of request middle to run. add '!' before middleware name to disable it
 * @param {object} thisArgs this args for middleware. It can used to bind data inside or handle data from another middlew
 * @param {array} args include : req, res from http and var prev for result storage
 * @param {function} onComplete a function for execute success all middleware
 * @param {function} onFailed a function for execute failed from middleware
 * @param {*} position 'font' or 'back' to cache this run in font or back
 */
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
        if (func == null) {
            console.error(
                `[warning] Can't load a unknown ${position}ware at ${eventName}:${i}`
            );
            runNextMiddleware();
            return;
        } else {
            result = func.apply(thisArgs, args);
        }

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

/**
 * @description Run a set of middleware and cache it in font of main handle
 * @param {*} eventName name of http event
 * @param {[string]} reqMidWare set of request middle to run. add '!' before middleware name to disable it
 * @param {object} thisArgs this args for middleware. It can used to bind data inside or handle data from another middlew
 * @param {array} args include : req, res from http and var prev for result storage
 * @param {function} onComplete a function for execute success all middleware
 * @param {function} onFailed a function for execute failed from middleware
 */
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

/**
 * @description Run a set of middleware and cache it in back of main handle
 * @param {*} eventName name of http event
 * @param {[string]} reqMidWare set of request middle to run. add '!' before middleware name to disable it
 * @param {object} thisArgs this args for middleware. It can used to bind data inside or handle data from another middlew
 * @param {array} args include : req, res from http and var prev for result storage
 * @param {function} onComplete a function for execute success all middleware
 * @param {function} onFailed a function for execute failed from middleware
 */
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

/**
 * @description prepare index list of middleware to run and cache it
 * @param {*} eventName name of http event
 * @param {*} reqMidWare set of request middle to run. add '!' before middleware name to disable it
 * @param {*} position 'font' or 'back' to cache this run in font or back
 * @returns
 */
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
            indexList.push(customFontWareIndex[enableMidWareName]);
        }
    } else {
        for (var indexOfCurMiddleware in enableList) {
            var enableMidWareName = enableList[indexOfCurMiddleware];
            indexList.push(customBackWareIndex[enableMidWareName]);
        }

        indexList = indexList.reverse();
    }

    indexList = indexList.map(Number);
    executesMidWareIndex[eventName] = indexList;

    return indexList;
}
