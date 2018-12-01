module.exports = class Demo {
    static requestConfig() {
        return {
            $all:{
                method:'get',
                fontware:['!args-loader']
            },
            showMyName: ["get","post"],
            upload: "post",
            sample: "patch",
            showURL: "get",
            view: {
                method: ["get", "head"],
                enableREST: true
            }
        };
    }

    async showMyName(name) {
        return "Nice to meet you, " + name;
    }

    showURL(){
        var data = [
            require('../type/path').findURL(new Demo().upload),
            require('../type/path').findURL(this.upload),
            require('../type/path').findURL('upload'),
            
        ]
        return data;
    }

    view(path) {
        return {
            $render:{
                path,
                data:{
                    name:'thang'
                }
            }
        };
    }
    upload(data, to) {
         // @param data {type:ClientFile, size:10MB}
         // @param to {nullable: false, type: string}
        return to;
    }

    sample() {
        return "hello world";
    }
};
