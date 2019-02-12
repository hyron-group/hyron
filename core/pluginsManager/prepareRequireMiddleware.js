const {addAnonymousMiddleware} = require("./middlewareManager");

function parseRequireMiddleware(reqMidWare, isFontware) {

    var disableList = [];
    var enableList = [];
    var disableAll = false;


    for (var i = 0; i < reqMidWare.length; i++) {
        var middlewareMeta = reqMidWare[i];
        if (typeof middlewareMeta == "string") {
            // prepare disable global middleware by name
            if (middlewareMeta >= "!" && middlewareMeta < "\"") {
                var middlewareName = middlewareMeta.substr(1);
                var enableMiddlewareIndex = reqMidWare.indexOf(middlewareName);
                if (middlewareName == "*") {
                    disableAll = true;
                    break;
                } else if (enableMiddlewareIndex < i) {
                    disableList.push(middlewareName);
                }
            }
            // prepare enable middleware by name
            else enableList.push(middlewareMeta);
            // support embed middle handle in config
        } else if (typeof middlewareMeta == "function") {
            var representName = addAnonymousMiddleware(middlewareMeta, isFontware);
            enableList.push(representName);
        } else throw new TypeError(`middleware at ${i} should be a string name or function handle`)
    }

    return {
        disableList,
        enableList,
        disableAll
    }
}

module.exports = parseRequireMiddleware;