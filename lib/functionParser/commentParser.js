const ignoreComment = ["todo", "fixme", "bug"];
const multiCommentReg = /\/\*\s*(\b(?!\*\/)\b\S+)\s*\*\//g;

module.exports = function parseComment(raw) {
  var commentList = new Set();

  for (var i = 0; i < raw.length; i++) {
    var matchNext = multiCommentReg.exec(raw);
    console.log(raw);
    if (matchNext != null && matchNext[1] != null)
      commentList.add(matchNext[1].trim());
    else break;
    i += matchNext[0].length;
  }

  console.log(commentList);
  return commentList;
}
