const writelog = require('writelog');

module.exports = class {
    static requestConfig() {
        return {

        }
    }

    testGetParams(stringType, numberType, booleanType, arrayType, objectType) {
        writelog("type", "get param\n"+JSON.stringify(argumentsm, null, 4));
        return typeof stringType == "string" &
            typeof numberType == "number" &
            typeof booleanType == "boolean" &
            (arrayType instanceof Array) &
            typeof objectType == "object";
    }

    testGetRestParams(param, arg1, arg2){
        
    }
}
