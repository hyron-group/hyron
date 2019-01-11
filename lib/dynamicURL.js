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
        if (indexOfStaticUrl == null) return;
        var staticURL = urlHolders[indexOfStaticUrl];
        var paramsName = paramsHolder[indexOfStaticUrl];

        var paramsValue = url.substr(staticURL.length+2).split("/");

        var data = {};
        for (var i = 0; i < paramsName.length; i++) {
            data[paramsName[i]] = paramsValue[i];
        }
        return data;
    },

    getEventName(url) {
        var indexOfStaticUrl = indexOfText(url, urlHolders);
        if (indexOfStaticUrl < 0) return null;
        return "/"+urlHolders[indexOfStaticUrl];
    }
}

function indexOfText(str, array) {
    var index = Math.floor(array.length / 2);
    var round = Math.log2(array.length);
    for (var i = 0; i < round; i++) {
        var curText = array[index];
        var nextEndChar = String.fromCharCode(curText.charCodeAt(curText.length - 1) + 1);
        var textSpace = editCharInText(curText, curText.length, nextEndChar);

        if (str >= curText && str < textSpace) {
            return index;
        } else if (curText < str) {
            index = Math.floor(index + array.length) / 2;
        } else {
            index = Math.floor(index/2);
        }
    }

    return -index;
}

function editCharInText(str, index, char) {
    return str.substr(0, index - 1) + char + str.substr(index);
}

module.exports = dynamicURL;