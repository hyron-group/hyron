const plRunner = require('./runner');

module.exports = function (cfg) {
    console.log("java supporter");
    module.constructor.prototype.require = customRequire;
};

function customRequire(path) {
    //   console.log("require");
    // console.log(Object.keys(this.constructor))
    return this.constructor._load(path, this);
}