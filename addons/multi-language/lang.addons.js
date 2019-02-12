const plRunner = require("./runner");

function customRequire(path) {
    return this.constructor._load(path, this);
}

function handler(cfg) {
    console.log("java supporter");
    module.constructor.prototype.require = customRequire;
}

module.exports = handler;