const ModuleManager = require("../index");

var HyronApp = new ModuleManager(3000);
HyronApp.enableModule({ user: require("./users") });
HyronApp.enableFontWare({
  say: {
    handle: function (...arg) {
      console.log("start");
      return arg;
    },
    global:true
  }
});

HyronApp.enableBackWare({
    hi: {
      handle: function(result) {
        console.log("result");
        return result+".hihi";
      },
      global:true
    }
  });

require("./express");
require("./perfomance");
