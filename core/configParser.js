const {
    checkMethod
} = require('./supportedMethod');



function prepareMethod(data, method, funcPath) {
    if (typeof method == "string") {
        var standardMethod = method.toUpperCase();
        checkMethod(standardMethod, funcPath);
        data.method = [standardMethod];
    } else if (method instanceof Array) {
        method.forEach(curMethod => {
            curMethod = curMethod.toUpperCase();
            checkMethod(curMethod, funcPath);
            data.method.push(curMethod.toUpperCase());
        });
    } else
        throw new TypeError(
            `Method '${data.method}' in '${funcPath}' isn't string or array`
        );
}

function inheritanceFromGeneralConfig(data, generalConfig, methodPath) {
    if (generalConfig == null) return;
    if (data.method == null) {
        if (generalConfig.method == null) method = ["GET"];
        else data.method = generalConfig.method;
    }
    if (generalConfig.fontware != null)
        data.fontware = data.fontware.concat(generalConfig.fontware);
    if (generalConfig.backware != null)
        data.backware = data.backware.concat(generalConfig.backware);
}

function inheritanceFromAppConfig(data, appConfig, methodPath) {}

function loadFromRouteConfig(data, routeConfig, methodPath) {
    if (typeof routeConfig == "string" ||
        routeConfig.constructor.name == "Array") {
        routeConfig = {
            method: routeConfig
        }
    } else if (routeConfig.constructor.name != "Object") {
        return
    }
    prepareMethod(data, routeConfig.method, methodPath);

    if (routeConfig.fontware != null)
        data.fontware = data.fontware.concat(routeConfig.fontware);
    if (routeConfig.backware != null)
        data.backware = data.backware.concat(routeConfig.backware);
    if (routeConfig.plugins != null) {
        data.fontware = data.fontware.concat(routeConfig.plugins);
        data.backware = data.backware.concat(routeConfig.plugins);
    }

    data.path = routeConfig.path;
    data.handle = routeConfig.handle;
    data.params = routeConfig.params;
}

/**
 * @description used to creates a standardized config
 * @param {string} methodPath
 * @param {object} routeConfig
 * @param {object} generalConfig
 * @param {object} appConfig
 */
function prepareConfigModel(methodPath, routeConfig, generalConfig, appConfig) {
    if (typeof routeConfig != "string" &&
        routeConfig.constructor.name != "Array" &&
        routeConfig.constructor.name != "Object") {
        console.warn(
            `[warning] Don't support for config type at ${methodPath}`
        );
    }

    var config = {
        method: [],
        fontware: [],
        backware: [],
        plugins: [],
        handle: undefined,
        path: undefined,
        params: undefined
    }

    loadFromRouteConfig(config, routeConfig, methodPath);
    inheritanceFromGeneralConfig(config, generalConfig, methodPath);
    inheritanceFromAppConfig(config, appConfig, methodPath);

    return config;
}

module.exports = prepareConfigModel;