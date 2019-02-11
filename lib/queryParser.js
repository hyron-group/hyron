var URI_REG = /(([\w\d]+):\/\/([\w\d._\-:]+))?([\w\d._\-/:]+)[?]?/;
function parseURI(path) {
    var match = URI_REG.exec(path);
    var baseURI = match[3];
    var router = match[4];
    return { baseURI, router };
}

function getUriPath(rawUrl) {
    var separateIndex = rawUrl.indexOf("?");
    if (separateIndex == -1) return rawUrl;

    var url = rawUrl.substr(0, separateIndex);
    return url;
}

function getRouter(rawUrl) {
    var separateIndex = rawUrl.indexOf("?");
    if (separateIndex == -1) separateIndex = rawUrl.length;
    var lastRouterIndex = url.lastIndexOf("/");

    var route = rawUrl.substr(lastRouterIndex + 1, separateIndex);
    return route;
}

module.exports = {
    parseURI,
    getRouter,
    getUriPath
};
