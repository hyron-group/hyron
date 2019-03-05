const AsyncFunction = (async () => {}).constructor;

const primitiveType = ["string", "boolean", "number", "object", "undefined"];
const globalObjectType = ["Array", "Promise", "Buffer", "AsyncFunction", "Error"];

function getFilter(typeFilter) {
    if (typeFilter == null) return;
    else if (!typeFilter instanceof Array) {
        throw new TypeError("getFilter arg at index 0 should be a Array");
    }
    var condition = "";
    if (typeFilter.includes(null) ||
        typeFilter.includes("null") ||
        typeFilter.includes("undefined") ||
        typeFilter.includes(undefined)) {
        condition = " && (input == null)";
        typeFilter.splice(typeFilter.indexOf(null), 1);
    }
    typeFilter.forEach((type) => {
        if (type != null && type.name != null) {
            type = type.name;
        }
        if (primitiveType.includes(type)) {
            condition += ` || (typeof input === "${type}")`;
        } else if (globalObjectType.includes(type)) {
            condition += ` || (input instanceof ${type})`;
        } else if (typeof type == "function") {
            console.log(globalObjectType)
            condition += ` || (input.constructor.name == "${type.name}")`;
        } else {
            condition += ` || (input.constructor.name == "${type}")`;
        }
    });

    condition = condition.substr(4);

    condition = `(input)=>{return ${condition}}`;
    return eval(condition);
}

console.log(getFilter([null]).toString());

module.exports = getFilter;