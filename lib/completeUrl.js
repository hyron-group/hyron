const codeStyle = require("./codeStyle");

function prepareEventName(style, customPath, ...childRoute) {
    if (customPath == null) {
        return buildRouteName(style, childRoute);
    } else {
        return buildRouteName(style, customPath);
    }
}

function buildRouteName(style, childRoute) {
    var uri = "";
    var styledUri = "";
    childRoute.forEach(routeName => {
        if (routeName != null && routeName != "") {
            styledUri += routeName + "/";
        }
    });
    if (style != null) {
        var beforeName = styledUri;
        styledUri = codeStyle(style, styledUri);
        if (styledUri == null) {
            styledUri = beforeName;
        }
    }
    uri += styledUri;
    uri = uri.substr(0, uri.length - 1);
    var styledUri;
    return uri;
}

function getBaseURL(serverCfg) {
    var {
        protocol,
        port,
        host,
        prefix
    } = serverCfg;
    var baseURL = `${protocol}://${host}`;
    if (port != null) {
        baseURL += `:${port}`;
    }
    if (prefix != null) {
        baseURL += `/${prefix}`;
    }
    return baseURL;
}

module.exports = {
    prepareEventName,
    getBaseURL
};