const argumentParser = require("./lib/argumentParser");
const queryParser = require("./lib/queryParser");
const multiPartParser = require("./lib/multipartParser");
const rawBodyParser = require("./lib/rawBodyParser");
const urlEncodedParser = require("./lib/urlEncodedParser");
var handleHolder = {};

function handle(req, res, prev) {
    return new Promise((resolve, reject) => {
        var eventName = this.$eventName;
        var paramParser = handleHolder[eventName];
        if(paramParser==null) paramParser = onCreate.call(this);
        paramParser(resolve, reject, req);
    });
};

function prepareHandle(eventName, argList) {
    var handle = function (resolve, reject, req) {
        getDataFromRequest(argList, req, (data, err) => {
            if (err != null) reject(err);
            var standardInput = resortDataIndex(data, argList);
            resolve(standardInput);
        });
    };


    handleHolder[eventName] = handle;
    return handle;
}

function onCreate(config) {
    var eventName = this.$eventName;
    var executer = this.$executer;
    var argList = argumentParser(executer.toString());
    return prepareHandle(eventName, argList)
}

function getDataFromRequest(argList, req, onComplete) {
    var method = req.method;
    if (!req.isREST) {
        if (isQueryParamType(method)) {
            getQueryData(req, onComplete);
        } else if (isBodyParamType(method)) {
            getBodyData(req, onComplete);
        }
    } else {
        getRestData(req, argList, onComplete);
    }
}

function getQueryData(req, onComplete) {
    var data = queryParser(req.url);
    onComplete(data);
}

function getBodyData(req, onComplete) {
    var reqBodyType = req.headers["content-type"];
    if (reqBodyType == null) {
        onComplete(null);
    } else if (reqBodyType == "application/x-www-form-urlencoded") {
        urlEncodedParser(req, onComplete)
    } else if (reqBodyType > "multipart" && reqBodyType < "multipart/z") {
        multiPartParser(req, onComplete);
    } else {
        rawBodyParser(req, onComplete)
    }
}

function getRestData(req, argList, onComplete) {
    var url = req.url;
    var eor = url.indexOf("?");
    if (eor == -1) eor = url.length;
    var param = url.substring(url.lastIndexOf("/") + 1, eor);
    var output = {};
    output[argList[0]] = param;
    var method = req.method;
    var customOnComplete = data => {
        Object.assign(output, data);
        onComplete(output);
    };
    if (isBodyParamType(method)) {
        getBodyData(req, customOnComplete);
    } else if (isQueryParamType(method)) {
        getQueryData(req, customOnComplete);
    }
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
    handle,
    global: true
}