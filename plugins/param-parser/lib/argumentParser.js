const FUNC_BEGIN_REG = /^\s*.*[(]/;
const FUNC_BODY_REG = /[)]\s*[{][^]*[}]\s*$/;
const CMT_REG = /([/]{2}.*)|(\/\*[^]*\*\/)/g;
const DEFAULT_VAL_REG = /\s*=\s*(([{]([^=]*)[}])|([\u005b]\2[\u005d])|([""].*[""])|(true|false)|\s\d*)/g;


module.exports = function parseArgument(rawFunc) {
  var params = [];
  var rawParam = rawFunc;

  //skip function begin
  rawParam = rawParam.replace(FUNC_BEGIN_REG, "");
  //skip body
  rawParam = rawParam.replace(FUNC_BODY_REG, "");
  //skip comment
  rawParam = rawParam.replace(CMT_REG, "");
  //skip default value

  var listArgName = rawParam.replace(DEFAULT_VAL_REG, "");

  params = listArgName.split(",");
  params.every((val, i)=>params[i]=val.trim())


  return params;
};
