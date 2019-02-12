var crc = require("crc");

var pathHolder = {};
var cache = {};

/**
 * @description Used to cache url path from a service
 * @param {function} routerPackage
 * @param {string} baseURL
 * @param {string} prefix
 * @param {string} moduleName
 */
function build(baseURL, url, executer) {
    var path = url.substr(url.indexOf("/"));
    var routerData = {};
    routerData[path] = executer;
    if (pathHolder[baseURL] == null) {
        pathHolder[baseURL] = routerData;
    } else {
        Object.assign(pathHolder[baseURL], routerData);
    }
}

function getURLByPath(condition) {
    var completePath = cache[condition];
    if (completePath != null) {
        return completePath;
    } else {
        for (var curBaseUrl in pathHolder) {
            var instancePaths = pathHolder[curBaseUrl];
            for (var curPath in instancePaths) {
                if (curPath.endsWith(condition)) {
                    completePath = curBaseUrl + curPath;
                    cache[condition] = completePath;
                    return completePath;
                }
            }
        }
    }
}

function getURLByFunction(condition) {
    condition = condition.toString();
    var identityKey = crc.crc16(condition).toString(16);
    var completePath = cache[identityKey];
    if (completePath != null) {
        return completePath;
    } else {
        for (var curBaseUrl in pathHolder) {
            var instancePaths = pathHolder[curBaseUrl];
            for (var curPath in instancePaths) {
                var curHandle = pathHolder[curBaseUrl][curPath];
                if (curHandle.toString() == condition) {
                    completePath = curBaseUrl + curPath;
                    cache[identityKey] = completePath;
                    return completePath;
                }
            }
        }
    }
}

function findURL(condition) {
    if (typeof condition == "string") {
        return getURLByPath(condition);
    } else if (typeof condition == "function") {
        return getURLByFunction(condition);
    } else {
        throw new TypeError(`findURL args at 0 must be a function or string`);
    }
}

function getHandleOfURL(path, baseUrl) {
    var matchBase;
    if (baseUrl != null) {
        matchBase = pathHolder[baseUrl];
    } else {
        var firstKey = Object.keys(pathHolder)[0];
        matchBase = pathHolder[firstKey];
    }

    const ERR_NOT_FOUND_URL = new ReferenceError(`[error] do not found url : "${baseUrl+path}"`);

    if (matchBase == null) {
        throw ERR_NOT_FOUND_URL;
    } else {
        var handler = matchBase[path];
        if (handler == null) throw ERR_NOT_FOUND_URL;

        return handler;
    }
}

module.exports = {
    build,
    findURL,
    getHandleOfURL
};