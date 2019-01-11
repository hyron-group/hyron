const middleware = require('../core/middleware');
const ModuleManager = require('../core/moduleManager');
const crc = require('crc').crc16;

// function bind(...pluginsList) {
//     var plugins = {};
//     var eventName = crc(handle.toString()).toString(16);

//     for (var i = 0; i < pluginsList.length; i++) {
//         var {
//             fontware,
//             backware
//         } = pluginsList[i];
//         if (fontware != null) fontware.global = false;
//         if (backware != null) backware.global = false;
        
//         var pluginsName = `pl-${i}`;
//         plugins[pluginsName] = pluginsList[i];
//         pluginsName[i] = pluginsName;
//     }

//     new ModuleManager().enablePlugins(plugins);

//     return eventWrapper;
// }

// function eventWrapper(){

// }

function merge(...targetClass) {
    var finalMixinsClass = class Mixins {};
    var reqConfig = {};

    for (var i = 0; i < targetClass.length; i++) {
        var curClass = targetClass[i];
        Object.assign(reqConfig, curClass.requestConfig());
        finalMixinsClass = class Mixins extends allOf(
            finalMixinsClass,
            curClass
        ) {};
    }

    finalMixinsClass.requestConfig = function () {
        return reqConfig;
    };

    return finalMixinsClass;
}

function allOf(BaseClass, ...Mixins) {
    function copyProperties(target, source) {
        const allPropertyNames = Object.getOwnPropertyNames(source).concat(
            Object.getOwnPropertySymbols(source)
        );

        allPropertyNames.forEach(propertyName => {
            if (
                propertyName.match(
                    /^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/
                )
            )
                return;
            Object.defineProperty(
                target,
                propertyName,
                Object.getOwnPropertyDescriptor(source, propertyName)
            );
        });
    }

    class Base extends BaseClass {
        constructor(...args) {
            super(...args);

            Mixins.forEach(Mixin => {
                copyProperties(this, new Mixin(...args));
            });
        }
    }

    Mixins.forEach(Mixin => {
        copyProperties(Base.prototype, Mixin.prototype);
    });

    return Base;
}

function load(plugins) {

}

module.exports = {
    merge
};