var ViewEngine;
const HTTPMessage = require("../../type/HttpMessage");
const StatusCode = require("../../type/StatusCode");

initEngine();

module.exports = (req, res, result) => {
    if (typeof result == "object") {
        var renderConfig = result.$render;
        if (typeof renderConfig == "object") {
            var path = renderConfig.path;
            var data = renderConfig.data;
            ViewEngine(path, data, res);
        }
    }
    return result;
};

function initEngine() {
    var viewConfig = require("../../core/moduleManager").getConfig(
        "view-loader"
    );
    if (viewConfig == null) return;
    var viewEngineName = viewConfig.engine;
    var homeDir = viewConfig.homeDir;
    if (viewEngineName != null)
        try {
            var compileView = require("./engine/" + viewEngineName);
            ViewEngine = compileView(homeDir);
        } catch (err) {
            ViewEngine = () => {
                throw new HTTPMessage(
                    StatusCode.INTERNAL_SERVER_ERROR,
                    "Can't render this view"
                );
            };
            console.log(
                `[warning] Can't load engine ${viewEngineName} because ${
                    err.message
                }`
            );
        }
}
