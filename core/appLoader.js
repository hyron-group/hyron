var hyron = require('./moduleManager');

function loadFromFile(path){
    var appMeta = require(path);
    if(appMeta instanceof Array){
        appMeta.forEach(childPath=>{
            loadFromFile(childPath)
        })
    } else if(appMeta instanceof Object){
        var appInstance = hyron.getInstance(appMeta.base_url);
        appInstance.setting(appMeta.setting);
        appInstance.enableAddons(appMeta.addons);
        appInstance.enablePlugins(appMeta.plugins);
        appInstance.enableServices(appMeta.services);
        appInstance.startServer();
    } throw new TypeError(`can't load hyron build file`);
}

loadFromFile("../app.json");
