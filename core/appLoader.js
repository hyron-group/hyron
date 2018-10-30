const fs = require("fs");
const ModuleManager = require("./moduleManager");
const APP_CONFIG_FILE_PATH = "./hyron-app.json";
const SERVICE_CONFIG_FILE_NAME = "./hyron-service.json";

rebuildAppFromCfg();

function rebuildAppFromCfg() {
    try {
        var cfgData = fs.readFileSync(APP_CONFIG_FILE_PATH).toString();
        cfgData = JSON.parse(cfgData);
        console.log(cfgData);
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

function loadModuleConfigFile(baseURI, path) {
    try {
        fs.readFile(`${path}/${SERVICE_CONFIG_FILE_NAME}`, (err, data) => {
            startModule(baseURI, data);
        });
    } catch (err) {
        try {
            require(path);
        } catch (err) {}
    }
}
/* 
{
    module,
    fontware,
    backware,
    service,
    setting,
}
*/
function startModule(baseURI, config) {
    startWithHyronCore(baseURI, config);
    startWithoutHyronCore(baseURI, config);
}

function startWithoutHyronCore(baseURI, config) {
    var freeModule = config.module;
    if (typeof freeModule == "object") {
        Object.keys(freeModule).forEach(name => {
            try {
                var handle = require(freeModule[name]);
                if (typeof handle == "function") {
                    handle(baseURI);
                }
            } catch (err) {
                console.log(`can't start module '${name}'`);
            }
        });
    }
}

function startWithHyronCore(baseURI, config) {
    var serviceList = {};
    var instance = ModuleManager.getInstance(baseURI);
    if (config.service != null) {
        Object.keys(config.service).forEach(router => {
            var routerHandle = require(config[router]);
            serviceList[router] = routerHandle;
        });
        instance.enableService(serviceList);
    }
    instance.enableFontWare(config.fontware);
    instance.enableBackWare(config.backware);
    instance.setting(config.setting);
    instance.startServer();
}
