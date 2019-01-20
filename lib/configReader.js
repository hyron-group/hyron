const fs = require("fs");
const yaml = require("yaml");
const CONFIG_FILE_NAME = "appcfg.yaml";
const objectEditor = require('./objectEditor');

var appConfig = {};


function loadDefaultConfig() {
    readConfig(`./node_modules/hyron`);
    readConfig("./");
    // loadOrgzModulesConfig();
}

function referenceField(map) {
    function ref(obj, paths = []) {
        if (obj == null) return null;
        for (var key in obj) {
            var curPaths = paths.concat(key);
            var val = obj[key];
            if (typeof val == "object") {
                ref(val, curPaths, map);
                lockAssignValue(curPaths, map);
            } else {
                replaceSelfField(curPaths, val, map);
            }
        }
        return map;
    }
    return ref(map);
}


function lockAssignValue(paths, map) {
    var match;

    var key = paths[paths.length-1];
    if ((match = /\$[\w\d.\-]*/.exec(key))) {
        console.log('locked');
        console.log(paths);
        objectEditor.replaceValue(
            paths,
            map,
            (childMap) => {
                Object.freeze(childMap);
            })

    }
}

function replaceSelfField(paths, val, map) {
    var match;

    if ((match = /<#([\w\d\-.]+)>/.exec(val))) {
        var refPath = match[1];
        var refVal = objectEditor.getValue(refPath, map);
        objectEditor.replaceValue(paths, map, refVal);
    }
}

function loadOrgzModulesConfig() {
    var orgzModulesList = fs.readdirSync("node_modules/@hyron");
    if (orgzModulesList != null)
        orgzModulesList.forEach((moduleName) => {
            try {
                readConfig(moduleName, `node_modules/@hyron/${moduleName}`);
            } catch (err) {
                console.error('cant load module ' + moduleName);
            }
        })
}

function getConfig(moduleName) {
    return appConfig[moduleName];
}

function readConfig(path, moduleName) {
    try {
        var files = fs.readdirSync(path);
        if (files.includes(CONFIG_FILE_NAME)) {
            var data = fs.readFileSync(path + '/' + CONFIG_FILE_NAME);
            var cfg = yaml.parse(data.toString());
            cfg = referenceField(cfg);
            if (moduleName != null) {
                appConfig[moduleName] = cfg;
            } else {
                Object.assign(
                    appConfig,
                    cfg
                )
            }
        }
    } catch (err) {}
}

loadDefaultConfig();
console.log("result : ")
console.log(appConfig);

module.exports = {
    getConfig,
    readConfig
};