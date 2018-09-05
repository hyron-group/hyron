const fs = require("fs");
const ini = require("ini");
var config = {};
const CONFIG_FILE_NAME = "appcfg.ini";

function loadConfig() {
    loadParentConfig();
    loadPluginConfig();
    return config;
}

function loadParentConfig() {
    config = loadConfigFile(CONFIG_FILE_NAME);
}

function loadPluginConfig() {
    var pluginList = getPluginList();
    for (var i = 0; i < pluginList.length; i++) {
        var pluginName = pluginList[i];
        var pluginConfig = loadConfigFile(
            `node_modules/${pluginName}/${CONFIG_FILE_NAME}`
        );
        function prepareChild(pluginConfig, parent) {
            if (pluginConfig == null) return null;
            var keyList = Object.keys(pluginConfig);
            if (keyList != null)
                keyList.forEach(key => {
                    var val = pluginConfig[key];
                    if (key == "this") key = pluginName;


                    if (typeof val == "object") {
                        prepareChild(val, key);
                        return;
                    }

                    if (val == "<parent>") {
                        if (parent == null) val = config[key];
                        else if (config[parent] != null)
                            val = config[parent][key];
                        else val = null;
                        if (val == undefined) val = null;
                    }

                    if (parent == null) {
                        config[key] = val;
                    }
                    else {
                        if (config[parent] == null) config[parent] = {};
                        config[parent][key] = val;
                    }
                });
        }

        prepareChild(pluginConfig);
    }
}

function loadConfigFile(path) {
    try {
        var data = fs.readFileSync(path).toString();
        data = ini.parse(data);
        return data;
    } catch (e) {}
}

function getPluginList() {
    var pluginReg = /^@hyron\//;

    var npmPackage = fs.readFileSync("package.json");
    var dependencies = JSON.parse(npmPackage).dependencies;
    var pluginList = [];

    Object.keys(dependencies).forEach(name => {
        if (pluginReg.test(name)) pluginList.push(name);
    });
    return pluginList;
}


loadConfig()
module.exports = loadConfig;
