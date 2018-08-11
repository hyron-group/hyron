//TODO: optimize performance (node server native instead express)
//TODO: support for http2
const writelog = require("writelog");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cache = require("static-memory");
const { runFontWare, runBackWare } = require("./middleware");
const routerReport = require("../lib/routerReport");
const { prepareParam, getDefaultArgument } = require("./prepareParams");

module.exports = class RouterFactory {
  build(
    app,
    url,
    moduleFunction,
    config = { requestTimeout: 36000, secret: "" }
  ) {
    this.app = app;
    this.url = url;
    this.moduleFunc = moduleFunction;
    this.config = config;
    this.configMiddleware();
    this.registerModule(url, moduleFunction);
  }

  configMiddleware() {
    this.app.use(cookieParser());
    this.app.use(bodyParser.json());
    this.app.use(
      fileUpload({
        preserveExtension: true
      })
    );
  }

  // Check for first time to detect wrong type in router config
  validateRequestMethod(httpMethod, url, methodName) {
    if (
      ["get", "post", "put", "delete", "head", "all"].indexOf(httpMethod) == -1
    ) {
      throw new Error(
        `Do not support method ${httpMethod} in ${url}: ${methodName}`
      );
    }
  }

  resetToken(res, instance) {
    if (instance.$token.hasChange)
      res.cookie("token", instance.$token.getToken());
  }

  handingCustomResponse(res, data) {
    var result = data;
    if (typeof data == "object") {
      if (data.$headers != null) res.set(data.$headers);
      if (data.$type != null) res.type(data.$type);
      if (data.$status != null) res.status(data.$status);
      if (data.$redirect != null) {
        res.redirect(data.$redirect);
        return;
      }
      if (data.$render != null) {
        if (typeof data.$render == "object")
          res.render(data.$render.path, data.$render.param);
        else res.render(data.$render);
        return;
      }
      if (data.$data != null) result = data.$data;
    }
    res.send(result);
  }

  responseHanding(res, execResult, instance) {
    var result;
    if (execResult instanceof Promise) {
      execResult
        .then(data => {
          this.resetToken(res, instance);
          result = this.handingCustomResponse(res, data);
        })
        .catch(err => {
          var code = err.code;
          if (err.code == null) code = 403;
          res.send(err.message, code);
          throw Error(err);
        });
    } else {
      this.resetToken(res, instance);
      result = this.handingCustomResponse(res, execResult);
    }
  }

  prepareExecuteMiddleware(reqConfig, methodName) {
    var result = {
      httpMethod: null,
      fontware: null,
      backware: null
    };

    var methodConfig = reqConfig[methodName];
    if (typeof methodConfig == "string")
      result.httpMethod = methodConfig.toLowerCase();
    else if (typeof methodConfig == "object") {
      //{method, fontware, backware}
      result.httpMethod = methodConfig.method.toLowerCase();
      result.fontware = methodConfig.fontware;
      result.backware = methodConfig.backware;
    } else throw new Error(`Wrong config data type at ${url}`);

    return result;
  }

  checkIsHyronClass(moduleFunc) {
    if (moduleFunc.requestConfig == null)
      throw new Error(
        `Module ${
          this.url
        }\nMissing method static requestConfig() to setup http listener`
      );
  }

  registerRouter(url, methodName, reqConfig, instance) {
    var executeInfo = this.prepareExecuteMiddleware(reqConfig, methodName);
    var httpMethod = executeInfo.httpMethod;
    var allowFontware = executeInfo.fontware;
    var allowBackware = executeInfo.backware;

    this.validateRequestMethod(httpMethod, url, methodName);
    console.log(`listening ${httpMethod} : ${url + "/" + methodName}`);
    var handler = cache("handle-" + methodName, () => instance[methodName]);

    var routerPath = url + "/" + methodName;

    // routerReport(httpMethod, routerPath, instance[methodName]);

    var execResult = null;

    this.app[httpMethod](routerPath, (req, res) => {
      // support for method-base callback
      try {
        var defaultArgument = getDefaultArgument(req, instance, this.config);
        var paramData = prepareParam(req, methodName, handler);

        paramData = runFontWare(
          methodName,
          allowFontware,
          defaultArgument,
          paramData
        );

        execResult = handler.apply(defaultArgument, paramData);

        execResult = runBackWare(
          methodName,
          allowBackware,
          defaultArgument,
          execResult
        );

        this.responseHanding(res, execResult, defaultArgument);
      } catch (e) {
        writelog("runtime", e.stack, { history: 100, openLog: true });
        res.sendStatus(500);
      }
    });
  }

  registerModule(url, moduleFunc) {
    this.checkIsHyronClass(moduleFunc);
    var instance = new moduleFunc();
    var reqConfig = moduleFunc.requestConfig();
    if (reqConfig != null)
      Object.keys(reqConfig).forEach(methodName => {
        this.registerRouter(url, methodName, reqConfig, instance);
      });
  }
};
