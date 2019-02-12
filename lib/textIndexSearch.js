function editCharInText(str, index, char) {
    return str.substr(0, index) + char + str.substr(index + 1);
}

function getMaxRangeText(str, from) {
    if (from == null) {
        from = str.length - 1;
    }
    var nextEndChar = String.fromCharCode(str.charCodeAt(from) + 1);
    var maxRange = editCharInText(str, from, nextEndChar);
    return maxRange;
}


/**
 * @param {string} str
 * @param {array} array
 * @param {number} from
 * @returns
 *  - relative position (negative) if not found
 *  - an -∞ if out of range
 *  - absolute position if found
 */
function binaryTextSearch(str, array, from) {
    if (str < array[0] ||
        array == null ||
        array.length == 0) {
        return Number.NEGATIVE_INFINITY;
    } else if(str>array[array.length-1]){
        return -array.length;
    }

    var centerIndex = (array.length - 1) / 2;
    var index = Math.round(centerIndex);
    var checksum = 0;
    var leftIndex = 0;
    var rightIndex = array.length - 1;
    while ((checksum != leftIndex + rightIndex) &&
        (checksum = leftIndex + rightIndex)) {
        var curText = array[index];
        var maxRangeText = getMaxRangeText(curText, from);

        if (str >= curText && str < maxRangeText) {
            return index;
        } else if (curText < str) {
            leftIndex = index;
            index = Math.floor((index + rightIndex) / 2);
        } else {
            rightIndex = index;
            index = Math.round((index + leftIndex) / 2);
        }

    }

    return -index;
}




module.exports = binaryTextSearch;