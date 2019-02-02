const homeDir = require('../lib/homeDir');
const path = require('path');
const configReader = require('../core/configReader');

function loadModuleByPath(modulePath, moduleName) {
    var output;
    var location;
    try {
        // for local modules
        location = path.join(homeDir, modulePath);
        output = require(location);
    } catch (err) {
        if (output == null) {
            // for installed modules
            location = "node_modules/" + modulePath;
            output = require(location);
        }
    }
    configReader.loadConfig(location, moduleName);

    return output;
}

module.exports = loadModuleByPath;