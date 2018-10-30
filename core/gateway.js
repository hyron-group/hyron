module.export = class {
    // return another service function by uri, example : /account/login
    getFunctionByURI(uri) {}

    // return another service function by uri, example : account.auth.login
    getFunctionByPath(path) {}
};

class AbstractFunction {
    static initSandBox() {}
    
    bind(args) {}
    
    execute(...args) {}
}

// Support for multi language here
class Runner {
    getJSRunner(){
        return function(thisArgs, args){
        }
    }

    getJavaRunner(){
    }
}