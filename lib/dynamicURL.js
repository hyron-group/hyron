const indexOfText = require("./textIndexSearch");

const PARAMS_REG = /:([\w\d_+\-]+)/g;
const PATHS_REG = "([\\w\\d_+\\-]*)";
var urlHolder = {};

function getMatcher(url) {
    var match_reg = url.replace(PARAMS_REG, PATHS_REG);
    return new RegExp(match_reg);
}

function getParamsList(url) {
    var match;
    var paramsList = [];
    while ((match = PARAMS_REG.exec(url))) {
        paramsList.push(match[1]);
    }
    return paramsList;
}

function sortObject(obj) {
    var tmp = {};
    Object.keys(obj).sort().forEach((key) => {
        tmp[key] = obj[key];
    })

    return tmp;
}

function registerUrl(url) {
    // example : /user/:org/name/:class
    var indexOfParams = url.indexOf("/:");
    var staticUrl;
    if (indexOfParams == -1) return;

    staticUrl = url.substr(0, indexOfParams);

    if (urlHolder[staticUrl] == null) {
        urlHolder[staticUrl] = {};
        urlHolder = sortObject(urlHolder);
    }

    var urlSchema = {};
    urlSchema[url] = {
        matcher: getMatcher(url),
        params: getParamsList(url)
    };

    Object.assign(urlHolder[staticUrl], urlSchema);
    return staticUrl;
}

function getParams(url) {
    var keys = Object.keys(urlHolder);
    var staticPathIndex = -indexOfText(url, keys);
    if (staticPathIndex < 0) return;
    var staticRouterMeta = urlHolder[keys[staticPathIndex]];
    for (var eventName in staticRouterMeta) {
        var {
            matcher,
            params
        } = staticRouterMeta[eventName];

        var match;

        if ((match = matcher.exec(url))) {
            var data = {};
            for (var i = 0; i < params.length; i++) {
                var argsName = params[i];
                data[argsName] = match[i + 1];
            }
            return data;
        }
    }
}

function getEventName(url) {
    var keys = Object.keys(urlHolder);
    var staticPathIndex = -indexOfText(url, keys);
    if (staticPathIndex < 0) return;
    var staticRouterMeta = urlHolder[keys[staticPathIndex]];
    for (var eventName in staticRouterMeta) {
        var {
            matcher,
        } = staticRouterMeta[eventName];

        if (matcher.test(url)) {
            return eventName;
        }
    }
}

module.exports = {
    registerUrl,
    getEventName,
    getParams
};