const loadConfigFromFile = require("../../lib/configReader");

var defaultConfig = {
    ...loadConfigFromFile()
};

function setup() {
    setURI.apply(this);
    enablePluginsByConfigFile.apply(this);
}


function enablePluginsByConfigFile() {
    var pluginsList = defaultConfig.plugins;
    this.enablePlugins(pluginsList);
}

function setURI() {
    var customURI = defaultConfig.base_url;
    if(customURI!=null)
    this.baseURI = customURI;
}

module.exports = setup;