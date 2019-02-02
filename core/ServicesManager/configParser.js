const {
    checkMethod
} = require('./supportedMethod');



function prepareMethod(data, method, funcPath) {
    if(method==null) return;
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
            `Method '${method}' in '${funcPath}' isn't string or array`
        );
}

function inheritFromGeneralConfig(data, generalConfig, methodPath) {
    if (generalConfig == null) return;
    if (data.method.length==0) {
        if (generalConfig.method == null) data.method = ["GET"];
        else prepareMethod(data, generalConfig.method, methodPath);
    }
    if (generalConfig.fontware != null)
        data.fontware = data.fontware.concat(generalConfig.fontware);
    if (generalConfig.backware != null)
        data.backware = data.backware.concat(generalConfig.backware);
}

function loadFromRouteConfig(data, routeConfig, methodPath) {
    if (typeof routeConfig == "string" ||
        routeConfig instanceof Array) {
        routeConfig = {
            method: routeConfig
        }
    }
    if (routeConfig.constructor.name !== "Object") {
        return;
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

function prepareConfigModel(methodPath, routeConfig, generalConfig) {
    if (typeof routeConfig !== "string" &&
        routeConfig instanceof Array &&
        routeConfig.constructor.name !== "Object") {
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
    inheritFromGeneralConfig(config, generalConfig, methodPath);

    return config;
}

module.exports = prepareConfigModel;