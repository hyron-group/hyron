const ModuleManager = require("./ModulesManager");
const PluginsManager = require("./PluginsManager");
const AddonsManager = require("./AddonsManager");
const loadModuleByPath = require("../lib/moduleLoader");


function loadGlobalAddons(){
    var addonsList = ModuleManager.getConfig("addons");
    if(addonsList!=null) {
        for(var name in addonsList){
            var modulePath = addonsList[name];
            var config = ModuleManager.getConfig(name);
            handler = loadModuleByPath(modulePath, name);
            AddonsManager.registerGlobalAddons(name, handler, config);
        }
    }
}

function loadGlobalPlugins(){
    var pluginsList = ModuleManager.getConfig("plugins");
    if(pluginsList!=null) {
        for(var name in pluginsList){
            var modulePath = pluginsList[name];
            var config = ModuleManager.getConfig(name);
            pluginsMeta = loadModuleByPath(modulePath, name);
            PluginsManager.addMiddleware(name, pluginsMeta, config)
        }
    }
}

function run() {
    loadGlobalAddons();
    loadGlobalPlugins();
};

module.exports = run;