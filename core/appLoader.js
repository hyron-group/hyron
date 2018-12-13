const fs = require("fs");
const ModuleManager = require("./moduleManager");
const APP_CONFIG_FILE_PATH = "./hyron-app.json";

/**
 * [experiment]
 * This feature used to build project from .json config file, instead index.js (./hyron-app.json) with content the same index.js.
 * With this feature, we can easier to config & run app
 */

module.exports = function rebuildAppFromCfg() {
    try {
        var cfgData = require(APP_CONFIG_FILE_PATH);
        if (cfgData != null) {
            Object.keys(cfgData).forEach(baseURI => {
                var cfg = cfgData[baseURI];
                if (typeof cfg == "string") {
                    loadModuleConfigFile(baseURI, cfg);
                } else if (typeof cfg == "object") startModule(baseURI, cfg);
            });
        }
    } catch (err) {}
};
/* 
{
    fontware,
    backware,
    service,
    setting,
}
*/
function startModule(baseURI, config) {
    var instance = ModuleManager.getInstance(baseURI);
    instance.enableFontWare(config.fontware);
    instance.enableBackWare(config.backware);
    instance.enableService(config.service);
    instance.setting(config.setting);
    instance.startServer();
}
