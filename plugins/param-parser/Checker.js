const commentParser = require("./lib/commentParser");
const stringToObject = require("../../lib/objectParser");
const conditionReg = /(@param\s+([\w\d]+)\s*([\w\d\s:,\u002d\002b%^&*\[\]\{\}]*))/g;
const condition = {};
var checkerStorage = {};

function checkData(name, func, data) {
    var checkerExecList = prepareChecker(name, func);
    var keyset = Object.keys(data);
    for (var i = 0; i < keyset.length; i++) {
        var key = keyset[i];
        var checkerExec = checkerExecList[key];
        if (checkerExec != null) {
            var testResult = checkerExec(data[key]);
            if (testResult == 0) {
                // false
                return new Error(
                    `406:Invalid param ${key}, check if param satisfying conditions ${
                        condition[key]
                    }`
                );
            }
        }
    }
}

function prepareChecker(name, func) {
    var checker = checkerStorage[name];
    if (checker == null) {
        checker = getCheckerExecList(func.toString());
        checkerStorage[name] = checker;
    }

    return checker;
}

function getCheckerExecList(raw) {
    var execList = {};
    var inputCondition = getConditionFromComment(raw);
    Object.keys(inputCondition).forEach(key => {
        var curCondition = inputCondition[key];
        var buf = "";
        if ((curCondition.type != null) & (curCondition.type != "*")) {
            if (
                ["string", "number", "boolean", "object"].includes(
                    curCondition.type
                )
            )
                buf += `& (typeof input === '${curCondition.type}')`;
            else buf += `& (input instanceof ${curCondition.type})`;
        }
        if (curCondition.size != null) {
            buf += ` & (input.length < ${curCondition.size})`;
            if (curCondition.type == "Buffer")
                buf += ` & (Buffer.byteLength(input) < ${curCondition.type})`;
        }
        if (curCondition.gt != null) buf += ` & (input > ${curCondition.gt})`;
        if (curCondition.lt != null) buf += ` & (input < ${curCondition.lt})`;
        if (curCondition.gte != null)
            buf += ` & (input >= ${curCondition.gte})`;
        if (curCondition.lte != null)
            buf += ` & (input <= ${curCondition.lte})`;

        buf = buf.substr(1);
        var finalExec = eval(`(input)=>{return ${buf}}`);
        execList[key] = finalExec;
    });
    return execList;
}

function getConditionFromComment(raw) {
    var comment = commentParser(raw);
    var result = {};
    var match;
    while ((match = conditionReg.exec(comment)) != null) {
        var key = match[2];
        var condition = stringToObject(match[3]);
        result[key] = condition;
    }
    return result;
}

module.exports = checkData;
