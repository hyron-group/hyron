const fs = require("fs");
const yaml = require("yaml");
const CONFIG_FILE_NAME = "appcfg.yaml";
const objectEditor = require("./objectEditor");

var appConfig = {};

function loadDefaultConfig() {
    readConfig(`./node_modules/hyron`);
    loadOrgzModulesConfig("./node_modules/@hyron");
    readConfig("./");
}

function referenceField(map) {
    function ref(obj, paths = []) {
        if (obj == null) return null;
        for (var key in obj) {
            var curPaths = paths.concat(key);
            var val = obj[key];
            if (typeof val == "string") {
                replaceSelfField(curPaths, val, map);
                importValue(curPaths, val, map);
            } else {
                ref(val, curPaths, map);
            }
            lockAssignValue(curPaths, map);
        }
        return map;
    }
    return ref(map);
}

function lockAssignValue(paths, map) {
    var key = paths[paths.length - 1];
    if (/\$[\w\d.\-]*/.test(key)) {
        objectEditor.replaceValue(
            paths.slice(0, paths.length - 1),
            map,
            childMap => {
                Object.freeze(childMap[key]);
            }
        );
    }
}

function importValue(paths, val, map) {
    var match;

    if ((match = /<~([\w\d\-./]+)>/g.exec(val))) {
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

function replaceSelfField(paths, val, map) {
    var match;

    if ((match = /<#([\w\d\-.]+)>/g.exec(val))) {
        var refPath = match[1];
        var refVal = objectEditor.getValue(refPath, map);
        objectEditor.replaceValue(paths, map, refVal);
    }
}

function loadOrgzModulesConfig(path) {
    var orgzModulesList = fs.readdirSync(path);
    if (orgzModulesList != null)
        orgzModulesList.forEach(moduleName => {
            try {
                readConfig(moduleName, path + "/" + moduleName);
            } catch (err) {
                console.error("cant load module " + moduleName);
            }
        });
}

function getConfig(path) {
    return objectEditor.getValue(path, appConfig);
}

function setConfig(cfg) {
    Object.assign(appConfig, cfg);
}

function readConfig(path, moduleName) {
    try {
        var pathStat = fs.statSync(path);
        if (pathStat.isFile()) {
            path = path.substr(0, path.lastIndexOf("\\"));
            readConfig(path, moduleName);
        } else if (pathStat.isDirectory()) {
            var files = fs.readdirSync(path);
            if (files.includes(CONFIG_FILE_NAME)) {
                var data = fs.readFileSync(path + "/" + CONFIG_FILE_NAME);
                var cfg = yaml.parse(data.toString());
                if (moduleName != null) {
                    var moduleCfg = {};
                    moduleCfg[moduleName] = cfg;
                    cfg = moduleCfg;
                }
                cfg = referenceField(cfg);
                Object.assign(appConfig, cfg);
            }
        }
    } catch (err) {}
}

loadDefaultConfig();

module.exports = {
    getConfig,
    readConfig,
    setConfig
};
