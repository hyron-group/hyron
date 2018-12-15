const stringToObject = require("../../../lib/objectParser");

function getQuery(rawUrl) {
    var queryBuffer = [];
    var query = {};
    var separateIndex = rawUrl.indexOf("?");
    if (separateIndex != -1) {
        queryBuffer = decodeURI(rawUrl.substr(separateIndex + 1)).split("&");
        queryBuffer.forEach(entry => {
            var pairSeparate = entry.indexOf("=");
            var key = entry.substr(0, pairSeparate);
            var val = entry.substr(pairSeparate + 1);
            query[key] = stringToObject(val);
        });
    }

    return query;
}

module.exports = getQuery;