const argumentParser = require("../lib/argumentParser");
const generalParserHandler = require("./extractor");

var parserHolder = {};

function handle(req, res, prev = {}) {
    return new Promise((resolve) => {
        var eventName = this.$eventName;
        var paramParser = parserHolder[eventName];
        paramParser(req, res, prev, (data) => {
            resolve(data);
        });
    });
}

function checkout() {
    var eventName = this.$eventName;
    return parserHolder[eventName] == null;
}

function onCreate() {
    var eventName = this.$eventName;
    var executer = this.$executer;
    var reqCfg = this.$requestConfig;
    var argList = argumentParser(executer.toString());
    var handler = generalParserHandler(reqCfg, argList);
    parserHolder[eventName] = handler;
}

module.exports = {
    onCreate,
    checkout,
    handle,
    global: true
}