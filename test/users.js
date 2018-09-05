const writelog = require('writelog');
module.exports = class {
    static requestConfig(){
        return {
            showMyName:'get',
            upload:'post',
            sample:'get',
            express:"get",
            
        }
    }

    showMyName(name){
        /**
         * @param name {type:string, size: 10}
         */
        return "Nice to meet you, "+JSON.stringify(name);
    }
    showHeader(){
        return "This is req heeader : "+this.$headers
    }
    upload(data, to){
        /**
        * @param data {type:*, size:100}
        * @param to {type: string}
        */
        return data;
    }

    express(req, res){
        this.token.set("key", "val");
        console.log(this.token.getToken());
        return this.token;
    }

    sample() {
        return "hello world";
    }
}