
function stringToObject(str) {
  var index = 0;
  var isComment = false;
  var isMultilineComment = false;

  var parserToArray = function(arg) {
    function parserArrayInside(subArg) {
      var res = [];
      var bufVal = "";

      while (index < subArg.length) {
        var curChar = arg.charAt(++index);

        if (
          curChar == "/" &&
          ((nextChar = subArg.charAt(index + 1)) == "/") | (nextChar == "*")
        ) {
          isMultilineComment = nextChar == "*";
          isComment = true;
        }

        if (!isComment) {
          // skip quote char
          if (['"', "'"].includes(curChar));
          else if (curChar == ",") {
            res.push(parserPrimaryType(bufVal));
            bufVal = "";
          } else if (curChar == "[") {
            res.push(parserArrayInside(subArg));
            bufVal = "";
          } else if (curChar == "]") {
            //in a inside recursive
            if (bufVal.trim() != "") res.push(parserPrimaryType(bufVal));

            return res;
          } else if (curChar == "{") {
            res.push(parserToObject(subArg));
          } else {
            if (!isComment) bufVal += curChar;
          }
        } else {
          if (
            (curChar == "/") & (subArg.charAt(index - 1) == "*") ||
            !isMultilineComment & (curChar == "\n")
          ) {
            isComment = false;
            isMultilineComment = false;
          }
        }
      }

      return res;
    }
    if (arg.charAt(index) != "[") return null;
    return parserArrayInside(arg);
  };

  var parserToObject = function(arg) {
    function parserObjectInside(subArg) {
      var res = {};
      var isVal = false;
      var bufKey = "";
      var bufVal = "";
      while (index < subArg.length) {
        var curChar = subArg.charAt(++index);
        var nextChar;

        // mark behind this charact is comment
        if (
          curChar == "/" &&
          ((nextChar = subArg.charAt(index + 1)) == "/") | (nextChar == "*")
        ) {
          isMultilineComment = nextChar == "*";
          isComment = true;
        }

        if (!isComment) {
          // skip quote char
          if (['"', "'"].includes(curChar));
          else if (curChar == ":") {
            bufKey = bufKey.trim();
            isVal = true;
          } else if (curChar == "}") {
            if (bufKey != "") res[bufKey] = parserPrimaryType(bufVal);
            return res;
          } else if (curChar == "{") {
            var childResult = parserObjectInside(arg);
            res[bufKey] = childResult;
            bufKey = "";
            bufVal = "";
          } else if (curChar == "[") {
            var childResult = parserToArray(arg);
            res[bufKey] = childResult;
            bufKey = "";
            bufVal = "";
          } else if (curChar == ",") {
            isVal = false;
            if (bufKey != "") res[bufKey] = parserPrimaryType(bufVal);
            bufKey = "";
            bufVal = "";
          } else {
            if (isVal) bufVal += curChar;
            else bufKey += curChar;
          }
        } else {
          if (
            (curChar == "/") & (subArg.charAt(index - 1) == "*") ||
            !isMultilineComment & (curChar == "\n")
          ) {
            isComment = false;
            isMultilineComment = false;
          }
        }
      }
    }
    if (arg.charAt(index) != "{") return null;
    return parserObjectInside(arg);
  };

  var parserPrimaryType = function(arg) {
    arg = arg.trim();
    var buff;
    if ((buff = Number(arg)) && !Number.isNaN(buff)) return buff;
    else if ((arg == "true") | (arg == "false")) return arg == "true";
    else if ((buff = parserToObject(arg)) != null) return buff;
    else if ((buff = parserToArray(arg)) != null) return buff;
    else if ((arg == "null") | (arg == "undefine")) return null;
    else return arg;
  };

  return parserPrimaryType(str);
}
var parserFromObject = function(objData) {
  var result = {};
  Object.keys(objData).forEach(key => {
    result[key] = stringToObject(objData[key]);
  });
  return result;
};

module.exports = {
  stringCollectionObject : parserFromObject,
  stringToObject
}
