
class AddonsManager {
    constructor(scope) {
        this.scope = scope;
    }

    registerAddons(name, handler, config) {
        if (handler == null) return;
        handler.call(this.scope, config);
        console.log(`-> Registered addons '${name}'`);
    }

}

module.exports = AddonsManager;