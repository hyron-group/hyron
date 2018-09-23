const commentParser = require("./lib/commentParser");
const stringToObject = require("../../lib/objectParser");
const HTTPMessage = require("../../type/HttpMessage");
const StatusCode = require("../../type/StatusCode");
const conditionReg = /(@param\s+([\w\d]+)\s*([\w\d\s:,\u002d\002b%^&*\[\]\{\}]*))/g;

const ClientFile = require("./type/ClientFile");
const conditionStorage = {};

var checkerStorage = {};

function registerChecker(funcName, func) {
    var checker = checkerStorage[funcName];
    if (checker == null) {
        checker = getCheckerExecList(funcName, func.toString());
        checkerStorage[funcName] = checker;
    }
}

function getInvalidTypeError(paramName, funcName) {
    var condition = conditionStorage[funcName + paramName].replace(
        /input/g,
        `[${paramName}]`
    );
    return new HTTPMessage(
        StatusCode.NOT_ACCEPTABLE,
        `Invalid param '${paramName}', check if param satisfying conditions ${condition}`
    );
}

function checkData(funcName, data) {
    if (data == null) return;
    var checkerExecList = checkerStorage[funcName];
    if (checkerExecList == null) return;
    var keyset = Object.keys(data);
    for (var i = 0; i < keyset.length; i++) {
        var paramName = keyset[i];
        var checkerExec = checkerExecList[paramName];
        if (checkerExec == null) continue;
        var value = data[paramName];
        var testResult = checkerExec(value);
        if (testResult == 0) {
            return getInvalidTypeError(paramName, funcName);
        }
    }
}

function testVar(funcName, paramName, val) {
    var checkerExecList = checkerStorage[funcName];
    console.log(checkerStorage);
    if (checkerExecList == null) return;
    var checkerExec = checkerExecList[paramName];
    if (checkerExec == null) return;
    var testResult = checkerExec(val);
    if (testResult == 0) {
        return getInvalidTypeError(paramName, funcName);
    }
}

function getCheckerExecList(funcName, raw) {
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
                buf += ` & (typeof input === '${curCondition.type}')`;
            else {
                buf += ` & (input instanceof ${curCondition.type})`;
            }
        }
        if (curCondition.size != null) {
            if (curCondition.type == "Buffer")
                buf += ` & (Buffer.byteLength(input) < ${curCondition.size})`;
            if (curCondition.type == "ClientFile")
                buf += ` & (input !=null && Buffer.byteLength(input.content) < ${
                    curCondition.size
                })`;
            else buf += ` & (input.length < ${curCondition.size})`;
        }
        if (curCondition.mime != null) {
            //TODO: support for mime type
            if (curCondition.type == "ClientFile")
                buf += ` & (input !=null && input.type == ${
                    curCondition.mime
                })`;
        }
        if (curCondition.gt != null) buf += ` & (input > ${curCondition.gt})`;
        if (curCondition.lt != null) buf += ` & (input < ${curCondition.lt})`;
        if (curCondition.gte != null)
            buf += ` & (input >= ${curCondition.gte})`;
        if (curCondition.lte != null)
            buf += ` & (input <= ${curCondition.lte})`;
        if (curCondition.reg != null)
            buf += ` & (${curCondition.reg}.test(input))`;
        if (curCondition.in != null)
            buf += ` & (${curCondition.in}.includes(input))`;
        if (curCondition.non != null)
            buf += ` & (!${curCondition.non}.includes(input))`;

        buf = buf.substr(3);
        conditionStorage[funcName + key] = buf;
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

module.exports = {
    checkData,
    registerChecker,
    testVar
};
