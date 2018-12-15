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
function build(baseURL, eventName, executer) {
    var path = eventName.substr(eventName.indexOf("/"));
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

function findURL(func) {
    if (func == null) return;
    if (typeof func == "string") return getURL(func);
    func = func.toString();
    var identityKey = crc.crc16(func).toString(16);
    var completePath = cache[identityKey];
    if (completePath != null) {
        return completePath;
    } else {
        for (var curBaseUrl in pathHolder) {
            var instancePaths = pathHolder[curBaseUrl];
            for (var curPath in instancePaths) {
                var curHandle = pathHolder[curBaseUrl][curPath];
                if (curHandle.toString() == func) {
                    completePath = curBaseUrl + curPath;
                    cache[identityKey] = completePath;
                    return completePath;
                }
            }
        }
    }
}

module.exports = {
    build,
    findURL
};