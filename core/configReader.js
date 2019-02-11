const fs = require("fs");
const yaml = require("yaml");
const CONFIG_FILE_NAME = "appcfg.yaml";
const objectEditor = require("../lib/objectEditor");

const INHERIT_REG = /\$[\w\d.\-]*/;
const SELF_REF_REG = /<#([\w\d\-.]+)>/g;
const FOREIGN_REF_REG = /<~([\w\d\-./]+)>/g;

var appConfig = {};

function replaceSelfField(paths, val, map) {
    var match;

    if ((match = SELF_REF_REG.exec(val))) {
        var refPath = match[1];
        var refVal = objectEditor.getValue(refPath, map);
        objectEditor.replaceValue(paths, map, refVal);
    }
}

function importValue(paths, val, map) {
    var match;

    if ((match = FOREIGN_REF_REG.exec(val))) {
        var importLocal = match[1];
        var fileContent = fs.readFileSync(importLocal).toString();
        var importContent;
        try {
            importContent = JSON.parse(fileContent);
        } catch {
            importContent = fileContent;
        }
        objectEditor.replaceValue(paths, map, importContent);
    }
}

function inheritValue(paths, map) {
    var key = paths[paths.length - 1];
    var allowedInherit = true;
    if (INHERIT_REG.test(key)) {
        allowedInherit = false;
    }
    objectEditor.replaceValue(
        paths.slice(0, paths.length - 1),
        map,
        (entry) => {
            if (!allowedInherit) {
                try {
                    var isExist = objectEditor
                        .getValue(paths, appConfig) != null;

                    if (isExist) {
                        delete entry[key];
                    }
                } catch (err) {

                }
            }
        }
    );
}

function parseConfig(map) {
    function startParser(obj, paths = []) {
        if (obj == null) {
            return null;
        }
        for (var key in obj) {
            var curPaths = paths.concat(key);
            var val = obj[key];
            if (typeof val == "string") {
                replaceSelfField(curPaths, val, map);
                importValue(curPaths, val, map);
            } else {
                startParser(val, curPaths, map);
            }
            inheritValue(curPaths, map);
        }
        return map;
    }
    return startParser(map);
}

function getConfig(path) {
    return objectEditor.getValue(path, appConfig);
}

function setConfig(cfg) {
    Object.assign(appConfig, cfg);
}

function loadConfigFromModule(path, moduleName) {
    var files = fs.readdirSync(path);
    if (files.includes(CONFIG_FILE_NAME)) {
        var data = fs.readFileSync(path + "/" + CONFIG_FILE_NAME);
        var cfg = yaml.parse(data.toString());
        if (moduleName != null) {
            var moduleConfig = {};
            moduleConfig[moduleName] = cfg;
            cfg = moduleConfig;
        }
        cfg = parseConfig(cfg);
        if (moduleName != null) {
            objectEditor.replaceValue(
                [moduleName],
                appConfig,
                (entry) => {
                    Object.assign(entry, cfg[moduleName]);
                });
        } else {
            Object.assign(appConfig, cfg);
        }
    }
}

function loadConfig(path, moduleName) {
    try {
        var pathStat = fs.statSync(path);
        if (pathStat.isFile()) {
            path = path.substr(0, path.lastIndexOf("\\"));
            loadConfig(path, moduleName);
        } else if (pathStat.isDirectory()) {
            loadConfigFromModule(path, moduleName)
        }
    } catch (err) {
        // console.error(err.message)
        // skip if file not exist
    }
}

function loadOrganizationModulesConfig(path) {
    try {
        var orgzModulesList = fs.readdirSync(path);
        if (orgzModulesList != null) {
            orgzModulesList.forEach((moduleName) => {
                try {
                    loadConfig(moduleName, path + "/" + moduleName);
                } catch (err) {
                    console.error("cant load module " + moduleName);
                }
            });
        }
    } catch (err) {
        // console.error(err.message)
    }
}

(function loadDefaultConfig() {
    loadConfig("./node_modules/hyron");
    loadOrganizationModulesConfig("./node_modules/@hyron");
    loadConfig("./");
})();

module.exports = {
    getConfig,
    loadConfig,
    setConfig
};