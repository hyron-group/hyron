const homeDir = require("../lib/homeDir");
const nodePath = require("path");
const configReader = require("../core/configReader");
const fs = require("fs");


function loadInstalledModule(modulePath, cb) {
    var location = nodePath.join(homeDir, "./node_modules", modulePath);
    try {
        var data = require(modulePath);
        cb(null, data, location);
    } catch (err) {
        cb(err, null, location);
    }
}

function loadLocalModule(modulePath, cb) {
    var location = nodePath.join(homeDir, modulePath);
    try {
        var data = require(location);
        cb(null, data, location);
    } catch (err) {
        cb(err, null, location);
    }
}

function loadModuleByPath(path, moduleName) {
    var output;
    var location;

    loadLocalModule(path, (err, data, modulePath) => {
        output = data;
        location = modulePath;
        if (err != null) {
            loadInstalledModule(path, (err, data, modulePath) => {
                output = data;
                location = modulePath;
                if (err != null) {
                    throw err;
                }
            });
        }
    })

    configReader.loadConfig(location, moduleName);
    return output;
}


module.exports = loadModuleByPath;