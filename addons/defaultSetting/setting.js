const loadConfigFromFile = require("../../lib/configReader");
const {
    addMiddleware
} = require("../../core/middleware");


var defaultConfig = {
    ...loadConfigFromFile()
};

function setup() {
    setURI.apply(this);
    loadPluginsSetting.apply(this);
    enablePluginsByConfigFile.apply(this);
}


function enablePluginsByConfigFile() {
    var pluginsList = defaultConfig.plugins;
    this.enablePlugins(pluginsList);
}

function loadPluginsSetting() {
    Object.assign(this.config, defaultConfig[this.baseURI]);
}

function setURI() {
    var customURI = defaultConfig.base_url;
    this.baseURI = customURI;
}

module.exports = setup;