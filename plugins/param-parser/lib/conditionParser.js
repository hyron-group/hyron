var CONDITION_HANDLE = {
    size: (condition, type) => {
        var allowSize = condition;
        var SIZE_REG = /([\d.]+)(B|KB|MB|GB)?/gi;
        var match = SIZE_REG.exec(allowSize);
        var size = match[1];
        var unit = match[2];
        if (unit != null) {
            unit = unit.toUpperCase();
            if (unit == "KB") size *= 1000;
            else if (unit == "MB") size *= 1000000;
            else if (unit == "GB") size *= 1000000000;
        }
        if (type == "Buffer") return ` & (Buffer.byteLength(input) < ${size})`;
        if (type == "ClientFile") {
            return ` & (input !=null && Buffer.byteLength(input.content) < ${size})`;
        } else return ` & (input.length < ${size})`;
    },
    type: condition => {
        if (["string", "number", "boolean", "object"].includes(condition))
            return ` & (typeof input === '${condition}')`;
        else {
            return ` & (input instanceof ${condition})`;
        }
    },
    mime: (condition, type) => {
        //TODO: support for mime type

        if (type == "ClientFile")
            return ` & (input !=null && input.type == ${condition})`;
        else return "";
    },
    lt: condition => {
        return ` & (input < ${condition})`;
    },
    lte: condition => {
        return ` & (input <= ${condition})`;
    },
    gt: condition => {
        return ` & (input > ${condition})`;
    },
    gte: condition => {
        return ` & (input >= ${condition})`;
    },
    eq: condition => {
        return ` & (input == ${condition})`;
    },
    ne: condition => {
        return ` & (input != ${condition})`;
    },
    in: condition => {
        return ` & (${JSON.stringify(condition)}.includes(input))`;
    },
    nin: condition => {
        return ` & (!${JSON.stringify(condition)}.includes(input))`;
    },
    reg: (condition, type) => {
        return ` & (${JSON.stringify(condition)}.test(input))`;
    }
};

function parseConditionCase(conditionList) {
    if (conditionList == null) return;
    var buf = "";
    var type = conditionList.type;
    Object.keys(conditionList).forEach(key => {
        var condition = conditionList[key];
        var mappingHandle = CONDITION_HANDLE[key];
        if (mappingHandle != null) buf += mappingHandle(condition, type);
    });

    buf = buf.substr(3);
    // console.log(buf);
    return buf;
}

module.exports = parseConditionCase;
