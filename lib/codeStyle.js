// by snack_style

function toLowerCase(name) {
    return name.toLowerCase();
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
    var reg = /_/g;
    var output = input;

    var match;
    while ((match = reg.exec(input)) != null) {
        var curIndex = match.index;
        var nextChar = input.charAt(curIndex + 1);
        output = output.replace('_' + nextChar, nextChar.toUpperCase())
    }

    return output
}

function fromCamelStyle(input) {

    var output = "";
    for (var i = 0; i < input.length; i++) {
        var curChar = input.charAt(i);
        if (curChar == curChar.toUpperCase()) {
            var nextChar = input.charAt(i + 1);
            if (nextChar != nextChar.toUpperCase()) {
                output += '_' + curChar.toLowerCase();
                continue;
            }
        }
        output += curChar;
    }
    return output;
}

function fromSnakeStyle(input) {
    return input;
}

function fromLispStyle(input) {
    return input.replace(/-/g, '_');
}

function formatTo(type, curName){
    var generalName = curName;
    generalName = fromCamelStyle(generalName);
    generalName = fromLispStyle(generalName);
    generalName = fromSnakeStyle(generalName);

    if(type == 'snake')
        return toSnakeStyle(generalName);
    if(type == 'camel')
        return toCamelStyle(generalName);
    if(type == 'lisp')
        return toLispStyle(generalName);
    if(type == 'lower')
        return toLowerCase(generalName);
    return null;
}

module.exports = formatTo;