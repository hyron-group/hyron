const ModuleManager = require("./ModulesManager");
const PluginsManager = require("./PluginsManager");
const AddonsManager = require("./AddonsManager");
const loadModuleByPath = require("../lib/moduleLoader");


function loadGlobalAddons(){
    var addonsList = ModuleManager.getConfig("addons");
    if(addonsList!=null) {
        for(let name in addonsList){
            var modulePath = addonsList[name];
            var config = ModuleManager.getConfig(name);
            var handler = loadModuleByPath(modulePath, name);
            AddonsManager.registerGlobalAddons(name, handler, config);
        }
    }
}

function loadGlobalPlugins(){
    var pluginsList = ModuleManager.getConfig("plugins");
    if(pluginsList!=null) {
        for(let name in pluginsList){
            let modulePath = pluginsList[name];
            let config = ModuleManager.getConfig(name);
            let pluginsMeta = loadModuleByPath(modulePath, name);
            PluginsManager.addMiddleware(name, pluginsMeta, config);
        }
    }

    var fontwareList = ModuleManager.getConfig("fontware");
    if(fontwareList!=null) {
        for(let name in fontwareList){
            let modulePath = fontwareList[name];
            let config = ModuleManager.getConfig(name);
            let pluginsMeta = loadModuleByPath(modulePath, name);
            PluginsManager.addMiddleware(name, pluginsMeta, config, true);
        }
    }

    var backwareList = ModuleManager.getConfig("backware");
    if(backwareList!=null) {
        for(let name in backwareList){
            let modulePath = backwareList[name];
            let config = ModuleManager.getConfig(name);
            let pluginsMeta = loadModuleByPath(modulePath, name);
            PluginsManager.addMiddleware(name, pluginsMeta, config, false);
        }
    }
}

function run() {
    loadGlobalAddons();
    loadGlobalPlugins();
}

module.exports = run;