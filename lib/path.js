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
    } else Object.assign(pathHolder[baseURL], routerData);
}

function getURL(query) {
    var completePath = cache[query];
    if (completePath != null) {
        return completePath;
    } else {
        for (var curBaseUrl in pathHolder) {
            var instancePaths = pathHolder[curBaseUrl];
            for (var curPath in instancePaths) {
                if (curPath.endsWith(query)) {
                    completePath = curBaseUrl + curPath;
                    cache[query] = completePath;
                    return completePath;
                }
            }
        }
    }
}

function findURL(query) {
    if (query == null) return;
    if (typeof query == "string") return getURL(query);
    query = query.toString();
    var identityKey = crc.crc16(query).toString(16);
    var completePath = cache[identityKey];
    if (completePath != null) {
        return completePath;
    } else {
        for (var curBaseUrl in pathHolder) {
            var instancePaths = pathHolder[curBaseUrl];
            for (var curPath in instancePaths) {
                var curHandle = pathHolder[curBaseUrl][curPath];
                if (curHandle.toString() == query) {
                    completePath = curBaseUrl + curPath;
                    cache[identityKey] = completePath;
                    return completePath;
                }
            }
        }
    }
}

function getHandleOfURL(path, baseUrl) {
    var matchBase;
    if (baseUrl != null) {
        matchBase = pathHolder[baseUrl]
    } else {
        var firstKey = Object.keys(pathHolder)[0];
        matchBase = pathHolder[firstKey];
    }

    const ERR_NOT_FOUND_URL = new ReferenceError(`[error] do not found url : '${baseUrl+path}'`)

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