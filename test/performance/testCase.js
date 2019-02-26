module.exports = class {
    static requestConfig(){
        return {
            helloWorld : "all",
            getQuery : "get",
            getQueryType : "get",
            postRaw : "post",
            postUpload : "post",
            getCookieData : "get",
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
        return JSON.stringify(args, null, 4);
    }

    getCookieData($cookie){
        return $cookie;
    }

    postRaw($raw){
        return $raw;
    }

    postUpload($raw){
        return $raw;
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