const fs = require("fs");
const yaml = require("yaml");
const CONFIG_FILE_NAME = "appcfg.yaml";

var appConfig = {};

function loadConfigFile(path) {
    try {
        var data = fs.readFileSync(path).toString();
        data = yaml.parse(data);
        return data;
    } catch (e) {
        return {};
    }
}

function loadDefaultConfig() {
    config = {
        ...loadConfigFile(`node_modules/hyron/${CONFIG_FILE_NAME}`),
        ...loadConfigFile(CONFIG_FILE_NAME),
        ...loadOrgzModulesConfig(config)
    }
}

function getReferValue(path, map) {
    var result = map;
    var steps = path.split('.');
    if (steps != null) {
        steps.forEach((fieldName) => {
            result = result[fieldName];
        })
    }
    return result;
}

function referenceField(moduleCfg) {
    if (moduleCfg == null) return null;
    for (var key in moduleCfg) {
        var val = moduleCfg[key];
        overrideParentValue(key, val, moduleCfg);
        replaceSelfField(key, val, moduleCfg)
    }
    return moduleCfg;
}


function overrideParentValue(key, val, map) {
    var match;

    if ((match = /$([\w\d]*)/.exec(key))) {
        var relKey = match[1];
        delete map[key];
        if (parent[relKey] != null) {
            map[relKey] = appConfig[relKey];
        } else {
            map[relKey] = val;
        }
    }
}

function replaceSelfField(key, val, map) {
    var match;

    if ((match = /<#([\w\d\-.]+)>/.exec(val))) {
        var refPath = match[1];
        var refVal = getReferValue(refPath, map);
        map[key] = refVal;
    }
}

function loadOrgzModulesConfig() {
    var orgzModulesList = fs.readdirSync("node_modules/@hyron");
    if(orgzModulesList!=null)
    orgzModulesList.forEach((moduleName)=>{
        readConfig(moduleName, `node_modules/@hyron/${moduleName}`);
    })
    return cfg;
}

function getConfig(moduleName) {
    return appConfig[moduleName];
}

function readConfig(moduleName, path) {
    var files = fs.readdirSync();
    if (files.includes(CONFIG_FILE_NAME)) {
        fs.readFile(path + '/' + CONFIG_FILE_NAME, (err, data) => {
            var cfg = yaml.parse(data.toString());
            cfg = referenceField(cfg);
            appConfig[moduleName] = cfg;
        })
    }
}

loadDefaultConfig();
console.log(config);

module.exports = {
    getConfig,
    readConfig
};