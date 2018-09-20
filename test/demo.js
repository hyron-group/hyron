const writelog = require("writelog");
module.exports = class {
    static requestConfig() {
        return {
            showMyName: "get",
            upload: "post",
            sample: "get",
            view: {
                method: "get",
                enableREST: true
            }
        };
    }

    showMyName(name) {
        return "Nice to meet you, " + name;
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
