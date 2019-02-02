const loadModuleByPath = require('../lib/moduleLoader');

var globalAddons = [];
class AddonsManager {
    constructor(instance) {
        this.instance = instance;
        this.addonsHolder = {};
    }

    registerAddons(name, handler, config) {
        if (handler == null) return;
        this.addonsHolder[name] = {
            handler,
            config
        }
        console.log(`-> Registered addons '${name}'`);
    }

    runAddons(name){
        var {handler, config} = this.addonsHolder[name];
        handler.call(this.instance, config);
    }

    static registerGlobalAddons(name, handler, config) {
        globalAddons.push({
            handler,
            config
        });
        console.log(`-> Registered addons '${name}' as global`);
    }

    static runGlobalAddons(instance) {
        globalAddons.forEach((addons)=>{
            var {handler, config} = addons;
            handler.call(instance, config);
        })
    }

}

module.exports = AddonsManager;