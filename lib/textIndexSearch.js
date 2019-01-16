function indexOfText(str, array) {
    var index = Math.round(array.length / 2);
    var round = Math.log2(array.length);
    for (var i = 0; i < round; i++) {
        var curText = array[index];
        var nextEndChar = String.fromCharCode(curText.charCodeAt(curText.length - 1) + 1);
        var textSpace = editCharInText(curText, curText.length, nextEndChar);

        if (str >= curText && str < textSpace) {
            return index;
        } else if (curText < str) {
            index = Math.floor((index + array.length) / 2);
        } else {
            index = Math.round(index / 2);
        }
    }

    return -index;
}

function editCharInText(str, index, char) {
    return str.substr(0, index - 1) + char + str.substr(index);
}

module.exports = indexOfText;