const fs = require("fs");
const ModuleManager = require("./moduleManager");
const APP_CONFIG_FILE_PATH = "./hyron-app.json";

rebuildAppFromCfg();

function rebuildAppFromCfg() {
    try {
        var cfgData = require(APP_CONFIG_FILE_PATH);
        if (cfgData != null) {
            Object.keys(cfgData).forEach(baseURI => {
                var cfg = cfgData[baseURI];
                if (typeof cfg == "string") {
                    loadModuleConfigFile(baseURI, cfg);
                } else if (typeof cfg == "object") startModule(baseURI, cfg);
                console.log(baseURI);
            });
        }
    } catch (err) {}
}
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
