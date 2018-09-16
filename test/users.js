const writelog = require("writelog");
module.exports = class {
    static requestConfig() {
        return {
            showMyName: "get",
            upload: "post",
            sample: "get",
            rs: {
                method: "post",
                enableREST: true
            }
        };
    }

    showMyName(name) {
        /**
         * @param name {type:string, size: 1000}
         */
        return "Nice to meet you, " + name;
    }

    rs(name, data) {
        return data;
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
