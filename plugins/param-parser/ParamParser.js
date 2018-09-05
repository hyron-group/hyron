const argumentParser = require('./lib/argumentParser');
const paramChecker = require('./Checker');
const cache = require('static-memory');
const queryParser = require('../../lib/queryParser');
const eventStorage = {}

module.exports = function (req, res, prev) {
    return new Promise(resolve=>{
        var rawExec = this.$rawExecuter;
        var argList = cache(this.$eventName, argumentParser(rawExec));
        getDataFromRequest(req, (data)=>{
            paramChecker(this.$eventName, rawExec, data);
            var standardInput =  resortDataIndex(data, argList);
            resolve(standardInput)
        });
    })
};

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