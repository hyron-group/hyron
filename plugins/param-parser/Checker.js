const commentParser = require("./lib/commentParser");
const stringToObject = require("../../lib/objectParser");
const HTTPMessage = require("../../type/HttpMessage");
const StatusCode = require("../../type/StatusCode");
const conditionParser = require("./lib/conditionParser");
const CONDITION_REG = /(@param\s+([\w\d]+)\s*([\w\d\s.:,\u002d\002b%^&'"*\[\]\{\}]*))/g;

const ClientFile = require("./type/ClientFile");
const conditionStorage = {};
const prettyConditionStorage = {};

var checkerStorage = {};

function registerChecker(funcName, func) {
    var checker = checkerStorage[funcName];
    if (checker == null) {
        checker = getCheckerExecList(funcName, func.toString());
        checkerStorage[funcName] = checker;
    }
}

function getInvalidTypeError(paramName, funcName) {
    var condition = conditionStorage[funcName + paramName];
    condition = getPrettyCondition(paramName);

    return new HTTPMessage(
        StatusCode.NOT_ACCEPTABLE,
        `Invalid param '${paramName}', check if param satisfying conditions ${condition}`
    );
}

function checkData(funcName, data) {
    if (data == null) return;
    var checkerExecList = checkerStorage[funcName];
    if (checkerExecList == null) return;
    var keyset = Object.keys(checkerExecList);
    for (var i = 0; i < keyset.length; i++) {
        var paramName = keyset[i];
        var checkerExec = checkerExecList[paramName];
        if (checkerExec == null) continue;
        var value = data[paramName];
        var testResult = checkerExec(value);
        if (testResult === 0) {
            return getInvalidTypeError(paramName, funcName);
        }
    }
}

function testVar(funcName, paramName, val) {
    var checkerExecList = checkerStorage[funcName];
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
        getPrettyCondition(key, curCondition);
        var conditionExecute = conditionParser(curCondition);
        conditionStorage[funcName + key] = conditionExecute;
        var finalExec = eval(`(input)=>{return ${conditionExecute}}`);
        execList[key] = finalExec;
    });
    return execList;
}

function getPrettyCondition(paramName, condition) {
    var prettyCondition = prettyConditionStorage[paramName];
    if (prettyCondition == null) {
        prettyCondition = JSON.stringify(condition, null, 1);
        prettyCondition = prettyCondition.replace("{", " ");
        prettyCondition = prettyCondition.replace("}", " ");
        prettyCondition = prettyCondition.replace(/\"/g, "");
        prettyCondition = prettyCondition.replace(":", " : ");
        prettyCondition = prettyCondition.replace("\n", "</br>");
        prettyCondition = prettyCondition.replace(",", "</br>");
        prettyConditionStorage[paramName] = prettyCondition;
    }

    return prettyCondition;
}

function getConditionFromComment(raw) {
    var comment = commentParser(raw);
    var result = {};
    var match;
    if(comment!=null);
    comment.forEach(curComment=>{
        while ((match = CONDITION_REG.exec(curComment)) != null) {
            var key = match[2];
            var condition = stringToObject(match[3]);
            result[key] = condition;
        }
    })
    return result;
}

module.exports = {
    checkData,
    registerChecker,
    testVar
};
