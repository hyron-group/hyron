const argumentParser = require("./lib/argumentParser");
const Checker = require("./Checker");
const queryParser = require("../../lib/queryParser");
const ModuleManager = require("../../core/moduleManager");
const multiPartParser = require("./lib/multipartParser");

var argsStorage = {};

module.exports = function(req) {
    return new Promise((resolve, reject) => {
        var executer = this.$executer;
        Checker.registerChecker(this.$eventName, executer);
        var argList = prepareArgList(this.$eventName, executer);
        getDataFromRequest(argList, req, data => {
            var err = Checker.checkData(this.$eventName, data);
            if (err != null) reject(err);
            var standardInput = resortDataIndex(data, argList);
            resolve(standardInput);
        });
    });
};

function prepareArgList(name, func) {
    var res = argsStorage[name];
    if (res == null) {
        res = argumentParser(func.toString());
        argsStorage[name] = res;
    }
    return res;
}

function getDataFromRequest(argList, req, onComplete) {
    var method = req.method;
    if ((method == "GET") | (method == "HEAD") | (method == "DELETE")) {
        getQueryData(req, onComplete);
    } else if ((method == "POST") | (method == "PUT")) {
        getBodyData(argList, req, onComplete);
    } else if (ModuleManager.getConfig("enableRESTFul")) {
        getRestData(req, argList[0], onComplete);
    }
}

function getQueryData(req, onComplete) {
    var data = queryParser.getQuery(req.url);
    onComplete(data);
}

function getBodyData(argList, req, onComplete) {
    req.on("data", chunk => {
        var reqBodyType = req.headers["content-type"];
        var data = handingDataType(argList, reqBodyType, chunk);
        onComplete(data);
    });
}

function handingDataType(argList, reqBodyType, chunk) {
    if (reqBodyType == "application/x-www-form-urlencoded") {
        return queryParser.getQuery('?'+chunk.toString());
    } else if (reqBodyType.startsWith("multipart/form-data")) {
        return multiPartParser(chunk);
    } else {
        var output = {};
        var paramName = argList[0];
        output[paramName] = chunk;
        return output;
    }
}

function getRestData(req, argName, onComplete) {
    var url = req.url;
    var res = url.substr(url.lastIndexOf("/"));
    var output = {};
    output[argName] = res;
    onComplete(output);
}

function resortDataIndex(data, argList) {
    if (data == null) return data;
    var resortInput = [];
    argList.forEach(key => {
        resortInput.push(data[key]);
    });

    return resortInput;
}
