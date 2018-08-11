const app = require("express")();
const RouterFactory = require("./routerFactory");
const writeLog = require("writelog");
const { addRouter } = require("./middleware");
const TokenManager = require("../lib/token");

module.exports = class {
  constructor(
    port = 80,
    host = "localhost",
    config = {
      prefix: "",
      secret: "",
      jwt: ""
    }
  ) {
    this.port = port;
    this.host = host;
    this.prefix = config.prefix != "" ? "/" + config.prefix : "";
    this.secret = TokenManager.generalSecretKey();
    this.config = config;
    
    app.set("x-powered-by",'hyron');
  }

  setting(
    props = {
      sensitive: null,
      env: "development",
      etag: "weak",
      viewsDir: "./",
      viewCache: true,
      viewEngine: null
    }
  ) {
    if(props.sensitive!=null){
      app.set("case sensitive routing",props.sensitive);
      delete props.sensitive;
    }
    if(props.viewsDir!=null){
      app.set("views", props.viewsDir);
      delete props.viewsDir;
    }
    if(props.viewCache!=null){
      app.set("view cache", props.viewCache);
      delete props.viewCache;
    }
    if(props.viewEngine!=null){
      app.set("view engine",props.viewEngine);
      delete props.viewEngine;
    }

    Object.keys(props).forEach(key=>{
      val=props[key];
      app.set(key, val);
    })

  }

  enableFontWare(moduleList) {
    addRouter(moduleList, true);
  }

  enableBackWare(moduleList) {
    addRouter(moduleList, false);
  }

  enableModule(moduleList = {}) {
    return new Promise((resolve, reject) => {
      for (var moduleName in moduleList) {
        var controller = moduleList[moduleName];
        new RouterFactory().build(
          app,
          moduleName==""?this.prefix: this.prefix +"/"+ moduleName,
          controller,
          {
            secret: this.secret,
            jwt: this.config.jwt
          }
        );

        console.log("started module : " + moduleName);
      }

      app.listen(this.port, this.host, err => {
        console.log(`start listener on ${this.getHTTPPart()}\n`);
        if (err != null) reject(err);
        resolve(true);
      });
    });
  }

  getHTTPPart() {
    return `http://${this.host}:${this.port}${this.prefix}/`;
  }
};
