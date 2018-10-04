module.exports = class {
    static requestConfig() {
        return {
            showMyName: ["get","post"],
            upload: "post",
            sample: "patch",
            view: {
                method: ["get", "head"],
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
