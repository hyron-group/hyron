const varReader = require("./lib/variableParser");
var supportedArgs = {
    $requestHeaders: "req.headers",
    $requestMethod: "req.method",
    $httpVersion: "req.httpVersion",
    $connection: "req.connection",
    $socket: "req.socket",
    $write: "req.write",
    $close:"req.close",
    $statusCode:"req.status",
    $setTimeout:"req.setTimeout",
    $statusMessage: "req.statusMessage",
    
};
var argsStorage = {};

module.exports = function(req, res, prev) {
    var argLoaderExec = prepareArgs(this.$eventName, this.$executer);
    Object.assign(this, argLoaderExec(req, res));
    return prev;
};

function prepareArgs(name, func){
    var argLoaderExec = argsStorage[name];
    if(argLoaderExec==null){
        argLoaderExec = getNeededArgs(func.toString());
        argsStorage[name] = argLoaderExec;
    }
    return argLoaderExec;
}

function getNeededArgs(rawFunc) {
    var reqArgs = varReader(rawFunc);
    var exec = "";
    reqArgs.forEach(key=>{
        val = supportedArgs[key];
        exec+=`${key}:${val},`;
    });
    exec = `(req, res)=>{return {${exec}}}`;
    return eval(exec);
}
