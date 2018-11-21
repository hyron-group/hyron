/**
 * [future]
 * Gateway used to support for multi language.
 * with that, we can call another service with difference language.
 * You also can write service in other language like Java, C++ or Python, etc
 * hyron will act as the top layer, communicate with the client
 * And you can still use its plugins as with native js.
 * This will help to take advantage of the friendliness and flexibility of NodeJS
 * And the features of other languages according to specific requirements depend on the business logic in your application
 * 
 * service with other languages through the gateway also needs to follow the rules that hyron rules.
 * As returning static requestConfig, the description of the router, the config router is still inheriting the properties as native js
 */

module.export = class {
    // return another service function by uri, example : /account/login
    getFunctionByURI(uri) {}

    // return another service function by uri, example : account.login
    getFunctionByPath(path) {}
};

class AbstractFunction {
    static initSandBox() {}

    bind(args) {}

    execute(...args) {}
}

// Support for multi language here
class Runner {
    getJSRunner() {
        return function(thisArgs, args) {};
    }

    getJavaRunner() {}
}
