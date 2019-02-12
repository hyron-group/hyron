function stringToObject(str) {
    var index = 0;
    var isComment = false;
    var isMultilineComment = false;

    function checkIfStartComment(curChar, subArg) {
        var nextChar;
        if (
            curChar == "/" &&
            ((nextChar = subArg.charAt(index + 1)) == "/") ||
            (nextChar == "*")
        ) {
            isMultilineComment = nextChar == "*";
            isComment = true;
        }
    }

    function checkIfEndComment(curChar, subArg) {
        if (
            (curChar == "/") &&
            (subArg.charAt(index - 1) == "*") ||

            !isMultilineComment &&
            (curChar == "\n")
        ) {
            isComment = false;
            isMultilineComment = false;
        }
    }

    function parserToObject(arg) {
        function parserObjectInside(subArg) {
            var res = {};
            var isVal = false;
            var bufKey = "";
            var bufVal = "";
            while (index < subArg.length) {
                var curChar = subArg.charAt(++index);

                checkIfStartComment(curChar, subArg);

                if (!isComment) {
                    // skip quote char
                    if ((curChar == "\"") || (curChar == "\'"));
                    else if (curChar == ":") {
                        bufKey = bufKey.trim();
                        isVal = true;
                    } else if (curChar == "}") {
                        if (bufKey != "") {
                            bufKey = bufKey.trim();
                            if (bufKey != "")
                                res[bufKey] = parserPrimitiveType(bufVal);
                        }
                        return res;
                    } else if (curChar == "{") {
                        let childResult = parserObjectInside(arg);
                        res[bufKey.trim()] = childResult;
                        bufKey = "";
                        bufVal = "";
                    } else if (curChar == "[") {
                        let childResult = parserToArray(arg);
                        res[bufKey.trim()] = childResult;
                        bufKey = "";
                        bufVal = "";
                    } else if (curChar == ",") {
                        isVal = false;
                        if (bufKey != "")
                            res[bufKey] = parserPrimitiveType(bufVal);
                        bufKey = "";
                        bufVal = "";
                    } else {
                        if (isVal) bufVal += curChar;
                        else bufKey += curChar;
                    }
                } else {
                    checkIfEndComment(curChar, subArg);
                }
            }
        }
        if (arg.charAt(index) != "{") return null;
        return parserObjectInside(arg);
    }


    function parserToArray(arg) {
        function parserArrayInside(subArg) {
            var res = [];
            var bufVal = "";

            while (index < subArg.length) {
                var curChar = arg.charAt(++index);

                checkIfStartComment(curChar, subArg);

                if (!isComment) {
                    // skip quote char
                    if ((curChar == "\'") || (curChar == "\""));
                    else if (curChar == ",") {
                        if (bufVal != "") res.push(parserPrimitiveType(bufVal));
                        bufVal = "";
                    } else if (curChar == "[") {
                        res.push(parserArrayInside(subArg));
                        bufVal = "";
                    } else if (curChar == "]") {
                        //in a inside recursive
                        if ((bufVal = bufVal.trim()) != "")
                            res.push(parserPrimitiveType(bufVal));

                        return res;
                    } else if (curChar == "{") {
                        res.push(parserToObject(subArg));
                        bufVal = "";
                    } else {
                        if (!isComment) bufVal += curChar;
                    }
                } else {
                    checkIfEndComment(curChar, subArg);
                }
            }

            return res;
        }
        if (arg.charAt(index) != "[") return null;
        return parserArrayInside(arg);
    }

    function parserPrimitiveType(arg) {
        arg = arg.trim();
        var buf;
        if (!isNaN(buf)) return +buf;
        if (arg == "true") return true;
        if (arg == "false") return false;
        if ((buf = parserToObject(arg)) != null) return buf;
        if ((buf = parserToArray(arg)) != null) return buf;
        if (arg == "null") return null;
        return arg;
    }

    return parserPrimitiveType(str);
}

module.exports = stringToObject;