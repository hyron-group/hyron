const cache = require("static-memory");
const writelog = require("writelog");
// [{name, handle}]
var fontGlobalMiddleware = [];
var backGlobalMiddleware = [];

var routerStore = [];

module.exports.runFontWare = function(
  methodName,
  registeredConfig,
  defaultArg,
  arg
) {
  return runMiddleware(
    methodName,
    registeredConfig,
    defaultArg,
    fontGlobalMiddleware,
    arg
  );
};

module.exports.runBackWare = function(
  methodName,
  registeredConfig,
  defaultArg,
  result
) {
  return runMiddleware(
    methodName,
    registeredConfig,
    defaultArg,
    backGlobalMiddleware,
    [result]
  );
};

function runMiddleware(
  methodName,
  registeredMiddleware,
  defaultArg,
  globalList,
  input
) {
  var allowableRouter = prepareExecuteHandler(
    methodName,
    registeredMiddleware,
    globalList
  );
  for (var i = 0; i < allowableRouter.length; i++) {
    var curHandler = allowableRouter[i];


    input = curHandler.apply(defaultArg, input);

    if (input instanceof Promise) {
      input
        .then(data => {
          var nextHandler = allowableRouter[i++];
          if (nextHandler != null) input = nextHandler.apply(defaultArg, input);
        })
        .catch(err => {
          input = err;
          //skip next middleware and return;
          i = allowableRouter.length - 1;
        });
    }
  }
  return input;
}

function prepareExecuteHandler(
  methodName,
  registeredMiddleware,
  globalMiddleware
) {
  var allowableRouter = cache(() => {
    var buf = [];
    var ignoreRouter = [];
    var allowRouter = [];
    var i = 0;
    if (registeredMiddleware != null)
      registeredMiddleware.forEach(curRegisteredRouter => {
        if (curRegisteredRouter.charAt(0) == "!")
          ignoreRouter.push(curRegisteredRouter.substr(1));
        else allowRouter.push(curRegisteredRouter);
      });

    for (var i = 0; i < globalMiddleware.length; i++) {
      var curRouter = globalMiddleware[i];
      
      if (!ignoreRouter.includes(curRouter.name)) {
        buf.push(curRouter.handle);
        ignoreRouter.splice(i, 1);
      }
    }

    for (var i = 0; i < routerStore.length; i++) {
      var curRouter = routerStore[i];
      if (allowRouter.includes(routerInfo.name)) {
        buf.push(routerInfo.handle);
        allowRouter.splice(i, 1);
      }
    }

    var remainRouter = ignoreRouter.join(allowRouter);
    try {
      if (remainRouter.length > 0)
        throw new Error(
          `can't turn on module ${remainRouter}. Maybe you may not have declared it yet`
        );
    } catch (e) {
      writelog("warning", e, { history: 100 });
    }

    return buf;
  });
  return allowableRouter;
}

module.exports.addRouter = function(midwareList, isFontware) {
  Object.keys(midwareList).forEach(name => {
    var curRouter = midwareList[name];

    var routerInfo;
    if (typeof curRouter == "object")
      routerInfo = { handle: curRouter.handle, name: name };
    else if (typeof curRouter == "function")
      routerInfo = { handle: curRouter, name: name };
    else {
      throw new Error("wrong type of middleware at : " + name);
    }
    if (curRouter.global) {
      if (isFontware) fontGlobalMiddleware.push(routerInfo);
      else backGlobalMiddleware.push(routerInfo);
    } else routerStore.push(routerInfo);
  });
};
