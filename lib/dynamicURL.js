const indexOfText = require('./textIndexSearch');

const pathParamReg = /:([\w\d]+)\/?/g;
var urlHolders = [];
var paramsHolder = [];

var dynamicURL = {

    registerUrl(url) {
        // example : /user/:org/:name/:class
        var indexOfParams = url.indexOf('/:');
        var paramList = [];
        var staticUrl;
        if (indexOfParams != -1) {
            var match;
            while (match = pathParamReg.exec(url)) {
                paramList.push(match[1]);
            }
            staticUrl = url.substr(0, url.indexOf(':') - 1);
        } else {
            return;
        }

        var sortedIndex = -indexOfText(staticUrl, urlHolders);
        urlHolders.splice(sortedIndex, 0, staticUrl);
        paramsHolder.splice(sortedIndex, 0, paramList);

        return staticUrl;
    },

    getParams(url) {
        var indexOfStaticUrl = indexOfText(url, urlHolders);
        if (indexOfStaticUrl < 0) return;
        var staticURL = urlHolders[indexOfStaticUrl];
        var paramsName = paramsHolder[indexOfStaticUrl];

        var paramsValue = url.substr(staticURL.length + 2).split("/");

        if (paramsValue.length != paramsName.length) {
            throw new HTTPMessage(
                404, // not found
                `Can't find router at ${url}`
            );
        }

        var data = {};
        for (var i = 0; i < paramsName.length; i++) {
            data[paramsName[i]] = paramsValue[i];
        }
        return data;
    },

    getEventName(url) {
        var indexOfStaticUrl = indexOfText(url, urlHolders);
        if (indexOfStaticUrl < 0) return null;
        return "/" + urlHolders[indexOfStaticUrl];
    }
}

module.exports = dynamicURL;