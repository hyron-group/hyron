const writelog = require('writelog');
module.exports = class {
    static requestConfig(){
        return {
            showMyName:'get',
            upload:'all',
            sample:'get',
            express:"get"
        }
    }

    showMyName(name){
        console.log(name);
        return "Nice to meet you, "+JSON.stringify(name);
    }
    upload(data, to){
        return Object.keys(data);
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