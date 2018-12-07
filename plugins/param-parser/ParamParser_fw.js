const argumentParser = require("./lib/argumentParser");
const Checker = require("./Checker");
const queryParser = require("./lib/queryParser");
const multiPartParser = require("./lib/multipartParser");
const rawBodyParser = require("./lib/rawBodyParser");
const urlEncodedParser = require("./lib/urlEncodedParser");
const argsHolder = {};
var handleHolder = {};

module.exports = function(req, res, prev) {
    return new Promise((resolve, reject) => {
        var executer = this.$executer;
        var eventName = this.$eventName;
        var handle = prepareHandle(eventName, executer);
        this.$args = argsHolder[eventName];
        handle(resolve, reject, req);
    });
};

function prepareHandle(eventName, executer) {
    var handle = handleHolder[eventName];
    if (handle != null) {
        return handle;
    }

    Checker.registerChecker(eventName, executer);
    var argList = argumentParser(executer.toString());
    argsHolder[eventName] = argList;
    var handle = `(resolve, reject, req)=>{
        var argList = ${JSON.stringify(argList)};
        getDataFromRequest(argList, req, (data, err) => {
            if (err != null) reject(err);
            err = Checker.checkData(eventName, data);
            if (err != null) reject(err);
            var standardInput = resortDataIndex(data, argList);
            resolve(standardInput);
        });
    }`;

    handle = eval(handle);
    handleHolder[eventName] = handle;

    return handle;
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
    } else if (reqBodyType.startsWith("multipart")) {
        multiPartParser(req, onComplete);
    } else {
        rawBodyParser(req, onComplete)
    }
}

function getRestData(req, argList, onComplete) {
    var url = req.url;
    var eor = url.indexOf("?");
    if(eor==-1)eor = url.length;
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
    return (method == "POST") | (method == "PUT") | (method == "PATCH");
}

function isQueryParamType(method) {
    return (method == "GET") | (method == "DELETE") | (method == "HEAD");
}

function resortDataIndex(data, argList) {
    if (data == null) return data;
    var resortInput = [];
    argList.forEach(key => {
        resortInput.push(data[key]);
    });

    return resortInput;
}
