const paramReg = /^[\s]*(function.*)?[(]([\n\s\w\d\W]*)[)]/g;
const funcBegin = /^\s*.*[(]/;
const bodyReg = /[)]\s*[{][^]*[}]\s*$/;
const cmtReg = /([/]{2}.*)|(\/\*[^]*\*\/)/g;
const defaultValReg = /\s*=\s*(([{]([^=]*)[}])|([\u005b]\2[\u005d])|(["'].*['"])|(true|false)|\s\d*)/g;


module.exports = function parseArgument(rawFunc) {
  var params = [];
  var rawParam = rawFunc;


  //skip function begin
  rawParam = rawParam.replace(funcBegin, "");
  //skip body
  rawParam = rawParam.replace(bodyReg, "");
  //skip comment
  rawParam = rawParam.replace(cmtReg, "");
  //skip default value

  var listArgName = rawParam.replace(defaultValReg, "").split(",");
  var i = 0;
  var iterableControl = "";
  for (var i = 0; i < listArgName.length; i++) {
    var argName = listArgName[i].trim();
    var defaultVal = null;
    iterableControl += `params.push('${argName}');\n`;
  }

  var argEval = `((${rawParam})=>{
      ${iterableControl}
    })()`;
  eval(argEval);

  return params;
};
