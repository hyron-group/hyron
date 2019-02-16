const homeDir = require("../lib/homeDir");
const nodePath = require("path");
const configReader = require("../core/configReader");

function loadModule(modulePath) {
    try {
        var module = require(modulePath);
        return {
            module,
            path: modulePath
        };
    } catch (err) {
        if(!err.message.endsWith(`'${modulePath}'`)){
            throw err;
        }
        return null;
    }
}

function loadModuleByPath(path, moduleName) {

    var package =
        loadModule(nodePath.join(homeDir, path)) ||
        loadModule(nodePath.join(homeDir, "node_modules/", path)) ||
        loadModule(nodePath.join(homeDir, "node_modules/@hyron", path)) ||
        loadModule(nodePath.join(homeDir, "node_modules/hyron", path));

    if (package == null){
        throw new Error(`Cannot find module '${moduleName}'`);
    }
    configReader.loadConfig(package.path, moduleName);
    return package.module;

}


module.exports = loadModuleByPath;