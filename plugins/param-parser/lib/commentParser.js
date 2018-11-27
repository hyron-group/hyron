
module.exports = function parseComment(func) {
    var raw = func.toString();
    var commentList = [];
    var isComment = false;
    var isMultilineCmt = false;
    var buf = "";

    function addComment() {
        var data = buf;
        data = data.replace(/\n\s*[*]\s*/g, "\n");
        data = data.trim();
        commentList.push(data);
    }

    // retrieve comment
    for (var curIndex = 0; curIndex < raw.length; curIndex++) {
        var curChar = raw.charAt(curIndex);
        if (curChar == "/") {
            var nextChar = raw.charAt(curIndex + 1);
            if (nextChar == "/") {
                isComment = true;
                curIndex++;
                continue;
            } else if (nextChar == "*") {
                isComment = true;
                isMultilineCmt = true;
                curIndex++;
                if (raw.charAt(curIndex +1) == "*") curIndex++;
                continue;
            }
        } else if (
            curChar == "*" &&
            (raw.charAt(curIndex + 1) == "/") & isMultilineCmt
        ) {
            isComment = false;
            curIndex += 2;
            buf += "\n";
        } else if (curChar == "\n") {
            if (!isMultilineCmt) {
                isComment = false;
                buf += "\n";
            }
        }

        if (isComment) {
            buf += curChar;
        }
    }

    addComment();

    return commentList;
};
