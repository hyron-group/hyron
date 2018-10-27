const fs = require("fs");
const ModuleManager = require("./moduleManager");
const SERVICE_CONFIG_FILE_PATH = "./hyron-app.json";

rebuildAppFromCfg();

function rebuildAppFromCfg() {
    try {
        var cfgData = fs.readFileSync(SERVICE_CONFIG_FILE_PATH).toString();
        cfgData = JSON.parse(cfgData);
        console.log(cfgData);
        if (cfgData != null) {
            Object.keys(cfgData).forEach(baseURI => {
                startModule(baseURI, cfgData[baseURI]);
                console.log(baseURI);
            });
        }
    } catch (err) {}
}

function startModule(baseURI, config) {
    var instance = ModuleManager.getInstance(baseURI);
    loadMiddleware(instance);
    loadService(instance);
    instance.setting(config.setting);
    instance.startServer(config.onStartServer);
}

function loadMiddleware(instance) {
    instance.enableFontWare(config.fontware);
    instance.enableBackWare(config.backware);
}

function loadService() {
    if (config.service.path != null) {
        instance.enableService(require(config.service.path));
    }
}
