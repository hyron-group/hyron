const stringToObject = require("./objectParser.js");

//TODO : need optimize performance
function getUriPath(rawUrl) {
    var separateIndex = rawUrl.indexOf("?");
    if ((separateIndex == -1)) separateIndex = rawUrl.length;

    var url = rawUrl.substr(0, separateIndex);
    return url;
}

function getRouter(rawUrl){
  var separateIndex = rawUrl.indexOf("?");
  if ((separateIndex == -1)) separateIndex = rawUrl.length;
  var lastRouterIndex = url.lastIndexOf("/");

  var route = rawUrl.substr(lastRouterIndex + 1, separateIndex);
  return route;
}

function getQuery(rawUrl) {
    var separateIndex = rawUrl.indexOf("?");
    if ((separateIndex == -1)) separateIndex = rawUrl.length;

    var queryBuffer = rawUrl
        .substr(separateIndex + 1, rawUrl.length)
        .replace("%20", " ")
        .split("&");
    var query = {};
    for (var i = 0; i < queryBuffer.length; i++) {
        var entry = queryBuffer[i];

        var pairSeparate = entry.indexOf("=");
        var key = entry.substr(0, pairSeparate);
        var val = entry.substr(pairSeparate + 1, entry.length);
        query[key] = stringToObject(val);
    }

    return query;
}

module.exports = {
    getRouter,
    getQuery,
    getUriPath
};
