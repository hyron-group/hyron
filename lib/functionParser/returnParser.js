const { stringToObject } = require("../paramParser");
const returnReg = /(return\s*([{][^]+[}]))/g;

function parseReturn(rawFunc) {
    var raw = returnReg.exec(rawFunc)[1];
    var execute = `(()=>{${raw})();`;

    return eval(execute);
}

module.exports = parseReturn;