// by snack_style

function toLowerCase(name) {
    name = name.toLowerCase();
    name = name.replace(/_/g, "");
    return name;
}

function toSnakeStyle(input) {
    // like : var_name
    return input;
}

function toLispStyle(input) {
    // like : var-name
    return input.replace(/_/g, "-");
}

function toCamelStyle(input) {
    // like : varName;
    return input.replace(/_([\w])/g, (match, capture) => {
        return capture.toUpperCase();
    });
}

function fromCamelStyle(input) {
    var output = "";
    var reg = /([a-z])([A-Z])/g;
    output = input.replace(reg, `$1_$2`).toLowerCase();
    return output;
}

function fromSnakeStyle(input) {
    return input;
}

function fromLispStyle(input) {
    return input.replace(/-/g, "_");
}

function formatTo(type, string) {
    string = fromCamelStyle(string);
    string = fromLispStyle(string);
    string = fromSnakeStyle(string);

    if (type == "snake")
        return toSnakeStyle(string);
    if (type == "camel")
        return toCamelStyle(string);
    if (type == "lisp")
        return toLispStyle(string);
    if (type == "lower")
        return toLowerCase(string);
    return null;
}

module.exports = formatTo;
