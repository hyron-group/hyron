const variableReg = /([$][\w\d]+)/gm;

module.exports = function parseVariable(raw) {
    var varRequestLoaded = new Set();
    for (var i = 0; i < raw.length; i++) {
      var matchNext = variableReg.exec(raw);
      if (matchNext != null && matchNext[1] != null)
        varRequestLoaded.add(matchNext[1]);
      else break;
      i += matchNext[0].length;
    }

    console.log(varRequestLoaded);
    return varRequestLoaded;
  }
