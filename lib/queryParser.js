const stringToObject = require("./objectParser.js");

//TODO : need optimize performance
function getUriPath(rawUrl) {
    var separateIndex = rawUrl.indexOf("?");
    if (separateIndex == -1) return rawUrl;

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
    var queryBuffer = [];
    var separateIndex = rawUrl.indexOf("?");
    if (separateIndex != -1){
        queryBuffer = rawUrl
        .substr(separateIndex + 1)
        .replace("%20", " ")
        .split("&");
    }
    
    var query = {};
    queryBuffer.forEach(entry => {
        var pairSeparate = entry.indexOf("=");
        var key = entry.substr(0, pairSeparate);
        var val = entry.substr(pairSeparate + 1);
        query[key] = stringToObject(val);
    });

    return query;
}

module.exports = {
    getRouter,
    getQuery,
    getUriPath
};
