const argumentParser = require("./lib/argumentParser");
const queryParser = require("./lib/queryParser");
const multiPartParser = require("./lib/multipartParser");
const rawBodyParser = require("./lib/rawBodyParser");
const urlEncodedParser = require("./lib/urlEncodedParser");
const dynamicUrl = require('../../lib/dynamicURL');
const cookie = require('cookie');

var parserHolder = {};

function handle(req, res, prev) {
    return new Promise((resolve, reject) => {
        var eventName = this.$eventName;
        var paramParser = parserHolder[eventName];
        paramParser(resolve, reject, req);
    });
};

function prepareHandle(eventName, argList) {
    var handle = function (resolve, reject, req) {
        getDataFromRequest(req, argList, (data, err) => {
            if (err != null) reject(err);
            var standardInput = resortDataIndex(data, argList);
            resolve(standardInput);
        });
    };


    parserHolder[eventName] = handle;
    return handle;
}

function checkout() {
    var eventName = this.$eventName;
    console.log(parserHolder);
    return parserHolder[eventName] == null;
}

function onCreate() {
    console.log('onCreate');
    var eventName = this.$eventName;
    var executer = this.$executer;
    var argList = argumentParser(executer.toString());
    var handler = prepareHandle(eventName, argList);
    parserHolder[eventName] = handler;
    console.log(parserHolder[eventName])
}

function getParamWrapper(req, argsList, onComplete) {

}

function getDataFromRequest(req, argsList, onComplete) {
    var method = req.method;
    var result = getQueryData(req);

    var cookie = getCookieData(req);
    if (cookie != null) Object.assign(result, cookie);

    if (req.isREST) {
        var restData = getRestData(req, onComplete);
        Object.assign(result, restData);
    }

    if (isBodyParamType(method)) {
        onComplete = (data) => {
            Object.assign(result);
            onComplete(data);
        };
        getBodyData(req, onComplete);
    } else onComplete(result);
}

function getCookieData(req) {
    var reqCookies = req.headers.cookie;
    if (reqCookies == null) return;
    var $cookie = cookie.parse(reqCookies);
    return {
        $cookie
    };
}

function getQueryData(req) {
    return queryParser(req.url);
}

function getBodyData(req, onComplete) {
    var reqBodyType = req.headers["content-type"];
    if (reqBodyType == null) {
        onComplete(null);
    } else if (reqBodyType == "application/x-www-form-urlencoded") {
        urlEncodedParser(req, onComplete)
    } else if (reqBodyType >= "multipart" && reqBodyType < "multipart/z") {
        multiPartParser(req, onComplete);
    } else {
        rawBodyParser(req, onComplete)
    }
}

function getRestData(req) {
    var url = req.url;
    var eor = url.indexOf("?");
    if (eor == -1) eor = url.length;
    var output = dynamicUrl.getParams(url.substr(0, eor));
    return output;
}

function isBodyParamType(method) {
    return (method == "POST") || (method == "PUT") || (method == "PATCH");
}

function isQueryParamType(method) {
    return (method == "GET") || (method == "DELETE") || (method == "HEAD");
}

function resortDataIndex(data, argList) {
    if (data == null) return data;
    var resortInput = [];
    argList.forEach(key => {
        resortInput.push(data[key]);
    });

    return resortInput;
}

module.exports = {
    onCreate,
    checkout,
    handle,
    global: true
}