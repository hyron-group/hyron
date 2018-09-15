const writelog = require("writelog");
module.exports = class {
    static requestConfig() {
        return {
            showMyName: "get",
            upload: "post",
            sample: "get"
        };
    }

    showMyName(name) {
        /**
         * @param name {type:string, size: 1000}
         */
        return "Nice to meet you, " + name;
    }

    showHeader() {
        return "This is req heeader : " + this.$headers;
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
