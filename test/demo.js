module.exports = class {
    static requestConfig() {
        return {
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

    showMyName(name) {
        return "Nice to meet you, " + name;
    }

    showURL(){
        console.log('run')
        return require('../core/moduleManager').findURL(this.upload);
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
        /**
         * @param data {type:ClientFile, size:10000}
         * @param to {type: string}
         */
        return data.content;
    }

    sample() {
        return "hello world";
    }
};
