module.exports = class {
    static requestConfig(){
        return {
            helloWorld : "all",
            getQuery : "get",
            getQueryType : "get",
            postRaw : "post",
            postUpload : "post",
            postUrlEncoding : "post",
            postMultipart : "post",
            restParams : {
                method : "get",
                params : "/:arg1/:arg2"
            }
        }
    }

    helloWorld(){
        return "hello world";
    }

    getQuery(arg1, arg2){
        return arg1+arg2;
    }

    getQueryType(args){
        return args;
    }

    postRaw($body){
        return $body;
    }

    postUpload($body){
        return $body;
    }

    postUrlEncoding(arg1, arg2){
        return arg1+arg2;
    }

    postMultipart(arg1, arg2){
        return arg1+arg2;
    }

    restParams(arg1, arg2){
        return arg1+arg2;
    }

}