const AsyncFunction = (async () => {}).constructor;

const primitiveType = ["string", 'boolean', 'number', 'object'];
const defaultObjectType = ["Array", "Promise", "Buffer", "AsyncFunction, Error"];

function getFilter(typeFilter) {
    if (typeFilter == null) return;
    var condition = "(input!=null)";
    typeFilter.forEach(type => {
        if (primitiveType.includes(type)) {
            condition += ` && (typeof input == '${type}')`
        } else if (defaultObjectType.includes(type)) {
            condition += ` && (input instanceof ${type})`
        } else
            condition += ` && (input.constructor.name == '${type}')`
    })

    condition = `(input)=>{return ${condition}}`
    return eval(condition);
}

module.exports = getFilter;