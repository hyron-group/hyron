const varReader = require("./lib/variableParser");

module.exports = function(req, res, prev) {};

function getNeededArgs(rawFunc) {
    var reqArgs = varReader(rawFunc);
    var supportedArgs = {
        "$headers" : "req.headers",
        ""
    }
}
