const logger = require('../lib/logger')
const {
    getAllowMethod
} = require('./supportedMethod');


/**
 * @description used to creates a standardized config
 * @param {string} methodPath
 * @param {object} routeConfig
 * @param {object} generalConfig
 * @param {object} appConfig
 */
function prepareConfigModel(methodPath, routeConfig, generalConfig, appConfig) {
    if (typeof routeConfig == "boolean" || typeof routeConfig == "function") {
        logger.error(
            `[warning] Don't support for config type at ${methodPath}`
        );
    }

    var method = [],
        fontware = [],
        backware = [],
        plugins = [],
        enableREST,
        handle,
        path;


    function prepareMethod(type) {
        if (typeof type == "string") {
            type = type.toUpperCase();
            if (type == "ALL") {
                prepareMethod(getAllowMethod());
                return;
            } else
                method.push(type);
        } else if (type instanceof Array) {
            type.forEach(curType => {
                method.push(curType.toUpperCase());
            });
        } else if (typeof type == "object") prepareMethod(type.method);
        else
            throw new TypeError(
                `Method ${method} in ${methodPath} isn't string or array`
            );

    }

    function inheritanceFromGeneralConfig() {
        if (generalConfig == null) return;
        if (method == null) {
            if (generalConfig.method == null) method = ["GET"];
            else method = generalConfig.method;
        }
        if (enableREST == null) enableREST = generalConfig.enableREST;
        if (generalConfig.fontware != null)
            fontware = fontware.concat(generalConfig.fontware);
        if (generalConfig.backware != null)
            backware = backware.concat(generalConfig.backware);
    }

    function inheritanceFromAppConfig() {
        if (enableREST == null) enableREST = appConfig.enableRESTFul;
    }

    function loadFromRouteConfig() {
        prepareMethod(routeConfig);
        if (typeof routeConfig != "object") return;
        enableREST = routeConfig.enableREST;
        if (routeConfig.fontware != null)
            fontware = fontware.concat(routeConfig.fontware);
        if (routeConfig.backware != null)
            backware = backware.concat(routeConfig.backware);
        if (routeConfig.plugins != null) {
            fontware = fontware.concat(routeConfig.plugins);
            backware = backware.concat(routeConfig.plugins);
        }
        path = routeConfig.path;
        handle = routeConfig.handle;
    }

    loadFromRouteConfig();
    inheritanceFromGeneralConfig();
    inheritanceFromAppConfig();

    return {
        method,
        enableREST,
        fontware,
        backware,
        plugins,
        handle,
        path,
    };
}

module.exports = prepareConfigModel;