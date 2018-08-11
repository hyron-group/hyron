const { stringCollectionObject } = require("../lib/paramParser");
const { parseArgument } = require("../lib/functionParser");
const TokenManager = require("../lib/token");
const cache = require("static-memory");

// load data from http request to method arguments scope to execute
function prepareParam(req, methodName, handler) {
  var paramData = [];
  var argList = cache("args-" + methodName, () => {
    var keyList = [];
    var functionArgument = parseArgument(handler);
    for(var i=0; i<functionArgument.length; i++){
      keyList.push(functionArgument[i].name);
    }
    return keyList;
  });
  var reqData = getRequestData(req);

  argList.forEach(argName => {
    paramData.push(reqData[argName]);
  });

  return paramData;
}

function getDefaultArgument(req, instance, config) {
  var temp = instance;
  var defaultArg = {
    instance,

    $token: new TokenManager(req.cookies.token, config.secret, config.jwt),

    $cookies: req.cookies,
    $headers: req.headers,
    $connection: req.connection,
    $host: req.hostname,
    $secure: req.secure,
    $ip: req.ip,
    $method: req.method,
    $url: req.originalUrl,
    $protocol: req.protocol,
    $subdomains: req.subdomains,
    $xhr: req.xhr
  };
  Object.assign(temp, defaultArg);
  return temp;
}

function getRequestData(req) {
  //TODO: not optimize yet
  var rawData = null;
  switch (req.method) {
    case "POST":
    case "PUT":
      rawData = req.body;
      Object.assign(rawData, req.files);
      break;
    case "GET":
    case "HEAD":
    case "DELETE":
      rawData = req.query;
      break;
  }

  return stringCollectionObject(rawData);
}

module.exports = {
  prepareParam,
  getDefaultArgument
};
