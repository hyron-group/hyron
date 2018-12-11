const AsyncFunction = (async ()=>{}).constructor;

function getFilter(typeFilter) {
    if (typeFilter == null) return;
    var condition = "(input!=null)";
    typeFilter.forEach(type => {
        if (["string", 'boolean', 'number', 'object'].includes(type)) {
            condition += ` && (typeof input == '${type}')`
        } else if (["Array", "Promise", "Buffer", "AsyncFunction"].includes(type)) {
            condition += ` && (input instanceof ${type})`
        } else
            condition += ` && (input.constructor.name == '${type}')`
    })

    condition = `(input)=>{return ${condition}}`
    return eval(condition);
}

module.exports = getFilter;