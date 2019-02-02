Object.assign(global, {
    HTTPMessage: require('./lib/HttpMessage'),
    StatusCode: require('./lib/StatusCode')
})
var moduleManager = require("./core/ModulesManager");

require('./core/runtimeLoader')();

module.exports = moduleManager;