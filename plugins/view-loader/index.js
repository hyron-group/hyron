var ViewEngine;

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
};

function initEngine() {
    var viewConfig = require("../../core/moduleManager").getConfig(
        "view-loader"
    );
    if (viewConfig == null) return;
    var viewEngineName = viewConfig.engine;
    var homeDir = viewConfig.homeDir;
    var compileView = require("./engine/" + viewEngineName);
    ViewEngine = compileView(homeDir);
}
