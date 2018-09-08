const argumentParser = require('./lib/argumentParser');
const paramChecker = require('./Checker');
const queryParser = require('../../lib/queryParser');
var argsStorage = {};

module.exports = function (req, res, prev) {
    return new Promise((resolve, reject)=>{
        var rawExec = this.$rawExecuter;
        var argList = prepareArgList(this.$eventName, rawExec);
        getDataFromRequest(req, (data)=>{
            var err = paramChecker(this.$eventName, rawExec, data);
            if(err!=null) reject(err)
            var standardInput =  resortDataIndex(data, argList);
            resolve(standardInput)
        });
    })
};

function prepareArgList(name, rawExec){
    var res = argsStorage[name];
    if(res==null){
        res = argumentParser(rawExec);
        argsStorage[name] = res;
    }
    return res;
}

function getDataFromRequest(req, onComplete){
    var data = {};
    var method = req.method;
    if(method=='GET' | method=='HEAD' | method=='DELETE'){
        data = getQueryData(req);
        onComplete(data);
    }
    else if(method=='POST' | method=='PUT'){
        getBodyData(req, onComplete);
    }
}

function getQueryData(req){
    return queryParser.getQuery(req.url);
}

async function getBodyData(req, onComplete){

    req.on('data', (chunk)=>{
        var data = chunk.toString();
    })
}

function getRestData(req){

}

function resortDataIndex(data, argList){
    var resortInput = [];
    argList.forEach(key=>{
        resortInput.push(data[key]);
    })

    return resortInput;
}